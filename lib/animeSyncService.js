/**
 * Anime Sync Service
 * 
 * This service handles synchronization between MyAnimeList and the local anime database.
 * It provides functionality to:
 * - Sync user's MAL anime list to local database
 * - Fetch and store external ID mappings (AniDB, TVDB, TMDB)
 * - Handle incremental and full sync operations
 * - Manage sync errors and retries
 * 
 * External ID Mapping Sources:
 * - AniDB IDs: From MAL API (when available) or external mapping services
 * - TVDB/TMDB IDs: From external mapping databases
 */

import MalApi from './malApi'
import Anime from '../models/Anime'
import User from '../models/User'
import axios from 'axios'
import mongoose from 'mongoose'
import syncProgressTracker from './syncProgress'

class AnimeSyncService {
  constructor(userId, malAccessToken, sessionId = null) {
    // Ensure userId is an ObjectId
    this.userId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId
    this.malApi = new MalApi(malAccessToken)
    this.malAccessToken = malAccessToken
    this.sessionId = sessionId || `sync_${userId}_${Date.now()}`
    this.syncStats = {
      processed: 0,
      created: 0,
      updated: 0,
      errors: 0,
      skipped: 0,
    }
  }

  /**
   * Perform full sync of user's MAL anime list to local database
   * 
   * @param {Object} options - Sync options
   * @param {boolean} options.includeExternalIds - Whether to fetch external IDs
   * @param {boolean} options.forceUpdate - Force update even if recently synced
   * @param {Array<string>} options.statusFilter - Only sync specific statuses
   * @returns {Promise<Object>} Sync results and statistics
   */
  async syncUserAnimeList(options = {}) {
    const {
      includeExternalIds = true,
      forceUpdate = false,
      statusFilter = ['watching', 'completed', 'on_hold', 'dropped', 'plan_to_watch']
    } = options

    console.log(`Starting anime list sync for user ${this.userId}`)
    this.syncStats = { processed: 0, created: 0, updated: 0, errors: 0, skipped: 0 }

    try {
      // Get user's anime list from MAL for each status
      const allAnimeEntries = []
      
      // Start progress tracking
      syncProgressTracker.startSession(this.sessionId, 0, 'mal_sync')
      syncProgressTracker.updateProgress(this.sessionId, {
        message: 'Fetching anime list from MyAnimeList...'
      })
      
      for (const status of statusFilter) {
        try {
          console.log(`Fetching ${status} anime from MAL...`)
          syncProgressTracker.updateProgress(this.sessionId, {
            message: `Fetching ${status} anime from MAL...`
          })
          
          const response = await this.malApi.getAnimeList({
            animeList: [
              'id', 'title', 'genres', 'media_type', 'status', 'num_episodes',
              'my_list_status', 'updated_at'
            ]
          }, status)

          if (response.data && response.data.data) {
            allAnimeEntries.push(...response.data.data)
          }
        } catch (error) {
          console.error(`Error fetching ${status} anime:`, error.message)
          this.syncStats.errors++
          syncProgressTracker.incrementProgress(this.sessionId, `Error fetching ${status}`, 'error')
        }
      }

      console.log(`Found ${allAnimeEntries.length} anime entries to process`)

      // Update total items for progress tracking
      syncProgressTracker.updateProgress(this.sessionId, {
        totalItems: allAnimeEntries.length,
        message: `Processing ${allAnimeEntries.length} anime entries...`
      })

      // Process each anime entry
      for (const animeEntry of allAnimeEntries) {
        await this.processAnimeEntry(animeEntry, { includeExternalIds, forceUpdate })
      }

      // Update user's last sync time
      await User.findByIdAndUpdate(this.userId, {
        'syncMetadata.lastAnimeSync': new Date(),
        'syncMetadata.lastSyncStats': this.syncStats,
      })

      console.log('Anime sync completed:', this.syncStats)
      
      // Complete progress tracking
      syncProgressTracker.completeSession(this.sessionId, true, 
        `Sync completed: ${this.syncStats.created} created, ${this.syncStats.updated} updated, ${this.syncStats.errors} errors`
      )
      
      return {
        success: true,
        stats: this.syncStats,
        sessionId: this.sessionId,
        message: `Sync completed: ${this.syncStats.created} created, ${this.syncStats.updated} updated, ${this.syncStats.errors} errors`
      }

    } catch (error) {
      console.error('Anime sync failed:', error)
      
      // Fail progress tracking
      syncProgressTracker.failSession(this.sessionId, error.message)
      
      return {
        success: false,
        error: error.message,
        stats: this.syncStats,
        sessionId: this.sessionId
      }
    }
  }

  /**
   * Process a single anime entry from MAL
   * 
   * @param {Object} animeEntry - MAL anime entry
   * @param {Object} options - Processing options
   */
  async processAnimeEntry(animeEntry, options = {}) {
    const { includeExternalIds = true, forceUpdate = false } = options
    
    try {
      this.syncStats.processed++
      const animeData = animeEntry.node
      const userListStatus = animeData.my_list_status

      // Update progress
      syncProgressTracker.incrementProgress(this.sessionId, animeData.title, 'processed')

      // Check if anime already exists in local database
      let existingAnime = await Anime.findOne({ malId: animeData.id })
      
      if (existingAnime && !forceUpdate) {
        // Check if we need to update based on last sync time
        const hoursSinceLastSync = (Date.now() - existingAnime.syncMetadata.lastSyncedFromMal) / (1000 * 60 * 60)
        
        if (hoursSinceLastSync < 24) {
          // Update user list status only
          if (userListStatus) {
            existingAnime.updateUserListStatus(this.userId, {
              status: userListStatus.status,
              score: userListStatus.score,
              num_episodes_watched: userListStatus.num_episodes_watched,
              is_rewatching: userListStatus.is_rewatching,
              start_date: userListStatus.start_date ? new Date(userListStatus.start_date) : null,
              finish_date: userListStatus.finish_date ? new Date(userListStatus.finish_date) : null,
              priority: userListStatus.priority,
              num_times_rewatched: userListStatus.num_times_rewatched,
              rewatch_value: userListStatus.rewatch_value,
              tags: userListStatus.tags || [],
              comments: userListStatus.comments,
            })
            await existingAnime.save()
          }
          this.syncStats.skipped++
          return
        }
      }

              // Prepare minimal anime data for database (only essential fields for our website)
        const animeDbData = {
          malId: animeData.id || null,
          title: animeData.title,
          genres: animeData.genres || [],
          media_type: animeData.media_type,
          status: animeData.status,
          num_episodes: animeData.num_episodes || 0,
          syncMetadata: {
            lastSyncedFromMal: new Date(),
            lastUpdatedOnMal: animeData.updated_at ? new Date(animeData.updated_at) : null,
            syncVersion: 1,
            isActive: true,
          }
        }

      // Fetch external IDs if requested
      if (includeExternalIds) {
        animeDbData.externalIds = await this.fetchExternalIds(animeData.id, animeData.title)
      }

              if (existingAnime) {
          // Update existing anime
          Object.assign(existingAnime, animeDbData)
          
          // Update progress
          syncProgressTracker.incrementProgress(this.sessionId, animeData.title, 'updated')
          
          // Update user list status
          if (userListStatus) {
            existingAnime.updateUserListStatus(this.userId, {
            status: userListStatus.status,
            score: userListStatus.score,
            num_episodes_watched: userListStatus.num_episodes_watched,
            is_rewatching: userListStatus.is_rewatching,
            start_date: userListStatus.start_date ? new Date(userListStatus.start_date) : null,
            finish_date: userListStatus.finish_date ? new Date(userListStatus.finish_date) : null,
            priority: userListStatus.priority,
            num_times_rewatched: userListStatus.num_times_rewatched,
            rewatch_value: userListStatus.rewatch_value,
            tags: userListStatus.tags || [],
            comments: userListStatus.comments,
          })
        }
        
        await existingAnime.save()
        this.syncStats.updated++
        
      } else {
        // Create new anime entry
        const newAnime = new Anime(animeDbData)
        
        // Update progress
        syncProgressTracker.incrementProgress(this.sessionId, animeData.title, 'added')
        
        // Add user list status
        if (userListStatus) {
          newAnime.updateUserListStatus(this.userId, {
            status: userListStatus.status,
            score: userListStatus.score,
            num_episodes_watched: userListStatus.num_episodes_watched,
            is_rewatching: userListStatus.is_rewatching,
            start_date: userListStatus.start_date ? new Date(userListStatus.start_date) : null,
            finish_date: userListStatus.finish_date ? new Date(userListStatus.finish_date) : null,
            priority: userListStatus.priority,
            num_times_rewatched: userListStatus.num_times_rewatched,
            rewatch_value: userListStatus.rewatch_value,
            tags: userListStatus.tags || [],
            comments: userListStatus.comments,
          })
        }
        
        await newAnime.save()
        this.syncStats.created++
      }

    } catch (error) {
      console.error(`Error processing anime ${animeEntry.node?.id}:`, error.message)
      this.syncStats.errors++
      
      // Update progress with error
      syncProgressTracker.incrementProgress(this.sessionId, animeEntry.node?.title || 'Unknown', 'error')
    }
  }

  /**
   * Fetch external IDs for an anime from various mapping sources
   * 
   * @param {number} malId - MyAnimeList ID
   * @param {string} title - Anime title for fallback matching
   * @returns {Promise<Object>} External IDs object
   */
  async fetchExternalIds(malId, title) {
    const externalIds = {}

    try {
      // Try to get AniDB ID from MAL API (if available in response)
      // Note: MAL API doesn't directly provide AniDB IDs, so we'll use external mapping
      
      // Method 1: Try shinkrodb mapping service
      try {
        const mappingResponse = await axios.get(
          `https://raw.githubusercontent.com/varoOP/shinkrodb/main/malid-anidbid-tvdbid-tmdbid.json`,
          { timeout: 10000 }
        )
        
        if (mappingResponse.data) {
          const animeMapping = mappingResponse.data.find(entry => entry.malId === malId)
          if (animeMapping) {
            if (animeMapping.anidbId) externalIds.anidb = animeMapping.anidbId
            if (animeMapping.tvdbId) externalIds.tvdb = animeMapping.tvdbId
            if (animeMapping.tmdbId) externalIds.tmdb = animeMapping.tmdbId
          }
        }
      } catch (mappingError) {
        console.log(`Mapping service unavailable for MAL ID ${malId}:`, mappingError.message)
      }

      // Method 2: Try anime-offline-database (backup method)
      if (!externalIds.anidb) {
        try {
          const offlineDbResponse = await axios.get(
            'https://raw.githubusercontent.com/manami-project/anime-offline-database/master/anime-offline-database-minified.json',
            { timeout: 15000 }
          )
          
          if (offlineDbResponse.data && offlineDbResponse.data.data) {
            const animeEntry = offlineDbResponse.data.data.find(entry => {
              return entry.sources.some(source => 
                source.includes(`myanimelist.net/anime/${malId}`)
              )
            })
            
            if (animeEntry) {
              // Extract AniDB ID from sources
              const anidbSource = animeEntry.sources.find(source => source.includes('anidb.net'))
              if (anidbSource) {
                const anidbMatch = anidbSource.match(/anidb\.net\/anime\/(\d+)/)
                if (anidbMatch) {
                  externalIds.anidb = parseInt(anidbMatch[1])
                }
              }
            }
          }
        } catch (offlineDbError) {
          console.log(`Offline database unavailable for MAL ID ${malId}:`, offlineDbError.message)
        }
      }

    } catch (error) {
      console.error(`Error fetching external IDs for MAL ID ${malId}:`, error.message)
    }

    return externalIds
  }

  /**
   * Sync specific anime by MAL ID
   * 
   * @param {number} malId - MyAnimeList ID
   * @param {Object} options - Sync options
   * @returns {Promise<Object>} Sync result
   */
  async syncSpecificAnime(malId, options = {}) {
    try {
      // This would require a different MAL API endpoint to get specific anime
      // For now, we'll implement this as a placeholder
      console.log(`Syncing specific anime ${malId} - not implemented yet`)
      return {
        success: false,
        message: 'Specific anime sync not implemented - use full list sync instead'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Get sync statistics for user
   * 
   * @returns {Promise<Object>} Sync statistics
   */
  async getSyncStats() {
    try {
      const user = await User.findById(this.userId)
      const totalAnime = await Anime.countDocuments({
        'userListStatus.userId': this.userId
      })
      
      const animeByStatus = await Anime.aggregate([
        { $match: { 'userListStatus.userId': this.userId } },
        { $unwind: '$userListStatus' },
        { $match: { 'userListStatus.userId': this.userId } },
        { $group: { _id: '$userListStatus.status', count: { $sum: 1 } } }
      ])

      const animeNeedingSync = await Anime.countDocuments({
        'userListStatus.userId': this.userId,
        'syncMetadata.lastSyncedFromMal': { 
          $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) 
        }
      })

      return {
        totalAnime,
        animeByStatus: animeByStatus.reduce((acc, item) => {
          acc[item._id] = item.count
          return acc
        }, {}),
        animeNeedingSync,
        lastSync: user?.syncMetadata?.lastAnimeSync,
        lastSyncStats: user?.syncMetadata?.lastSyncStats
      }
    } catch (error) {
      console.error('Error getting sync stats:', error)
      return { error: error.message }
    }
  }

  /**
   * Clean up old sync errors
   * 
   * @param {number} daysOld - Remove errors older than this many days
   * @returns {Promise<number>} Number of errors cleaned up
   */
  async cleanupSyncErrors(daysOld = 30) {
    const cutoffDate = new Date(Date.now() - (daysOld * 24 * 60 * 60 * 1000))
    
    const result = await Anime.updateMany(
      {},
      {
        $pull: {
          'syncMetadata.syncErrors': {
            timestamp: { $lt: cutoffDate },
            resolved: true
          }
        }
      }
    )

    return result.modifiedCount
  }
}

export default AnimeSyncService 