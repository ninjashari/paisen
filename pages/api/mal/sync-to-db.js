/**
 * MyAnimeList to Local Database Sync API Endpoint
 * 
 * This endpoint synchronizes the user's MyAnimeList anime list with the local
 * anime database. It enriches the local data with AniDB ID mappings from the
 * anime_mappings collection.
 * 
 * Features:
 * - Fetches anime list from MyAnimeList
 * - Matches anime with existing local data
 * - Enriches anime data with AniDB ID mappings
 * - Creates new anime entries if not found locally
 * - Updates user list status in local database
 */

import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'
import Anime from '@/models/Anime'
import AnimeMapping from '@/models/AnimeMapping'
import MalApi from '@/lib/malApi'
import syncProgressService from '@/lib/syncProgress'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    })
  }

  await dbConnect()

  const session = await getServerSession(req, res, authOptions)
  if (!session || !session.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    })
  }

  const username = session.user.username || session.user.name

  try {
    const user = await User.findOne({ username })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    if (!session.malAccessToken) {
      return res.status(400).json({
        success: false,
        message: 'MyAnimeList token not found in session.'
      })
    }

    const sessionId = req.body.options?.sessionId || `mal_sync_${user._id}_${Date.now()}`
    
    // Initialize the progress state immediately.
    syncProgressService.setProgress(sessionId, {
      status: 'starting',
      message: 'Initializing synchronization process...',
      percentage: 0,
      totalItems: 0,
      processedItems: 0,
      addedEntries: 0,
      updatedEntries: 0,
      errorEntries: 0,
      createdAt: Date.now()
    });
    
    // Now, run the actual sync in the background.
    performMalToDbSync(user, session.malAccessToken, { ...req.body.options, sessionId })
      .catch(error => {
        // Update progress with error state if background sync fails
        syncProgressService.setProgress(sessionId, {
          status: 'error',
          message: error.message || 'Sync process failed unexpectedly',
          percentage: 100
        });
        console.error('Background sync failed:', error);
      });

    // Immediately respond to the client so it can start polling.
    res.status(202).json({
      success: true,
      message: 'Sync process started successfully.',
      sessionId: sessionId
    });

  } catch (error) {
    console.error('MyAnimeList to DB sync error:', error)
    res.status(500).json({
      success: false,
      message: 'Sync failed',
      error: error.message
    })
  }
}

async function performMalToDbSync(user, malAccessToken, options = {}) {
  const {
    maxItems = 1000,
    sessionId = null
  } = options

  if (!sessionId) {
    throw new Error('Session ID is required for sync process');
  }

  const malApi = new MalApi(malAccessToken)
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
    syncProgressService.setProgress(sessionId, {
      status: 'running',
      message: 'Fetching MyAnimeList anime library...',
      percentage: 2, // Small initial percentage
    });

    const fields = {
      animeList: [
        'id', 'title', 'main_picture', 'alternative_titles', 'start_date', 'end_date',
        'synopsis', 'mean', 'rank', 'popularity', 'num_list_users', 'num_scoring_users',
        'nsfw', 'created_at', 'updated_at', 'media_type', 'status', 'genres',
        'list_status', 'num_episodes', 'start_season', 'broadcast', 'source',
        'average_episode_duration', 'rating', 'pictures', 'background', 'related_anime',
        'related_manga', 'recommendations', 'studios', 'statistics'
      ]
    }

    const animeListResponse = await malApi.getAnimeList(fields, null)
    const animeList = animeListResponse.data.data

    const totalItems = Math.min(animeList.length, maxItems);
    syncProgressService.setProgress(sessionId, {
      totalItems: totalItems,
      message: `Processing ${totalItems} anime series...`,
      percentage: 5, // Show a little progress
    });

    for (const malAnime of animeList.slice(0, maxItems)) {
      syncResults.processed++
      try {
        syncProgressService.setProgress(sessionId, {
          processedItems: syncResults.processed,
          currentItem: malAnime.node.title,
          percentage: 5 + Math.round((syncResults.processed / totalItems) * 90),
          status: 'running',
        });

        let localAnime = await Anime.findOne({ 'externalIds.malId': malAnime.node.id })
        const mapping = await AnimeMapping.findOne({ malId: malAnime.node.id })

        const animeData = {
          title: malAnime.node.title,
          externalIds: {
            malId: malAnime.node.id,
            anidbId: mapping?.anidbId || null
          },
          genres: malAnime.node.genres,
          studios: malAnime.node.studios,
          media_type: malAnime.node.media_type,
          status: malAnime.node.status,
          num_episodes: malAnime.node.num_episodes,
          start_season: malAnime.node.start_season,
          syncMetadata: {
            lastSyncedFromMal: new Date(),
            lastUpdatedOnMal: malAnime.node.updated_at
          }
        }

        if (localAnime) {
          Object.assign(localAnime, animeData)
          
          // Properly map the list_status data from MAL response
          if (malAnime.list_status) {
            const userListStatusData = {
              status: malAnime.list_status.status,
              score: malAnime.list_status.score,
              num_episodes_watched: malAnime.list_status.num_episodes_watched,
              is_rewatching: malAnime.list_status.is_rewatching,
              start_date: malAnime.list_status.start_date ? new Date(malAnime.list_status.start_date) : null,
              finish_date: malAnime.list_status.finish_date ? new Date(malAnime.list_status.finish_date) : null,
              priority: malAnime.list_status.priority,
              num_times_rewatched: malAnime.list_status.num_times_rewatched,
              rewatch_value: malAnime.list_status.rewatch_value,
              tags: malAnime.list_status.tags,
              comments: malAnime.list_status.comments,
              updated_at: malAnime.list_status.updated_at ? new Date(malAnime.list_status.updated_at) : new Date()
            }
            localAnime.updateUserListStatus(user._id, userListStatusData)
          }

          await localAnime.save()
          syncResults.updated++
          if (sessionId) {
            syncProgressService.setProgress(sessionId, {
              updatedEntries: syncResults.updated,
            });
          }
        } else {
          localAnime = new Anime(animeData)
          
          // Properly map the list_status data from MAL response
          if (malAnime.list_status) {
            const userListStatusData = {
              status: malAnime.list_status.status,
              score: malAnime.list_status.score,
              num_episodes_watched: malAnime.list_status.num_episodes_watched,
              is_rewatching: malAnime.list_status.is_rewatching,
              start_date: malAnime.list_status.start_date ? new Date(malAnime.list_status.start_date) : null,
              finish_date: malAnime.list_status.finish_date ? new Date(malAnime.list_status.finish_date) : null,
              priority: malAnime.list_status.priority,
              num_times_rewatched: malAnime.list_status.num_times_rewatched,
              rewatch_value: malAnime.list_status.rewatch_value,
              tags: malAnime.list_status.tags,
              comments: malAnime.list_status.comments,
              updated_at: malAnime.list_status.updated_at ? new Date(malAnime.list_status.updated_at) : new Date()
            }
            localAnime.updateUserListStatus(user._id, userListStatusData)
          }

          await localAnime.save()
          syncResults.created++
          if (sessionId) {
            syncProgressService.setProgress(sessionId, {
              addedEntries: syncResults.created,
            });
          }
        }

      } catch (error) {
        console.error(`Error processing anime ${malAnime.node.title}:`, error);
        syncResults.errors++;
        syncProgressService.setProgress(sessionId, {
          errorEntries: syncResults.errors,
          message: `Error processing ${malAnime.node.title}: ${error.message}`,
        });
      }
    }

    // Update final progress
    syncProgressService.setProgress(sessionId, {
      status: 'completed',
      message: `Sync completed. Processed ${syncResults.processed} items.`,
      percentage: 100,
      processedItems: syncResults.processed,
      addedEntries: syncResults.created,
      updatedEntries: syncResults.updated,
      errorEntries: syncResults.errors,
    });

  } catch (error) {
    console.error('Sync process failed:', error);
    syncProgressService.setProgress(sessionId, {
      status: 'error',
      message: error.message || 'Sync process failed unexpectedly',
      percentage: 100,
    });
    throw error;
  }

  // Update user's last sync time now that the background task is done
  await User.findByIdAndUpdate(user._id, {
    malLastSync: new Date()
  });

  // Clean up after a short delay
  setTimeout(() => {
    if (sessionId) {
      syncProgressService.clearProgress(sessionId);
    }
  }, 30000); // 30 seconds

  return syncResults
} 