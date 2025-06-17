/**
 * Anime Offline Database Service
 * 
 * This service handles downloading and processing the anime-offline-database
 * from the manami-project GitHub repository. It provides functionality to:
 * - Download the latest minified database and schema
 * - Parse and extract MAL to AniDB mappings
 * - Store mappings in the local database
 * - Provide search functionality for anime mappings
 * 
 * The offline database contains cross-references between various anime platforms
 * including MyAnimeList and AniDB, which we use for mapping purposes.
 */

import axios from 'axios'
import AnimeMapping from '../models/AnimeMapping.js'
import OfflineDatabase from '../models/OfflineDatabase.js'
import fs from 'fs'
import path from 'path'

const DATABASE_PATH = path.join(process.cwd(), 'data/anime-offline-database-minified.json');
const SCHEMA_PATH = path.join(process.cwd(), 'data/anime-offline-database-minified.schema.json');

class OfflineDatabaseService {
  constructor() {
    this.baseUrl = 'https://raw.githubusercontent.com/manami-project/anime-offline-database/master'
    this.minifiedJsonUrl = `${this.baseUrl}/anime-offline-database-minified.json`
    this.schemaJsonUrl = `${this.baseUrl}/anime-offline-database-minified.schema.json`
  }

  /**
   * Download and update the offline database
   * This should be called periodically to keep the mapping database current
   * 
   * @returns {Promise<Object>} Update result with statistics
   */
  async updateOfflineDatabase() {
    try {
      // Mark as in progress
      await OfflineDatabase.updateStatus('in_progress')

      console.log('Reading anime offline database from local files...')
      
      // Read both files from the local filesystem
      const minifiedData = JSON.parse(fs.readFileSync(DATABASE_PATH, 'utf-8'));
      const schemaData = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf-8'));

      console.log(`Loaded database with ${minifiedData.data?.length || 0} entries`)

      // Process and store mappings
      const stats = await this.processMappings(minifiedData)

      // Update database status
      await OfflineDatabase.updateStatus('success', null, {
        malMappings: stats.malMappings,
        anidbMappings: stats.anidbMappings,
        completeMappings: stats.completeMappings
      }, minifiedData.data?.length || 0)

      // Update additional metadata
      const dbRecord = await OfflineDatabase.findOneAndUpdate(
        { databaseId: 'anime-offline-database' },
        {
          totalEntries: minifiedData.data?.length || 0,
          schemaVersion: schemaData.$schema || 'unknown',
          'downloadedFiles.minifiedJson': this.minifiedJsonUrl,
          'downloadedFiles.schemaJson': this.schemaJsonUrl
        },
        { new: true }
      )

      console.log('Offline database update completed successfully')
      return {
        success: true,
        stats,
        message: 'Database updated successfully'
      }

    } catch (error) {
      console.error('Failed to update offline database:', error)
      
      await OfflineDatabase.updateStatus('failed', error.message)
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to update database'
      }
    }
  }

  /**
   * Process the downloaded data and extract MAL to AniDB mappings
   * 
   * @param {Object} offlineData - The downloaded offline database JSON
   * @returns {Promise<Object>} Processing statistics
   */
  async processMappings(offlineData) {
    const stats = {
      malMappings: 0,
      anidbMappings: 0,
      completeMappings: 0,
      processed: 0,
      errors: 0
    }

    if (!offlineData.data || !Array.isArray(offlineData.data)) {
      throw new Error('Invalid offline database format')
    }

    const mappingsToProcess = []

    // Extract mappings from the data
    for (const anime of offlineData.data) {
      try {
        const malId = this.extractMalId(anime.sources)
        const anidbId = this.extractAnidbId(anime.sources)

        if (malId && anidbId) {
          mappingsToProcess.push({
            malId,
            anidbId,
            animeTitle: anime.title,
            metadata: {
              sources: anime.sources,
              synonyms: anime.synonyms || [],
              type: anime.type,
              episodes: anime.episodes,
              status: anime.status
            }
          })
          stats.completeMappings++
        }

        if (malId) stats.malMappings++
        if (anidbId) stats.anidbMappings++
        stats.processed++

      } catch (error) {
        console.error(`Error processing anime entry:`, error)
        stats.errors++
      }
    }

    console.log(`Found ${mappingsToProcess.length} complete mappings to process`)

    // Batch insert/update mappings
    await this.bulkUpsertMappings(mappingsToProcess)

    return stats
  }

  /**
   * Extract MAL ID from sources array
   * 
   * @param {Array} sources - Array of source URLs
   * @returns {number|null} MAL ID or null if not found
   */
  extractMalId(sources) {
    if (!Array.isArray(sources)) return null

    for (const source of sources) {
      const malMatch = source.match(/myanimelist\.net\/anime\/(\d+)/)
      if (malMatch) {
        return parseInt(malMatch[1])
      }
    }
    return null
  }

  /**
   * Extract AniDB ID from sources array
   * 
   * @param {Array} sources - Array of source URLs
   * @returns {number|null} AniDB ID or null if not found
   */
  extractAnidbId(sources) {
    if (!Array.isArray(sources)) return null

    for (const source of sources) {
      const anidbMatch = source.match(/anidb\.net\/anime\/(\d+)/)
      if (anidbMatch) {
        return parseInt(anidbMatch[1])
      }
    }
    return null
  }

  /**
   * Bulk insert or update anime mappings
   * 
   * @param {Array} mappings - Array of mapping objects
   */
  async bulkUpsertMappings(mappings) {
    const batchSize = 100
    
    for (let i = 0; i < mappings.length; i += batchSize) {
      const batch = mappings.slice(i, i + batchSize)
      
      const operations = batch.map(mapping => ({
        updateOne: {
          filter: { malId: mapping.malId },
          update: {
            $set: {
              anidbId: mapping.anidbId,
              animeTitle: mapping.animeTitle,
              mappingSource: 'offline_database',
              offlineDbMetadata: mapping.metadata,
              updatedAt: new Date()
            }
          },
          upsert: true
        }
      }))

      try {
        await AnimeMapping.bulkWrite(operations)
        console.log(`Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(mappings.length / batchSize)}`)
      } catch (error) {
        console.error(`Error processing batch:`, error)
      }
    }
  }

  /**
   * Find anime mapping by MAL ID
   * 
   * @param {number} malId - MyAnimeList ID
   * @returns {Promise<Object|null>} Anime mapping or null
   */
  async findMappingByMalId(malId) {
    return await AnimeMapping.findByMalId(malId)
  }

  /**
   * Search for anime mappings by title
   * 
   * @param {string} title - Anime title to search for
   * @param {number} limit - Maximum number of results
   * @returns {Promise<Array>} Array of matching anime mappings
   */
  async searchMappingsByTitle(title, limit = 10) {
    return await AnimeMapping.find({
      $or: [
        { animeTitle: { $regex: title, $options: 'i' } },
        { 'offlineDbMetadata.synonyms': { $regex: title, $options: 'i' } }
      ]
    }).limit(limit)
  }

  /**
   * Create or update a manual mapping
   * 
   * @param {number} malId - MyAnimeList ID
   * @param {number} anidbId - AniDB ID
   * @param {string} animeTitle - Anime title
   * @param {string} userId - User ID who created the mapping
   * @returns {Promise<Object>} Created or updated mapping
   */
  async createManualMapping(malId, anidbId, animeTitle, userId) {
    const existingMapping = await AnimeMapping.findByMalId(malId)
    
    if (existingMapping) {
      // Update existing mapping
      existingMapping.anidbId = anidbId
      existingMapping.mappingSource = 'manual'
      existingMapping.confirmedByUserId = userId
      existingMapping.updatedAt = new Date()
      return await existingMapping.save()
    } else {
      // Create new mapping
      return await AnimeMapping.createMapping(
        malId, 
        anidbId, 
        animeTitle, 
        'manual', 
        userId
      )
    }
  }

  /**
   * Confirm a mapping suggested by the offline database
   * 
   * @param {number} malId - MyAnimeList ID
   * @param {string} userId - User ID who confirmed the mapping
   * @returns {Promise<Object>} Confirmed mapping
   */
  async confirmMapping(malId, userId) {
    return await AnimeMapping.confirmMapping(malId, userId)
  }

  /**
   * Get database status and statistics
   * 
   * @returns {Promise<Object>} Database status information
   */
  async getDatabaseStatus() {
    const dbStatus = await OfflineDatabase.getMostRecent()
    const totalMappings = await AnimeMapping.countDocuments()
    const confirmedMappings = await AnimeMapping.countDocuments({ 
      mappingSource: { $in: ['user_confirmed', 'manual'] }
    })

    return {
      lastUpdated: dbStatus?.lastUpdated,
      downloadStatus: dbStatus?.downloadStatus || 'unknown',
      totalEntries: dbStatus?.statistics?.totalEntries || 0,
      totalMappings,
      confirmedMappings,
      errorMessage: dbStatus?.errorMessage
    }
  }
}

export default OfflineDatabaseService 