/**
 * Jellyfin to Local Database Sync API Endpoint
 * 
 * This endpoint synchronizes Jellyfin anime watch history with the local
 * anime database using AniDB ID matching. Unlike the regular sync that
 * updates MyAnimeList, this updates the local database directly.
 * 
 * Features:
 * - Fetches anime library from Jellyfin
 * - Matches anime using AniDB IDs from external mappings
 * - Updates local database with watch progress
 * - Creates new anime entries if not found locally
 * - Updates user list status in local database
 */

import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'
import Anime from '@/models/Anime'
import JellyfinApi from '@/lib/jellyfin'
import syncProgressTracker from '@/lib/syncProgress'
import axios from 'axios'

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    })
  }

  // Connect to database
  await dbConnect()

  // Get user session
  const session = await getServerSession(req, res, authOptions)
  if (!session || !session.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    })
  }

  const username = session.user.username || session.user.name

  try {
    // Get user configuration
    const user = await User.findOne({ username })
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Validate Jellyfin configuration
    if (!user.jellyfinServerUrl || !user.jellyfinApiKey || !user.jellyfinUserId) {
      return res.status(400).json({
        success: false,
        message: 'Jellyfin configuration incomplete. Please configure Jellyfin settings first.'
      })
    }

    // Generate session ID for progress tracking
    const sessionId = `jellyfin_sync_${user._id}_${Date.now()}`

    // Perform sync to local database with progress tracking
    const syncResult = await performJellyfinToDbSync(user, { ...req.body.options, sessionId })

    // Update last sync time
    await User.findByIdAndUpdate(user._id, {
      jellyfinLastSync: new Date()
    })

    res.status(200).json({
      success: true,
      message: `Jellyfin sync to local database completed: ${syncResult.updated} anime updated`,
      data: syncResult,
      sessionId: sessionId
    })

  } catch (error) {
    console.error('Jellyfin to DB sync error:', error)
    
    // Provide more specific error messages
    let errorMessage = 'Sync failed'
    if (error.message.includes('ECONNREFUSED')) {
      errorMessage = 'Cannot connect to Jellyfin server. Please check your server URL and network connection.'
    } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      errorMessage = 'Jellyfin API key is invalid or expired. Please check your API key configuration.'
    } else if (error.message.includes('404')) {
      errorMessage = 'Jellyfin server endpoint not found. Please check your server URL.'
    } else if (error.message.includes('timeout')) {
      errorMessage = 'Connection to Jellyfin server timed out. Please check your server URL and network connection.'
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message,
      details: error.response?.data || null
    })
  }
}

/**
 * Perform synchronization from Jellyfin to local database
 * 
 * @param {Object} user - User document from database
 * @param {Object} options - Sync options
 * @returns {Promise<Object>} Sync results
 */
async function performJellyfinToDbSync(user, options = {}) {
  const {
    useAnidbMatching = true,    // Use AniDB ID for matching
    maxItems = 100,             // Maximum number of items to process
    onlyRecent = false,         // Process all anime or only recent
    sessionId = null            // Progress tracking session ID
  } = options

  console.log(`Starting Jellyfin to DB sync for user: ${user.username}`)

  // Initialize Jellyfin API
  const jellyfinApi = new JellyfinApi(
    user.jellyfinServerUrl,
    user.jellyfinApiKey,
    user.jellyfinUserId
  )

  const syncResults = {
    processed: 0,
    updated: 0,
    created: 0,
    skipped: 0,
    errors: 0,
    matches: [],
    noMatches: []
  }

  try {
    // Start progress tracking
    if (sessionId) {
      syncProgressTracker.startSession(sessionId, 0, 'jellyfin_sync')
      syncProgressTracker.updateProgress(sessionId, {
        message: 'Fetching Jellyfin anime library...'
      })
    }

    // Get anime library from Jellyfin
    console.log('Fetching Jellyfin anime library...')
    const animeLibrary = await jellyfinApi.getAnimeItems(user.jellyfinUserId)
    
    if (!animeLibrary || animeLibrary.length === 0) {
      console.log('No anime found in Jellyfin library')
      
      if (sessionId) {
        syncProgressTracker.completeSession(sessionId, true, 'No anime found in Jellyfin library')
      }
      
      return {
        processed: 0,
        updated: 0,
        created: 0,
        skipped: 0,
        errors: 0,
        matches: [],
        noMatches: [],
        message: 'No anime found in Jellyfin library'
      }
    }
    
    console.log(`Found ${animeLibrary.length} anime series in Jellyfin library`)

    // Update progress with total items
    if (sessionId) {
      syncProgressTracker.updateProgress(sessionId, {
        totalItems: Math.min(animeLibrary.length, maxItems),
        message: `Processing ${Math.min(animeLibrary.length, maxItems)} anime series...`
      })
    }

    // Process each anime series
    for (const jellyfinAnime of animeLibrary.slice(0, maxItems)) {
      syncResults.processed++
      
      try {
        console.log(`Processing: ${jellyfinAnime.Name}`)
        
        // Update progress
        if (sessionId) {
          syncProgressTracker.incrementProgress(sessionId, jellyfinAnime.Name, 'processed')
        }
        
        // Extract anime information from Jellyfin item
        const animeInfo = jellyfinApi.extractAnimeInfo(jellyfinAnime)
        
        // Find matching anime in local database using AniDB ID
        let localAnime = null
        
        if (useAnidbMatching && animeInfo.anidbId) {
          // Try to match using AniDB ID
          localAnime = await Anime.findOne({ 'externalIds.anidb': animeInfo.anidbId })
          
          if (localAnime) {
            console.log(`Found AniDB match: ${localAnime.title} (AniDB: ${animeInfo.anidbId})`)
          }
        }
        
        // If no AniDB match, try title matching
        if (!localAnime) {
          localAnime = await findAnimeByTitle(animeInfo.title || animeInfo.seriesName)
        }
        
        if (!localAnime) {
          // Create new anime entry if not found
          console.log(`Creating new anime entry: ${animeInfo.title}`)
          localAnime = await createAnimeFromJellyfin(animeInfo, user._id)
          syncResults.created++
          
          if (sessionId) {
            syncProgressTracker.incrementProgress(sessionId, animeInfo.title, 'added')
          }
        } else {
          // Update existing anime with Jellyfin data
          await updateAnimeFromJellyfin(localAnime, animeInfo, user._id)
          syncResults.updated++
          
          if (sessionId) {
            syncProgressTracker.incrementProgress(sessionId, animeInfo.title, 'updated')
          }
        }
        
        syncResults.matches.push({
          jellyfinTitle: animeInfo.title,
          localTitle: localAnime.title,
          anidbId: animeInfo.anidbId,
          matchType: animeInfo.anidbId ? 'anidb' : 'title'
        })

      } catch (error) {
        console.error(`Error processing anime: ${jellyfinAnime.Name}`, error)
        syncResults.errors++
        syncResults.noMatches.push({
          title: jellyfinAnime.Name,
          error: error.message
        })
        
        if (sessionId) {
          syncProgressTracker.incrementProgress(sessionId, jellyfinAnime.Name, 'error')
        }
      }
    }

    console.log('Jellyfin to DB sync completed:', syncResults)
    
    // Complete progress tracking
    if (sessionId) {
      syncProgressTracker.completeSession(sessionId, true, 
        `Sync completed: ${syncResults.created} created, ${syncResults.updated} updated, ${syncResults.errors} errors`
      )
    }
    
    return syncResults

  } catch (error) {
    console.error('Jellyfin to DB sync failed:', error)
    
    // Fail progress tracking
    if (sessionId) {
      syncProgressTracker.failSession(sessionId, error.message)
    }
    
    throw error
  }
}

/**
 * Find anime in local database by title matching
 * 
 * @param {string} title - Anime title to search for
 * @returns {Promise<Object|null>} Found anime or null
 */
async function findAnimeByTitle(title) {
  if (!title) return null
  
  // Clean title for better matching
  const cleanTitle = title.toLowerCase().trim()
  
  // Try exact match first
  let anime = await Anime.findOne({
    $or: [
      { title: { $regex: new RegExp(`^${title}$`, 'i') } },
      { 'alternative_titles.en': { $regex: new RegExp(`^${title}$`, 'i') } },
      { 'alternative_titles.synonyms': { $regex: new RegExp(`^${title}$`, 'i') } }
    ]
  })
  
  if (anime) return anime
  
  // Try partial match
  anime = await Anime.findOne({
    $or: [
      { title: { $regex: new RegExp(cleanTitle, 'i') } },
      { 'alternative_titles.en': { $regex: new RegExp(cleanTitle, 'i') } },
      { 'alternative_titles.synonyms': { $regex: new RegExp(cleanTitle, 'i') } }
    ]
  })
  
  return anime
}

/**
 * Create new anime entry from Jellyfin data
 * 
 * @param {Object} animeInfo - Anime information from Jellyfin
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Created anime document
 */
async function createAnimeFromJellyfin(animeInfo, userId) {
  // Get external IDs if available
  const externalIds = {}
  if (animeInfo.anidbId) externalIds.anidb = animeInfo.anidbId
  if (animeInfo.tvdbId) externalIds.tvdb = animeInfo.tvdbId
  if (animeInfo.tmdbId) externalIds.tmdb = animeInfo.tmdbId
  
  // Create minimal anime document with only essential fields
  const animeData = {
    malId: null, // Placeholder - will be updated when MAL sync happens
    title: animeInfo.title || animeInfo.seriesName,
    genres: animeInfo.genres.map(genre => ({ name: genre })),
    media_type: determineMediaType(animeInfo),
    status: 'finished_airing', // Default status
    num_episodes: animeInfo.totalEpisodes || 0,
    externalIds: externalIds,
    userListStatus: [{
      userId: userId,
      status: determineWatchStatus(animeInfo),
      num_episodes_watched: animeInfo.watchedEpisodes || 0,
      updated_at: new Date()
    }],
    syncMetadata: {
      lastSyncedFromJellyfin: new Date(),
      syncVersion: 1,
      isActive: true,
      jellyfinId: animeInfo.jellyfinId
    }
  }
  
  const anime = new Anime(animeData)
  await anime.save()
  return anime
}

/**
 * Update existing anime with Jellyfin data
 * 
 * @param {Object} localAnime - Local anime document
 * @param {Object} animeInfo - Anime information from Jellyfin
 * @param {string} userId - User ID
 */
async function updateAnimeFromJellyfin(localAnime, animeInfo, userId) {
  // Update external IDs if available
  if (animeInfo.anidbId && !localAnime.externalIds?.anidb) {
    if (!localAnime.externalIds) localAnime.externalIds = {}
    localAnime.externalIds.anidb = animeInfo.anidbId
  }
  
  // Update or create user list status
  const existingStatus = localAnime.userListStatus.find(
    status => status.userId.toString() === userId.toString()
  )
  
  if (existingStatus) {
    // Update existing status
    existingStatus.num_episodes_watched = Math.max(
      existingStatus.num_episodes_watched || 0,
      animeInfo.watchedEpisodes || 0
    )
    existingStatus.status = determineWatchStatus(animeInfo, existingStatus.status)
    existingStatus.updated_at = new Date()
  } else {
    // Add new user status
    localAnime.userListStatus.push({
      userId: userId,
      status: determineWatchStatus(animeInfo),
      num_episodes_watched: animeInfo.watchedEpisodes || 0,
      updated_at: new Date()
    })
  }
  
  // Update sync metadata
  localAnime.syncMetadata.lastSyncedFromJellyfin = new Date()
  if (animeInfo.jellyfinId) {
    localAnime.syncMetadata.jellyfinId = animeInfo.jellyfinId
  }
  
  await localAnime.save()
}

/**
 * Determine media type from Jellyfin data
 * 
 * @param {Object} animeInfo - Anime information
 * @returns {string} Media type
 */
function determineMediaType(animeInfo) {
  if (animeInfo.type) {
    const type = animeInfo.type.toLowerCase()
    if (type.includes('movie')) return 'movie'
    if (type.includes('series')) return 'tv'
    if (type.includes('ova')) return 'ova'
    if (type.includes('special')) return 'special'
  }
  
  // Default to TV series
  return 'tv'
}

/**
 * Determine watch status from Jellyfin data
 * 
 * @param {Object} animeInfo - Anime information
 * @param {string} currentStatus - Current status (if updating)
 * @returns {string} Watch status
 */
function determineWatchStatus(animeInfo, currentStatus = null) {
  const watchedEpisodes = animeInfo.watchedEpisodes || 0
  const totalEpisodes = animeInfo.totalEpisodes || 0
  
  if (watchedEpisodes === 0) {
    return currentStatus || 'plan_to_watch'
  }
  
  if (totalEpisodes > 0 && watchedEpisodes >= totalEpisodes) {
    return 'completed'
  }
  
  if (watchedEpisodes > 0) {
    return 'watching'
  }
  
  return currentStatus || 'plan_to_watch'
} 