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
import Anime from '@/models/Anime'
import JellyfinApi from '@/lib/jellyfin'

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
  const { dryRun = false } = options;
  console.log(`Starting manual sync for user: ${user.username}. Dry run: ${dryRun}`);

  const jellyfinApi = new JellyfinApi(
    user.jellyfinServerUrl,
    user.jellyfinApiKey,
    user.jellyfinUserId
  );

  const syncResults = {
    processed: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
    matches: [],
    noMatches: [],
    errorDetails: [],
  };

  try {
    // 1. Fetch the entire Jellyfin library
    const jellyfinLibrary = await jellyfinApi.getAnimeItems(user.jellyfinUserId);
    console.log(`Found ${jellyfinLibrary.length} items in Jellyfin library.`);
    syncResults.processed = jellyfinLibrary.length;

    for (const jellyfinItem of jellyfinLibrary) {
      try {
        const animeInfo = jellyfinApi.extractAnimeInfo(jellyfinItem);
        const anidbId = animeInfo.providerIds?.anidb;

        // 2. Match based only on anidbId
        if (!anidbId) {
          syncResults.skipped++;
          syncResults.noMatches.push({ series: animeInfo.title, reason: 'Missing AniDB ID in Jellyfin.' });
          continue;
        }
        
        const localAnime = await Anime.findOne({ 'externalIds.anidbId': anidbId });

        if (!localAnime) {
          syncResults.skipped++;
          syncResults.noMatches.push({ series: animeInfo.title, reason: `No local anime found with AniDB ID: ${anidbId}` });
          continue;
        }

        const userStatus = localAnime.getUserListStatus(user._id);
        if (!userStatus) {
            syncResults.skipped++;
            syncResults.noMatches.push({ series: animeInfo.title, reason: 'User has not added this anime to their list.' });
            continue;
        }

        const jellyfinWatchedEpisodes = animeInfo.watchedEpisodes || 0;
        const localWatchedEpisodes = userStatus.num_episodes_watched || 0;
        
        // 3. Update local DB if Jellyfin has more watched episodes
        if (jellyfinWatchedEpisodes > localWatchedEpisodes) {
          const newStatus = {
            num_episodes_watched: jellyfinWatchedEpisodes
          };

          // If user was planning to watch, move to watching
          if (userStatus.status === 'plan_to_watch') {
            newStatus.status = 'watching';
          }

          // If all episodes are watched, mark as completed
          if (localAnime.num_episodes > 0 && jellyfinWatchedEpisodes >= localAnime.num_episodes) {
            newStatus.status = 'completed';
            newStatus.finish_date = new Date();
          }
          
          if (!dryRun) {
            localAnime.updateUserListStatus(user._id, newStatus);
            await localAnime.save();
          }

          syncResults.updated++;
          syncResults.matches.push({ 
            series: animeInfo.title, 
            message: `Updated watched episodes from ${localWatchedEpisodes} to ${jellyfinWatchedEpisodes}.`
          });

        } else {
          syncResults.skipped++;
        }
      } catch (e) {
        syncResults.errors++;
        syncResults.errorDetails.push({ series: jellyfinItem.Name, reason: e.message });
      }
    }
  } catch (error) {
    console.error('Error fetching Jellyfin library for sync:', error);
    syncResults.errors++;
    syncResults.errorDetails.push({ series: 'Entire Library', reason: error.message });
    // Re-throw if it's a critical error fetching the library
    throw error;
  }

  return syncResults;
} 