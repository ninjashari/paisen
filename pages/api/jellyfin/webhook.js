/**
 * Jellyfin Webhook Endpoint
 * 
 * This endpoint receives webhook notifications from Jellyfin servers
 * when users watch anime episodes. It automatically updates the user's
 * MyAnimeList with the watched episode progress.
 * 
 * Supported Jellyfin Events:
 * - PlaybackStop: When episode playback is completed
 * - PlaybackProgress: For tracking watch progress (optional)
 * 
 * The webhook performs the following operations:
 * 1. Validates the incoming webhook payload
 * 2. Identifies the anime series and episode
 * 3. Matches with MyAnimeList entries
 * 4. Updates the user's MAL anime list
 */

import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'
import JellyfinApi from '@/lib/jellyfin'
import AnimeMatchingService from '@/lib/animeMatching'
import MalApi from '@/lib/malApi'

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

  try {
    const payload = req.body
    
    // Log incoming webhook for debugging
    console.log('Jellyfin webhook received:', {
      type: payload.NotificationType,
      user: payload.Username,
      item: payload.Name,
      series: payload.SeriesName
    })

    // Validate webhook payload
    if (!payload.NotificationType || !payload.UserId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook payload'
      })
    }

    // Only process relevant events
    const relevantEvents = ['PlaybackStop', 'PlaybackProgress']
    if (!relevantEvents.includes(payload.NotificationType)) {
      return res.status(200).json({
        success: true,
        message: 'Event ignored - not relevant for anime tracking'
      })
    }

    // Only process anime content
    if (payload.ItemType !== 'Episode') {
      return res.status(200).json({
        success: true,
        message: 'Event ignored - not an episode'
      })
    }

    // Process the webhook
    const result = await processAnimeWebhook(payload)
    
    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
      data: result
    })

  } catch (error) {
    console.error('Webhook processing error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    })
  }
}

/**
 * Process anime webhook and update MAL
 * 
 * @param {Object} payload - Jellyfin webhook payload
 * @returns {Promise<Object>} Processing result
 */
async function processAnimeWebhook(payload) {
  // Parse webhook payload
  const jellyfinApi = new JellyfinApi('', '') // We'll get server details from user config
  const eventData = jellyfinApi.parseWebhookPayload(payload)

  // Find user by Jellyfin user ID
  const user = await User.findOne({ 
    jellyfinUserId: eventData.userId,
    jellyfinSyncEnabled: true 
  })

  if (!user) {
    console.log(`No user found for Jellyfin user ID: ${eventData.userId}`)
    return { status: 'ignored', reason: 'User not found or sync disabled' }
  }

  // Check if user has MAL access token
  if (!user.accessToken) {
    console.log(`User ${user.username} has no MAL access token`)
    return { status: 'ignored', reason: 'No MAL access token' }
  }

  // Initialize APIs with user credentials
  const userJellyfinApi = new JellyfinApi(
    user.jellyfinServerUrl,
    user.jellyfinApiKey,
    user.jellyfinUserId
  )

  // Get detailed item information from Jellyfin
  const itemDetails = await userJellyfinApi.getItemDetails(
    eventData.itemId,
    eventData.userId
  )

  // Extract anime information
  const animeInfo = userJellyfinApi.extractAnimeInfo(itemDetails)

  // Check if this is anime content
  if (!isAnimeContent(animeInfo)) {
    console.log(`Content is not anime: ${animeInfo.title}`)
    return { status: 'ignored', reason: 'Not anime content' }
  }

  // Determine if episode was watched (based on playback position)
  const watchThreshold = 0.8 // 80% watched threshold
  const watchedPercentage = eventData.playbackPosition / eventData.runtime
  const isWatched = watchedPercentage >= watchThreshold

  if (!isWatched && eventData.eventType === 'PlaybackStop') {
    console.log(`Episode not sufficiently watched: ${watchedPercentage * 100}%`)
    return { status: 'ignored', reason: 'Episode not sufficiently watched' }
  }

  // Find matching MAL anime
  const matchingService = new AnimeMatchingService(user.accessToken)
  const malMatch = await matchingService.findMalMatch(animeInfo)

  if (!malMatch) {
    console.log(`No MAL match found for: ${animeInfo.seriesName || animeInfo.title}`)
    return { 
      status: 'no_match', 
      reason: 'No MAL match found',
      anime: animeInfo.seriesName || animeInfo.title
    }
  }

  // Update MAL anime list
  const updateResult = await updateMalAnimeList(
    user.accessToken,
    malMatch,
    animeInfo,
    eventData
  )

  // Update user's last sync time
  await User.findByIdAndUpdate(user._id, {
    jellyfinLastSync: new Date()
  })

  return {
    status: 'updated',
    anime: animeInfo.seriesName || animeInfo.title,
    episode: animeInfo.episodeNumber,
    malId: malMatch.id,
    updateResult: updateResult
  }
}

/**
 * Check if content is anime based on various indicators
 * 
 * @param {Object} animeInfo - Extracted anime information
 * @returns {boolean} True if content is likely anime
 */
function isAnimeContent(animeInfo) {
  // Check for explicit anime indicators
  const hasAnimeGenre = animeInfo.genres.some(genre =>
    ['anime', 'animation'].includes(genre.toLowerCase())
  )

  const hasAnimeStudio = animeInfo.studios.some(studio =>
    isKnownAnimeStudio(studio)
  )

        const hasAnimeProvider = animeInfo.providerIds.mal

  // Check for Japanese origin indicators
  const hasJapaneseTitle = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(
    animeInfo.title || animeInfo.seriesName || ''
  )

  return hasAnimeGenre || hasAnimeStudio || hasAnimeProvider || hasJapaneseTitle
}

/**
 * Check if studio is known to produce anime
 * 
 * @param {string} studioName - Studio name
 * @returns {boolean} True if known anime studio
 */
function isKnownAnimeStudio(studioName) {
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
 * Update MAL anime list with watched episode
 * 
 * @param {string} accessToken - MAL access token
 * @param {Object} malMatch - Matched MAL anime
 * @param {Object} animeInfo - Jellyfin anime information
 * @param {Object} eventData - Webhook event data
 * @returns {Promise<Object>} Update result
 */
async function updateMalAnimeList(accessToken, malMatch, animeInfo, eventData) {
  const malApi = new MalApi(accessToken)

  try {
    // Get current anime list status
    const currentList = await malApi.getAnimeList(
      { animeList: ['id', 'title', 'list_status'] },
      'watching,completed,on_hold,dropped,plan_to_watch'
    )

    // Find current entry for this anime
    let currentEntry = null
    if (currentList.data && currentList.data.data) {
      currentEntry = currentList.data.data.find(entry => 
        entry.node.id === malMatch.id
      )
    }

    // Determine current watched episodes
    let currentWatchedEpisodes = 0
    let currentStatus = 'watching'

    if (currentEntry && currentEntry.list_status) {
      currentWatchedEpisodes = currentEntry.list_status.num_episodes_watched || 0
      currentStatus = currentEntry.list_status.status || 'watching'
    }

    // Calculate new watched episodes count
    const newWatchedEpisodes = Math.max(
      currentWatchedEpisodes,
      animeInfo.episodeNumber || 1
    )

    // Prepare update fields
    const updateFields = {
      num_watched_episodes: newWatchedEpisodes
    }

    // Update status if needed
    if (currentStatus === 'plan_to_watch' && newWatchedEpisodes > 0) {
      updateFields.status = 'watching'
    }

    // Check if anime is completed
    if (malMatch.num_episodes && newWatchedEpisodes >= malMatch.num_episodes) {
      updateFields.status = 'completed'
    }

    // Update MAL
    const updateResponse = await malApi.updateList(malMatch.id, updateFields)

    if (updateResponse.status === 200) {
      console.log(`Successfully updated MAL for anime ${malMatch.id}: ${newWatchedEpisodes} episodes`)
      return {
        success: true,
        previousEpisodes: currentWatchedEpisodes,
        newEpisodes: newWatchedEpisodes,
        status: updateFields.status || currentStatus
      }
    } else {
      throw new Error(`MAL update failed with status: ${updateResponse.status}`)
    }

  } catch (error) {
    console.error('Error updating MAL:', error)
    throw error
  }
} 