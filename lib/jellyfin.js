/**
 * Jellyfin API Integration Library
 * 
 * This module provides comprehensive integration with Jellyfin media servers,
 * enabling authentication, media queries, and user activity tracking for
 * automatic anime list synchronization with MyAnimeList.
 * 
 * Key Features:
 * - Server authentication and session management
 * - Media library queries and filtering
 * - User playback activity monitoring
 * - Anime series and episode identification
 */

import axios from 'axios'

class JellyfinApi {
  constructor(serverUrl, apiKey, userId = null) {
    this.serverUrl = serverUrl.replace(/\/$/, '') // Remove trailing slash
    this.apiKey = apiKey
    this.userId = userId
    
    // Configure axios instance for Jellyfin API calls
    this.http = axios.create({
      baseURL: `${this.serverUrl}/emby`,
      headers: {
        'X-Emby-Token': this.apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    })
  }

  /**
   * Test connection to Jellyfin server
   * 
   * @returns {Promise<Object>} Server information if successful
   * @throws {Error} If connection fails
   */
  async testConnection() {
    try {
      const response = await this.http.get('/System/Info')
      return {
        success: true,
        serverName: response.data.ServerName,
        version: response.data.Version,
        id: response.data.Id
      }
    } catch (error) {
      let errorMessage = 'Failed to connect to Jellyfin server'
      
      if (error.code === 'ECONNREFUSED') {
        errorMessage = `Connection refused - Jellyfin server is not running or not accessible at ${this.serverUrl}`
      } else if (error.code === 'ENOTFOUND') {
        errorMessage = `Server not found - Check if the server URL is correct: ${this.serverUrl}`
      } else if (error.code === 'ETIMEDOUT') {
        errorMessage = `Connection timeout - Server is taking too long to respond: ${this.serverUrl}`
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed - Check if your API key is correct'
      } else if (error.response?.status === 403) {
        errorMessage = 'Access forbidden - API key may not have sufficient permissions'
      } else if (error.response?.status === 404) {
        errorMessage = 'Jellyfin API endpoint not found - Check server URL and version compatibility'
      } else if (error.response?.status >= 500) {
        errorMessage = 'Jellyfin server error - The server encountered an internal error'
      } else if (error.message) {
        errorMessage = `Connection failed: ${error.message}`
      }
      
      throw new Error(errorMessage)
    }
  }

  /**
   * Get user information by username
   * 
   * @param {string} username - Jellyfin username
   * @returns {Promise<Object>} User information
   */
  async getUserByName(username) {
    try {
      const response = await this.http.get('/Users')
      const user = response.data.find(u => u.Name.toLowerCase() === username.toLowerCase())
      
      if (!user) {
        throw new Error(`User '${username}' not found`)
      }
      
      return user
    } catch (error) {
      throw new Error(`Failed to get user: ${error.message}`)
    }
  }

  /**
   * Get anime items from user's library
   * 
   * @param {string} userId - Jellyfin user ID
   * @returns {Promise<Array>} Array of anime items
   */
  async getAnimeItems(userId) {
    try {
      const response = await this.http.get(`/Users/${userId}/Items`, {
        params: {
          IncludeItemTypes: 'Series,Season,Episode',
          Recursive: true,
          Fields: 'ProviderIds,Overview,Genres,Studios,People,SeriesInfo,SeasonUserData',
          GenreIds: '', // We'll filter by anime-related genres
          SortBy: 'SortName',
          SortOrder: 'Ascending'
        }
      })

      // Filter for anime content based on genres, studios, or provider IDs
      const animeItems = response.data.Items.filter(item => {
        const genres = item.Genres || []
        const studios = item.Studios || []
        const providerIds = item.ProviderIds || {}
        
        // Check for anime indicators
        const hasAnimeGenre = genres.some(genre => 
          ['anime', 'animation'].includes(genre.toLowerCase())
        )
        
        const hasAnimeStudio = studios.some(studio =>
          this.isAnimeStudio(studio.Name)
        )
        
        const hasAnimeProvider = providerIds.AniDb || providerIds.MyAnimeList
        
        return hasAnimeGenre || hasAnimeStudio || hasAnimeProvider
      })

      return animeItems
    } catch (error) {
      throw new Error(`Failed to get anime items: ${error.message}`)
    }
  }

  /**
   * Get user's playback sessions and activity
   * 
   * @param {string} userId - Jellyfin user ID
   * @returns {Promise<Array>} Array of recent playback sessions
   */
  async getUserActivity(userId) {
    try {
      const response = await this.http.get(`/Users/${userId}/Items`, {
        params: {
          IncludeItemTypes: 'Episode',
          Recursive: true,
          Fields: 'UserData,SeriesInfo,SeasonInfo',
          Filters: 'IsPlayed,IsResumable',
          SortBy: 'DatePlayed',
          SortOrder: 'Descending',
          Limit: 50
        }
      })

      return response.data.Items
    } catch (error) {
      throw new Error(`Failed to get user activity: ${error.message}`)
    }
  }

  /**
   * Get detailed information about a specific item
   * 
   * @param {string} itemId - Jellyfin item ID
   * @param {string} userId - Jellyfin user ID
   * @returns {Promise<Object>} Detailed item information
   */
  async getItemDetails(itemId, userId) {
    try {
      const response = await this.http.get(`/Users/${userId}/Items/${itemId}`, {
        params: {
          Fields: 'ProviderIds,Overview,Genres,Studios,People,SeriesInfo,SeasonInfo,UserData'
        }
      })

      return response.data
    } catch (error) {
      throw new Error(`Failed to get item details: ${error.message}`)
    }
  }

  /**
   * Extract anime information for MAL matching
   * 
   * @param {Object} jellyfinItem - Jellyfin item object
   * @returns {Object} Structured anime information for matching
   */
  extractAnimeInfo(jellyfinItem) {
    const providerIds = jellyfinItem.ProviderIds || {}
    
    return {
      jellyfinId: jellyfinItem.Id,
      title: jellyfinItem.Name,
      seriesName: jellyfinItem.SeriesName,
      seasonNumber: jellyfinItem.ParentIndexNumber,
      episodeNumber: jellyfinItem.IndexNumber,
      year: jellyfinItem.ProductionYear,
      overview: jellyfinItem.Overview,
      genres: jellyfinItem.Genres || [],
      studios: (jellyfinItem.Studios || []).map(s => s.Name),
      providerIds: {
        anidb: providerIds.AniDb,
        mal: providerIds.MyAnimeList,
        tvdb: providerIds.Tvdb,
        imdb: providerIds.Imdb
      },
      userData: jellyfinItem.UserData || {}
    }
  }

  /**
   * Check if a studio is known to produce anime
   * 
   * @param {string} studioName - Studio name to check
   * @returns {boolean} True if studio is known anime producer
   */
  isAnimeStudio(studioName) {
    const animeStudios = [
      'Studio Ghibli', 'Toei Animation', 'Madhouse', 'Bones', 'Pierrot',
      'Sunrise', 'Mappa', 'Wit Studio', 'A-1 Pictures', 'Kyoto Animation',
      'Production I.G', 'Shaft', 'Trigger', 'Ufotable', 'Doga Kobo',
      'J.C.Staff', 'White Fox', 'CloverWorks', 'Studio Deen', 'Gonzo'
    ]
    
    return animeStudios.some(studio => 
      studioName.toLowerCase().includes(studio.toLowerCase())
    )
  }

  /**
   * Parse webhook payload from Jellyfin
   * 
   * @param {Object} payload - Webhook payload from Jellyfin
   * @returns {Object} Parsed playback event information
   */
  parseWebhookPayload(payload) {
    return {
      eventType: payload.NotificationType,
      userId: payload.UserId,
      itemId: payload.ItemId,
      itemType: payload.ItemType,
      itemName: payload.Name,
      seriesName: payload.SeriesName,
      seasonNumber: payload.SeasonNumber,
      episodeNumber: payload.EpisodeNumber,
      playbackPosition: payload.PlaybackPositionTicks,
      runtime: payload.RunTimeTicks,
      timestamp: new Date(payload.UtcTimestamp || Date.now())
    }
  }
}

export default JellyfinApi 