/**
 * MyAnimeList to Local Database Sync API Endpoint
 * 
 * This endpoint synchronizes the user's MyAnimeList anime list with the local
 * anime database.
 * 
 * Features:
 * - Fetches anime list from MyAnimeList
 * - Matches anime with existing local data
 * - Creates new anime entries if not found locally
 * - Updates user list status in local database
 */

import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'
import Anime from '@/models/Anime'
import MalApi from '@/lib/malApi'

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

    const syncResult = await performMalToDbSync(user, session.malAccessToken, req.body.options)

    await User.findByIdAndUpdate(user._id, {
      malLastSync: new Date()
    })

    res.status(200).json({
      success: true,
      message: `MyAnimeList sync to local database completed: ${syncResult.updated} anime updated, ${syncResult.created} anime created.`,
      data: syncResult
    })

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
    maxItems = 1000
  } = options

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

  for (const malAnime of animeList.slice(0, maxItems)) {
    syncResults.processed++
    try {

      let localAnime = await Anime.findOne({ 'externalIds.malId': malAnime.node.id })

      const animeData = {
        title: malAnime.node.title,
        externalIds: {
          malId: malAnime.node.id,
          anidbId: null
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
      }

    } catch (error) {
      console.error(`Error processing anime: ${malAnime.node.title}`, error)
      syncResults.errors++
      syncResults.noMatches.push({
        title: malAnime.node.title,
        error: error.message
      })
    }
  }

  return syncResults
} 