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
   * Get user information by user ID
   * 
   * @param {string} userId - Jellyfin user ID
   * @returns {Promise<Object>} User information
   */
  async getUserById(userId) {
    try {
      const response = await this.http.get(`/Users/${userId}`)
      return response.data
    } catch (error) {
      throw new Error(`Failed to get user by ID: ${error.message}`)
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
      // First, get all series-level items with enhanced fields
      const seriesResponse = await this.http.get(`/Users/${userId}/Items`, {
        params: {
          IncludeItemTypes: 'Series',
          Recursive: true,
          Fields: 'ProviderIds,Overview,Genres,Studios,People,SeriesInfo,UserData,ChildCount,RecursiveItemCount',
          SortBy: 'SortName',
          SortOrder: 'Ascending'
        }
      })

      // Filter for anime content based on genres, studios, or provider IDs
      const animeItems = seriesResponse.data.Items.filter(item => {
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
        
        const hasAnimeProvider = providerIds.MyAnimeList
        
        return hasAnimeGenre || hasAnimeStudio || hasAnimeProvider
      })

      // Efficiently fetch all episodes to calculate watch statistics
      const allEpisodesResponse = await this.http.get(`/Users/${userId}/Items`, {
        params: {
          IncludeItemTypes: 'Episode',
          Recursive: true,
          Fields: 'UserData,SeriesId', // Request SeriesId to link episodes to series
        }
      })
      const allEpisodes = allEpisodesResponse.data.Items || []

      // Aggregate episode stats by SeriesId
      const seriesStats = allEpisodes.reduce((stats, episode) => {
        const { SeriesId } = episode
        if (SeriesId) {
          if (!stats[SeriesId]) {
            stats[SeriesId] = { watchedEpisodes: 0, totalEpisodes: 0 }
          }
          stats[SeriesId].totalEpisodes++
          if (episode.UserData?.Played) {
            stats[SeriesId].watchedEpisodes++
          }
        }
        return stats
      }, {})

      // For each anime series, enrich with calculated episode data
      const detailedAnimeItems = animeItems.map(series => {
        const stats = seriesStats[series.Id]
        if (stats && stats.totalEpisodes > 0) {
          const watchPercentage = (stats.watchedEpisodes / stats.totalEpisodes) * 100
          
          return {
            ...series,
            ChildCount: stats.totalEpisodes,
            UserData: {
              ...series.UserData,
              PlayCount: stats.watchedEpisodes,
              PlayedPercentage: watchPercentage,
              TotalEpisodes: stats.totalEpisodes,
              WatchedEpisodes: stats.watchedEpisodes
            }
          }
        }
        // Return original series if no episode stats are found
        return series
      })

      return detailedAnimeItems
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
   * Extract anime information for MAL matching and local database sync
   * 
   * @param {Object} jellyfinItem - Jellyfin item object
   * @returns {Object} Structured anime information for matching and sync
   */
  extractAnimeInfo(jellyfinItem) {
    const providerIds = jellyfinItem.ProviderIds || {}
    const userData = jellyfinItem.UserData || {}
    
    return {
      // Basic identifiers
      jellyfinId: jellyfinItem.Id,
      title: jellyfinItem.Name,
      seriesName: jellyfinItem.SeriesName || jellyfinItem.Name,
      seasonNumber: jellyfinItem.ParentIndexNumber,
      episodeNumber: jellyfinItem.IndexNumber,
      
      // External IDs for matching
      malId: providerIds.MyAnimeList ? parseInt(providerIds.MyAnimeList) : null,
      
      // Content information
      year: jellyfinItem.ProductionYear,
      releaseDate: jellyfinItem.PremiereDate,
      overview: jellyfinItem.Overview,
      genres: jellyfinItem.Genres || [],
      studios: (jellyfinItem.Studios || []).map(s => s.Name || s),
      type: jellyfinItem.Type,
      
      // Episode and watch information
      totalEpisodes: userData.TotalEpisodes || jellyfinItem.ChildCount || 0,
      watchedEpisodes: userData.WatchedEpisodes || userData.PlayCount || 0,
      watchPercentage: userData.PlayedPercentage || 0,
      isWatched: userData.Played || false,
      
      // Alternative titles for better matching
      alternativeTitles: this.extractAlternativeTitles(jellyfinItem),
      
      // Image information
      imageUrl: this.getImageUrl(jellyfinItem.Id, 'Primary'),
      
      // Provider IDs (legacy format for compatibility)
      providerIds: {
        mal: providerIds.MyAnimeList
      },
      
      // User data
      userData: userData
    }
  }

  /**
   * Extract alternative titles from Jellyfin item
   * 
   * @param {Object} jellyfinItem - Jellyfin item object
   * @returns {Array} Array of alternative titles
   */
  extractAlternativeTitles(jellyfinItem) {
    const titles = []
    
    // Add original title if different from display name
    if (jellyfinItem.OriginalTitle && jellyfinItem.OriginalTitle !== jellyfinItem.Name) {
      titles.push(jellyfinItem.OriginalTitle)
    }
    
    // Add sort name if different
    if (jellyfinItem.SortName && jellyfinItem.SortName !== jellyfinItem.Name) {
      titles.push(jellyfinItem.SortName)
    }
    
    return titles
  }

  /**
   * Get image URL for a Jellyfin item
   * 
   * @param {string} itemId - Jellyfin item ID
   * @param {string} imageType - Type of image (Primary, Backdrop, etc.)
   * @returns {string} Image URL
   */
  getImageUrl(itemId, imageType = 'Primary') {
    if (!this.serverUrl || !itemId) return null
    return `${this.serverUrl}/Items/${itemId}/Images/${imageType}`
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