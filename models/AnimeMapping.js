/**
 * Anime Mapping Database Model
 * 
 * This model stores the mapping between MyAnimeList IDs and AniDB IDs.
 * It tracks user confirmations and provides a fallback for manual mappings
 * when the offline database doesn't have the correct match.
 * 
 * Features:
 * - MAL ID to AniDB ID mapping storage
 * - User confirmation tracking
 * - Manual mapping support
 * - Mapping source tracking (offline database vs manual)
 */

import mongoose from 'mongoose'

const AnimeMappingSchema = new mongoose.Schema({
  // MAL ID (primary identifier)
  malId: {
    type: Number,
    required: true,
    unique: true,
    index: true,
  },
  
  // AniDB ID (target mapping)
  anidbId: {
    type: Number,
    required: true,
    index: true,
  },
  
  // Mapping metadata
  mappingSource: {
    type: String,
    enum: ['offline_database', 'manual', 'user_confirmed'],
    required: true,
    default: 'offline_database',
  },
  
  // User who confirmed or created this mapping
  confirmedByUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  
  // Confidence score from offline database (if applicable)
  confidenceScore: {
    type: Number,
    min: 0,
    max: 1,
    required: false,
  },
  
  // Anime title for reference
  animeTitle: {
    type: String,
    required: true,
    index: true,
  },
  
  // Additional metadata from offline database
  offlineDbMetadata: {
    type: Object,
    required: false,
    default: {},
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
AnimeMappingSchema.index({ malId: 1 })
AnimeMappingSchema.index({ anidbId: 1 })
AnimeMappingSchema.index({ mappingSource: 1 })
AnimeMappingSchema.index({ confirmedByUserId: 1 })
AnimeMappingSchema.index({ animeTitle: 'text' })

// Note: MAL ID is already unique, no need for compound index

// Update the updatedAt field before saving
AnimeMappingSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Static methods
AnimeMappingSchema.statics.findByMalId = function(malId) {
  return this.findOne({ malId: malId })
}

AnimeMappingSchema.statics.findByAnidbId = function(anidbId) {
  return this.findOne({ anidbId: anidbId })
}

AnimeMappingSchema.statics.createMapping = function(malId, anidbId, animeTitle, mappingSource = 'offline_database', userId = null, metadata = {}) {
  return this.create({
    malId,
    anidbId,
    animeTitle,
    mappingSource,
    confirmedByUserId: userId,
    offlineDbMetadata: metadata,
  })
}

AnimeMappingSchema.statics.confirmMapping = function(malId, userId) {
  return this.findOneAndUpdate(
    { malId: malId },
    { 
      mappingSource: 'user_confirmed',
      confirmedByUserId: userId,
      updatedAt: new Date()
    },
    { new: true }
  )
}

export default mongoose.models.AnimeMapping || mongoose.model('AnimeMapping', AnimeMappingSchema) 