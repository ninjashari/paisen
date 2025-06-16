/**
 * Anime Database Model
 * 
 * This model represents the local anime database that syncs with MyAnimeList
 * and includes external ID mappings for cross-platform compatibility.
 * 
 * Features:
 * - Complete MAL anime data storage
 * - External ID mappings (AniDB, TVDB, TMDB)
 * - User-specific anime list status
 * - Sync metadata and timestamps
 */

import mongoose from 'mongoose'

// External ID mappings schema
const ExternalIdsSchema = new mongoose.Schema({
  anidb: {
    type: Number,
    index: true,
  },
  tvdb: {
    type: Number,
    index: true,
  },
  tmdb: {
    type: Number,
    index: true,
  },
  imdb: {
    type: String,
    index: true,
  },
}, { _id: false })

// Alternative titles schema
const AlternativeTitlesSchema = new mongoose.Schema({
  en: [String],
  ja: [String],
  synonyms: [String],
}, { _id: false })

// Main picture schema
const MainPictureSchema = new mongoose.Schema({
  medium: String,
  large: String,
}, { _id: false })

// Genre schema
const GenreSchema = new mongoose.Schema({
  id: Number,
  name: String,
}, { _id: false })

// Studio schema
const StudioSchema = new mongoose.Schema({
  id: Number,
  name: String,
}, { _id: false })

// Start season schema
const StartSeasonSchema = new mongoose.Schema({
  year: Number,
  season: String,
}, { _id: false })

// Broadcast schema
const BroadcastSchema = new mongoose.Schema({
  day_of_the_week: String,
  start_time: String,
}, { _id: false })

// User list status schema (for storing user-specific data)
const UserListStatusSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['watching', 'completed', 'on_hold', 'dropped', 'plan_to_watch'],
  },
  score: {
    type: Number,
    min: 0,
    max: 10,
  },
  num_episodes_watched: {
    type: Number,
    default: 0,
  },
  is_rewatching: {
    type: Boolean,
    default: false,
  },
  start_date: Date,
  finish_date: Date,
  priority: {
    type: Number,
    min: 0,
    max: 2,
  },
  num_times_rewatched: {
    type: Number,
    default: 0,
  },
  rewatch_value: {
    type: Number,
    min: 0,
    max: 5,
  },
  tags: [String],
  comments: String,
  updated_at: {
    type: Date,
    default: Date.now,
  },
}, { _id: false })

// Main Anime schema
const AnimeSchema = new mongoose.Schema({
  // MAL ID (primary identifier)
  malId: {
    type: Number,
    required: true,
    unique: true,
    index: true,
  },
  
  // External ID mappings
  externalIds: ExternalIdsSchema,
  
  // Basic anime information
  title: {
    type: String,
    required: true,
    index: true,
  },
  alternative_titles: AlternativeTitlesSchema,
  main_picture: MainPictureSchema,
  
  // Dates
  start_date: Date,
  end_date: Date,
  
  // Content information
  synopsis: String,
  mean: Number, // Average score
  rank: Number,
  popularity: Number,
  num_list_users: Number,
  num_scoring_users: Number,
  
  // Classification
  nsfw: {
    type: String,
    enum: ['white', 'gray', 'black'],
    default: 'white',
  },
  genres: [GenreSchema],
  media_type: {
    type: String,
    enum: ['unknown', 'tv', 'ova', 'movie', 'special', 'ona', 'music'],
    required: true,
  },
  status: {
    type: String,
    enum: ['finished_airing', 'currently_airing', 'not_yet_aired'],
    required: true,
  },
  
  // Episode information
  num_episodes: {
    type: Number,
    default: 0,
  },
  start_season: StartSeasonSchema,
  broadcast: BroadcastSchema,
  source: String,
  average_episode_duration: Number, // in seconds
  rating: {
    type: String,
    enum: ['g', 'pg', 'pg_13', 'r', 'r+', 'rx'],
  },
  
  // Production
  studios: [StudioSchema],
  
  // User-specific data (array to support multiple users)
  userListStatus: [UserListStatusSchema],
  
  // Sync metadata
  syncMetadata: {
    lastSyncedFromMal: {
      type: Date,
      default: Date.now,
    },
    lastUpdatedOnMal: Date,
    syncVersion: {
      type: Number,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    syncErrors: [{
      error: String,
      timestamp: Date,
      resolved: {
        type: Boolean,
        default: false,
      },
    }],
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Indexes for efficient querying
AnimeSchema.index({ 'externalIds.anidb': 1 })
AnimeSchema.index({ 'externalIds.tvdb': 1 })
AnimeSchema.index({ 'externalIds.tmdb': 1 })
AnimeSchema.index({ 'userListStatus.userId': 1 })
AnimeSchema.index({ 'userListStatus.status': 1 })
AnimeSchema.index({ 'syncMetadata.lastSyncedFromMal': 1 })
AnimeSchema.index({ title: 'text', 'alternative_titles.en': 'text', 'alternative_titles.synonyms': 'text' })

// Update the updatedAt field before saving
AnimeSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Instance methods
AnimeSchema.methods.getUserListStatus = function(userId) {
  return this.userListStatus.find(status => status.userId.toString() === userId.toString())
}

AnimeSchema.methods.updateUserListStatus = function(userId, statusUpdate) {
  const existingStatusIndex = this.userListStatus.findIndex(
    status => status.userId.toString() === userId.toString()
  )
  
  if (existingStatusIndex !== -1) {
    // Update existing status
    Object.assign(this.userListStatus[existingStatusIndex], statusUpdate)
    this.userListStatus[existingStatusIndex].updated_at = new Date()
  } else {
    // Add new status
    this.userListStatus.push({
      userId,
      ...statusUpdate,
      updated_at: new Date(),
    })
  }
}

AnimeSchema.methods.removeUserListStatus = function(userId) {
  this.userListStatus = this.userListStatus.filter(
    status => status.userId.toString() !== userId.toString()
  )
}

// Static methods
AnimeSchema.statics.findByExternalId = function(idType, idValue) {
  const query = {}
  query[`externalIds.${idType}`] = idValue
  return this.findOne(query)
}

AnimeSchema.statics.findUserAnimeList = function(userId, status = null) {
  const matchStage = {
    'userListStatus.userId': new mongoose.Types.ObjectId(userId),
  }
  
  if (status) {
    matchStage['userListStatus.status'] = status
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $addFields: {
        userStatus: {
          $arrayElemAt: [
            {
              $filter: {
                input: '$userListStatus',
                cond: { $eq: ['$$this.userId', new mongoose.Types.ObjectId(userId)] }
              }
            },
            0
          ]
        }
      }
    }
  ])
}

AnimeSchema.statics.getAnimeNeedingSync = function(olderThanHours = 24) {
  const cutoffDate = new Date(Date.now() - (olderThanHours * 60 * 60 * 1000))
  return this.find({
    'syncMetadata.isActive': true,
    'syncMetadata.lastSyncedFromMal': { $lt: cutoffDate }
  })
}

export default mongoose.models.Anime || mongoose.model('Anime', AnimeSchema) 