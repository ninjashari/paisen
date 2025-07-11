/**
 * Anime Matching Service
 * 
 * This module provides intelligent matching between Jellyfin anime content
 * and MyAnimeList entries. It uses multiple matching strategies to ensure
 * accurate identification of anime series and episodes.
 * 
 * Matching Strategies:
 * - Direct provider ID matching (MAL ID)
 * - Exact title matching with normalization
 * - Fuzzy title matching with similarity scoring
 * - Year and episode count validation
 * - Alternative title matching
 */

import MalApi from './malApi.js'

class AnimeMatchingService {
  constructor(malAccessToken) {
    this.malApi = new MalApi(malAccessToken)
    this.matchCache = new Map() // Cache successful matches
  }

  /**
   * Find MAL anime entry that matches Jellyfin anime information
   * 
   * @param {Object} jellyfinAnime - Anime information from Jellyfin
   * @returns {Promise<Object|null>} Matched MAL anime entry or null
   */
  async findMalMatch(jellyfinAnime) {
    // Check cache first
    const cacheKey = this.generateCacheKey(jellyfinAnime)
    if (this.matchCache.has(cacheKey)) {
      return this.matchCache.get(cacheKey)
    }

    let match = null

    try {
      // Strategy 1: Direct MAL ID match
      if (jellyfinAnime.providerIds.mal) {
        match = await this.matchByMalId(jellyfinAnime.providerIds.mal)
        if (match) {
          this.matchCache.set(cacheKey, match)
          return match
        }
      }

      // Strategy 2: Title-based search with validation
      match = await this.matchByTitle(jellyfinAnime)
      if (match) {
        this.matchCache.set(cacheKey, match)
        return match
      }

      // No match found
      console.log(`No MAL match found for: ${jellyfinAnime.title}`)
      return null

    } catch (error) {
      console.error('Error finding MAL match:', error)
      return null
    }
  }

  /**
   * Match anime by MAL ID directly (highest confidence)
   * 
   * @param {number} malId - MAL ID
   * @returns {Promise<Object|null>} MAL anime entry or null
   */
  async matchByMalId(malId) {
    try {
      // First, check local database for existing entry
      const localAnime = await this.findAnimeByExternalId('mal', malId)
      if (localAnime) {
        return {
          id: localAnime.malId,
          title: localAnime.title,
          matchMethod: 'mal_local',
          confidence: 1.0,
          localData: localAnime
        }
      }

      // Fetch from MAL API
      const malAnime = await this.malApi.getAnimeDetails(malId)
      if (malAnime && malAnime.data) {
        return {
          ...malAnime.data,
          matchMethod: 'mal_api',
          confidence: 1.0
        }
      }

      return null
    } catch (error) {
      console.error('Error matching by MAL ID:', error)
      return null
    }
  }



  /**
   * Find anime in local database by external ID
   * 
   * @param {string} idType - Type of external ID (mal, anidb)
   * @param {number} idValue - External ID value
   * @returns {Promise<Object|null>} Local anime entry or null
   */
  async findAnimeByExternalId(idType, idValue) {
    try {
      // Import Anime model dynamically to avoid circular dependencies
      const { default: Anime } = await import('../models/Anime.js')
      return await Anime.findByExternalId(idType, idValue)
    } catch (error) {
      console.error('Error finding anime by external ID:', error)
      return null
    }
  }

  /**
   * Match anime by title using MAL search
   * 
   * @param {Object} jellyfinAnime - Jellyfin anime information
   * @returns {Promise<Object|null>} Best matching MAL anime entry or null
   */
  async matchByTitle(jellyfinAnime) {
    try {
      const searchTitle = this.normalizeTitle(jellyfinAnime.title || jellyfinAnime.seriesName)
      
      // Search MAL for potential matches
      const searchResults = await this.malApi.getSearchAnimeList(searchTitle, {
        animeList: ['id', 'title', 'num_episodes', 'media_type', 'status']
      })

      if (!searchResults.data || !searchResults.data.data) {
        return null
      }

      const candidates = searchResults.data.data
      let bestMatch = null
      let bestScore = 0

      for (const candidate of candidates) {
        const score = this.calculateMatchScore(jellyfinAnime, candidate)
        
        if (score > bestScore && score >= 0.7) { // Minimum confidence threshold
          bestScore = score
          bestMatch = {
            ...candidate,
            matchMethod: 'title_search',
            confidence: score
          }
        }
      }

      return bestMatch
    } catch (error) {
      console.error('Error matching by title:', error)
      return null
    }
  }

  /**
   * Calculate match score between Jellyfin anime and MAL candidate
   * 
   * @param {Object} jellyfinAnime - Jellyfin anime information
   * @param {Object} malCandidate - MAL anime candidate
   * @returns {number} Match score between 0 and 1
   */
  calculateMatchScore(jellyfinAnime, malCandidate) {
    let score = 0
    let factors = 0

    // Title similarity (most important factor)
    const titleScore = this.calculateTitleSimilarity(jellyfinAnime, malCandidate)
    score += titleScore * 0.6
    factors += 0.6

    // Year matching
    if (jellyfinAnime.year && malCandidate.start_date) {
      const malYear = new Date(malCandidate.start_date).getFullYear()
      if (Math.abs(jellyfinAnime.year - malYear) <= 1) {
        score += 0.2
      }
      factors += 0.2
    }

    // Media type validation (prefer TV series for multi-episode content)
    if (malCandidate.media_type === 'tv' || malCandidate.media_type === 'ova') {
      score += 0.1
    }
    factors += 0.1

    // Episode count validation (if available)
    if (malCandidate.num_episodes && malCandidate.num_episodes > 0) {
      score += 0.1
    }
    factors += 0.1

    return factors > 0 ? score / factors : 0
  }

  /**
   * Calculate title similarity between Jellyfin and MAL anime
   * 
   * @param {Object} jellyfinAnime - Jellyfin anime information
   * @param {Object} malCandidate - MAL anime candidate
   * @returns {number} Similarity score between 0 and 1
   */
  calculateTitleSimilarity(jellyfinAnime, malCandidate) {
    const jellyfinTitle = this.normalizeTitle(jellyfinAnime.title || jellyfinAnime.seriesName)
    
    // Check main title
    const mainTitle = this.normalizeTitle(malCandidate.title)
    let maxSimilarity = this.stringSimilarity(jellyfinTitle, mainTitle)

    // Check alternative titles
    if (malCandidate.alternative_titles) {
      const altTitles = [
        ...(malCandidate.alternative_titles.synonyms || []),
        ...(malCandidate.alternative_titles.en ? [malCandidate.alternative_titles.en] : []),
        ...(malCandidate.alternative_titles.ja ? [malCandidate.alternative_titles.ja] : [])
      ]

      for (const altTitle of altTitles) {
        const normalizedAlt = this.normalizeTitle(altTitle)
        const similarity = this.stringSimilarity(jellyfinTitle, normalizedAlt)
        maxSimilarity = Math.max(maxSimilarity, similarity)
      }
    }

    return maxSimilarity
  }

  /**
   * Normalize anime title for comparison
   * 
   * @param {string} title - Original title
   * @returns {string} Normalized title
   */
  normalizeTitle(title) {
    if (!title) return ''
    
    return title
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .replace(/\b(season|s)\s*\d+/g, '') // Remove season indicators
      .replace(/\b(part|pt)\s*\d+/g, '') // Remove part indicators
      .replace(/\b(tv|ova|movie|special)\b/g, '') // Remove media type indicators
      .trim()
  }

  /**
   * Calculate string similarity using Levenshtein distance
   * 
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Similarity score between 0 and 1
   */
  stringSimilarity(str1, str2) {
    if (str1 === str2) return 1.0
    if (!str1 || !str2) return 0.0

    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1

    if (longer.length === 0) return 1.0

    const distance = this.levenshteinDistance(longer, shorter)
    return (longer.length - distance) / longer.length
  }

  /**
   * Calculate Levenshtein distance between two strings
   * 
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Edit distance
   */
  levenshteinDistance(str1, str2) {
    const matrix = []

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          )
        }
      }
    }

    return matrix[str2.length][str1.length]
  }

  /**
   * Generate cache key for anime matching
   * 
   * @param {Object} jellyfinAnime - Jellyfin anime information
   * @returns {string} Cache key
   */
  generateCacheKey(jellyfinAnime) {
    const title = jellyfinAnime.title || jellyfinAnime.seriesName || ''
    const year = jellyfinAnime.year || ''
    const malId = jellyfinAnime.providerIds.mal || ''
    
    return `${title}|${year}|${malId}`.toLowerCase()
  }

  /**
   * Clear the match cache
   */
  clearCache() {
    this.matchCache.clear()
  }

  /**
   * Get cache statistics
   * 
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    return {
      size: this.matchCache.size,
      keys: Array.from(this.matchCache.keys())
    }
  }
}

export default AnimeMatchingService 