/**
 * Jellyfin Manual Sync API Endpoint
 * 
 * This endpoint allows users to manually synchronize their Jellyfin
 * anime watch history with MyAnimeList. This is useful for:
 * - Initial setup and historical data sync
 * - Catching up on missed webhook events
 * - Troubleshooting sync issues
 * 
 * The sync process:
 * 1. Retrieves user's recent anime activity from Jellyfin
 * 2. Matches anime content with MAL entries
 * 3. Updates MAL with watch progress
 * 4. Returns detailed sync results
 */

import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
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

  // Get user session
  const session = await getServerSession(req, res, authOptions)
  if (!session || !session.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    })
  }

  // Try both username and name fields for compatibility
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
        message: 'Jellyfin configuration incomplete'
      })
    }

    // Validate MAL configuration
    if (!user.accessToken) {
      return res.status(400).json({
        success: false,
        message: 'MyAnimeList access token not found'
      })
    }

    // Perform sync
    const syncResult = await performManualSync(user, req.body.options || {})

    // Update last sync time
    await User.findByIdAndUpdate(user._id, {
      jellyfinLastSync: new Date()
    })

    res.status(200).json({
      success: true,
      message: 'Manual sync completed',
      data: syncResult
    })

  } catch (error) {
    console.error('Manual sync error:', error)
    res.status(500).json({
      success: false,
      message: 'Sync failed',
      error: error.message
    })
  }
}

/**
 * Perform manual synchronization between Jellyfin and MAL
 * 
 * @param {Object} user - User document from database
 * @param {Object} options - Sync options
 * @returns {Promise<Object>} Sync results
 */
async function performManualSync(user, options = {}) {
  const {
    dryRun = false,           // If true, don't actually update MAL
    maxItems = 50,            // Maximum number of items to process
    onlyRecent = true,        // Only sync recent activity
    forceUpdate = false       // Update even if already synced
  } = options

  console.log(`Starting manual sync for user: ${user.username}`)

  // Initialize APIs
  const jellyfinApi = new JellyfinApi(
    user.jellyfinServerUrl,
    user.jellyfinApiKey,
    user.jellyfinUserId
  )

  const matchingService = new AnimeMatchingService(user.accessToken)
  const malApi = new MalApi(user.accessToken)

  const syncResults = {
    processed: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
    matches: [],
    noMatches: [],
    errors: []
  }

  try {
    // Get user's recent anime activity from Jellyfin
    console.log('Fetching Jellyfin activity...')
    const recentActivity = await jellyfinApi.getUserActivity(user.jellyfinUserId)
    
    // Filter for anime content only
    const animeActivity = recentActivity.filter(item => {
      const animeInfo = jellyfinApi.extractAnimeInfo(item)
      return isAnimeContent(animeInfo)
    })

    console.log(`Found ${animeActivity.length} anime episodes in recent activity`)

    // Group episodes by series
    const seriesMap = new Map()
    
    for (const episode of animeActivity.slice(0, maxItems)) {
      const animeInfo = jellyfinApi.extractAnimeInfo(episode)
      const seriesKey = animeInfo.seriesName || animeInfo.title
      
      if (!seriesMap.has(seriesKey)) {
        seriesMap.set(seriesKey, {
          animeInfo: animeInfo,
          episodes: []
        })
      }
      
      seriesMap.get(seriesKey).episodes.push({
        episodeNumber: animeInfo.episodeNumber,
        watched: episode.UserData?.Played || false,
        playbackPosition: episode.UserData?.PlaybackPositionTicks || 0,
        runtime: episode.RunTimeTicks || 0
      })
    }

    console.log(`Processing ${seriesMap.size} anime series`)

    // Process each series
    for (const [seriesName, seriesData] of seriesMap) {
      syncResults.processed++
      
      try {
        console.log(`Processing: ${seriesName}`)
        
        // Find MAL match
        const malMatch = await matchingService.findMalMatch(seriesData.animeInfo)
        
        if (!malMatch) {
          console.log(`No MAL match found for: ${seriesName}`)
          syncResults.noMatches.push({
            series: seriesName,
            reason: 'No MAL match found'
          })
          syncResults.skipped++
          continue
        }

        // Calculate highest watched episode
        const watchedEpisodes = seriesData.episodes
          .filter(ep => ep.watched || (ep.playbackPosition / ep.runtime) >= 0.8)
          .map(ep => ep.episodeNumber)
          .filter(num => num && num > 0)

        if (watchedEpisodes.length === 0) {
          console.log(`No watched episodes found for: ${seriesName}`)
          syncResults.skipped++
          continue
        }

        const maxWatchedEpisode = Math.max(...watchedEpisodes)

        // Get current MAL status
        const currentList = await malApi.getAnimeList(
          { animeList: ['id', 'title', 'list_status'] },
          'watching,completed,on_hold,dropped,plan_to_watch'
        )

        let currentEntry = null
        if (currentList.data && currentList.data.data) {
          currentEntry = currentList.data.data.find(entry => 
            entry.node.id === malMatch.id
          )
        }

        const currentWatchedEpisodes = currentEntry?.list_status?.num_episodes_watched || 0
        const currentStatus = currentEntry?.list_status?.status || 'watching'

        // Skip if already up to date (unless force update)
        if (!forceUpdate && currentWatchedEpisodes >= maxWatchedEpisode) {
          console.log(`Already up to date: ${seriesName} (${currentWatchedEpisodes}/${maxWatchedEpisode})`)
          syncResults.skipped++
          continue
        }

        // Prepare update
        const updateFields = {
          num_watched_episodes: Math.max(currentWatchedEpisodes, maxWatchedEpisode)
        }

        // Update status if needed
        if (currentStatus === 'plan_to_watch' && maxWatchedEpisode > 0) {
          updateFields.status = 'watching'
        }

        // Check if completed
        if (malMatch.num_episodes && maxWatchedEpisode >= malMatch.num_episodes) {
          updateFields.status = 'completed'
        }

        // Perform update (unless dry run)
        if (!dryRun) {
          const updateResponse = await malApi.updateList(malMatch.id, updateFields)
          
          if (updateResponse.status !== 200) {
            throw new Error(`MAL update failed with status: ${updateResponse.status}`)
          }
        }

        syncResults.matches.push({
          series: seriesName,
          malId: malMatch.id,
          previousEpisodes: currentWatchedEpisodes,
          newEpisodes: updateFields.num_watched_episodes,
          status: updateFields.status || currentStatus,
          confidence: malMatch.confidence,
          dryRun: dryRun
        })

        syncResults.updated++
        console.log(`${dryRun ? '[DRY RUN] ' : ''}Updated: ${seriesName} -> ${updateFields.num_watched_episodes} episodes`)

      } catch (error) {
        console.error(`Error processing ${seriesName}:`, error)
        syncResults.errors.push({
          series: seriesName,
          error: error.message
        })
        syncResults.errors++
      }
    }

    console.log(`Manual sync completed: ${syncResults.updated} updated, ${syncResults.skipped} skipped, ${syncResults.errors} errors`)
    return syncResults

  } catch (error) {
    console.error('Manual sync failed:', error)
    throw error
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