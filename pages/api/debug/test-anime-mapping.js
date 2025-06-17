/**
 * Test Anime Mapping Debug Endpoint
 * 
 * This endpoint is used for testing anime mapping functionality between
 * MyAnimeList and AniDB using the offline database from manami-project.
 * 
 * Features:
 * - Test MAL to AniDB mapping lookups
 * - Verify offline database status
 * - Test manual mapping creation
 * - Validate mapping confirmation workflow
 */

import dbConnect from '@/lib/dbConnect'
import OfflineDatabaseService from '@/lib/offlineDatabase'
import AnimeMapping from '@/models/AnimeMapping'
import User from '@/models/User'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(req, res) {
  const { method } = req

  // Only allow GET requests for testing
  if (method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ 
      success: false, 
      message: `Method ${method} Not Allowed` 
    })
  }

  // Connect to database
  await dbConnect()

  try {
    const offlineDbService = new OfflineDatabaseService()
    const testResults = {}

    // Test 1: Check database status
    console.log('Testing database status...')
    const dbStatus = await offlineDbService.getDatabaseStatus()
    testResults.databaseStatus = dbStatus

    // Test 2: Test popular anime mappings
    console.log('Testing anime mappings...')
    const testAnimeIds = [
      1, // Cowboy Bebop
      5114, // Fullmetal Alchemist: Brotherhood  
      9253, // Steins;Gate
      11757, // Sword Art Online
      16498 // Attack on Titan
    ]

    const mappingTests = []
    for (const malId of testAnimeIds) {
      try {
        const mapping = await offlineDbService.findMappingByMalId(malId)
        mappingTests.push({
          malId,
          found: !!mapping,
          mapping: mapping ? {
            anidbId: mapping.anidbId,
            animeTitle: mapping.animeTitle,
            mappingSource: mapping.mappingSource
          } : null
        })
      } catch (error) {
        mappingTests.push({
          malId,
          found: false,
          error: error.message
        })
      }
    }
    testResults.mappingTests = mappingTests

    // Test 3: Test search functionality
    console.log('Testing search functionality...')
    try {
      const searchResults = await offlineDbService.searchMappingsByTitle('Cowboy Bebop', 5)
      testResults.searchTest = {
        success: true,
        resultsCount: searchResults.length,
        results: searchResults.map(r => ({
          malId: r.malId,
          anidbId: r.anidbId,
          animeTitle: r.animeTitle
        }))
      }
    } catch (error) {
      testResults.searchTest = {
        success: false,
        error: error.message
      }
    }

    // Test 4: Count total mappings
    console.log('Counting total mappings...')
    const totalMappings = await AnimeMapping.countDocuments()
    const confirmedMappings = await AnimeMapping.countDocuments({ 
      mappingSource: { $in: ['user_confirmed', 'manual'] }
    })
    testResults.mappingCounts = {
      total: totalMappings,
      confirmed: confirmedMappings,
      fromOfflineDb: totalMappings - confirmedMappings
    }

    // Test 5: Test manual mapping creation (if user is authenticated)
    const session = await getServerSession(req, res, authOptions)
    if (session?.user) {
      console.log('Testing manual mapping creation...')
      const username = session.user.username || session.user.name
      const user = await User.findOne({ username })
      
      if (user) {
        try {
          // Create a test manual mapping for a fictitious anime
          const testMapping = await offlineDbService.createManualMapping(
            999999, // Fictitious MAL ID
            999999, // Fictitious AniDB ID
            'Test Anime Mapping',
            user._id
          )
          
          testResults.manualMappingTest = {
            success: true,
            created: {
              malId: testMapping.malId,
              anidbId: testMapping.anidbId,
              animeTitle: testMapping.animeTitle,
              mappingSource: testMapping.mappingSource
            }
          }
          
          // Clean up the test mapping
          await AnimeMapping.deleteOne({ malId: 999999 })
          
        } catch (error) {
          testResults.manualMappingTest = {
            success: false,
            error: error.message
          }
        }
      }
    }

    // Test 6: Sample anime data structure
    const sampleMapping = await AnimeMapping.findOne({}).limit(1)
    if (sampleMapping) {
      testResults.sampleMapping = {
        structure: {
          malId: sampleMapping.malId,
          anidbId: sampleMapping.anidbId,
          animeTitle: sampleMapping.animeTitle,
          mappingSource: sampleMapping.mappingSource,
          hasMetadata: !!sampleMapping.offlineDbMetadata,
          metadataKeys: sampleMapping.offlineDbMetadata ? 
            Object.keys(sampleMapping.offlineDbMetadata) : []
        }
      }
    }

    // Return comprehensive test results
    return res.status(200).json({
      success: true,
      message: 'Anime mapping tests completed',
      timestamp: new Date().toISOString(),
      testResults: {
        ...testResults,
        summary: {
          totalTests: Object.keys(testResults).length,
          databaseWorking: !!dbStatus.lastUpdated,
          mappingsAvailable: totalMappings > 0,
          searchWorking: testResults.searchTest?.success || false,
          systemHealthy: !!dbStatus.lastUpdated && totalMappings > 0
        }
      }
    })

  } catch (error) {
    console.error('Error running anime mapping tests:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to run anime mapping tests',
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
} 