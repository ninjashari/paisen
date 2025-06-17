/**
 * Offline Database Model
 * 
 * This model stores metadata about the anime-offline-database downloads
 * and tracks when the database was last updated.
 * 
 * Features:
 * - Track last update timestamp
 * - Store database version/schema information
 * - Track download status and errors
 */

import mongoose from 'mongoose'

const OfflineDatabaseSchema = new mongoose.Schema({
  // Database identifier (should be 'anime-offline-database')
  databaseId: {
    type: String,
    required: true,
    unique: true,
    default: 'anime-offline-database',
  },
  
  // Last successful update timestamp
  lastUpdated: {
    type: Date,
    required: true,
    default: Date.now,
  },
  
  // Schema version from the downloaded files
  schemaVersion: {
    type: String,
    required: false,
  },
  
  // Total number of anime entries in the database
  totalEntries: {
    type: Number,
    required: false,
    default: 0,
  },
  
  // Download status
  downloadStatus: {
    type: String,
    enum: ['success', 'failed', 'in_progress'],
    required: true,
    default: 'success',
  },
  
  // Error message if download failed
  errorMessage: {
    type: String,
    required: false,
  },
  
  // File URLs that were downloaded
  downloadedFiles: {
    minifiedJson: {
      type: String,
      required: false,
    },
    schemaJson: {
      type: String,
      required: false,
    },
  },
  
  // Statistics about the database
  statistics: {
    malMappings: {
      type: Number,
      default: 0,
    },
    anidbMappings: {
      type: Number,
      default: 0,
    },
    completeMappings: {
      type: Number,
      default: 0,
    },
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

// Update the updatedAt field before saving
OfflineDatabaseSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Static methods
OfflineDatabaseSchema.statics.getMostRecent = function() {
  return this.findOne({ databaseId: 'anime-offline-database' }).sort({ updatedAt: -1 })
}

OfflineDatabaseSchema.statics.updateStatus = function(status, errorMessage = null, stats = {}, totalEntries = 0) {
  const update = {
    downloadStatus: status,
    errorMessage: errorMessage,
    updatedAt: new Date()
  }

  if (status === 'success') {
    update.lastUpdated = new Date()
    update.statistics = stats
    if (totalEntries) {
      update.totalEntries = totalEntries
    }
  }

  return this.findOneAndUpdate(
    { databaseId: 'anime-offline-database' },
    update,
    { 
      new: true, 
      upsert: true,
      setDefaultsOnInsert: true
    }
  )
}

export default mongoose.models.OfflineDatabase || mongoose.model('OfflineDatabase', OfflineDatabaseSchema) 