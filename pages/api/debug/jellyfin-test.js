/**
 * Debug Jellyfin Connection Test API Endpoint
 * 
 * This endpoint tests the Jellyfin connection and provides detailed
 * information about connectivity issues for debugging purposes.
 */

import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'
import JellyfinApi from '@/lib/jellyfin'

export default async function handler(req, res) {
  // Only accept GET requests
  if (req.method !== 'GET') {
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

    const testResults = {
      configuration: {
        hasServerUrl: !!user.jellyfinServerUrl,
        hasApiKey: !!user.jellyfinApiKey,
        hasUserId: !!user.jellyfinUserId,
        serverUrl: user.jellyfinServerUrl,
        userId: user.jellyfinUserId,
        username: user.jellyfinUsername
      },
      connectivity: {
        serverReachable: false,
        apiKeyValid: false,
        userExists: false,
        animeLibraryAccessible: false
      },
      errors: []
    }

    // Test 1: Check if configuration is complete
    if (!user.jellyfinServerUrl || !user.jellyfinApiKey || !user.jellyfinUserId) {
      testResults.errors.push('Jellyfin configuration incomplete')
      return res.status(400).json({
        success: false,
        message: 'Jellyfin configuration incomplete',
        data: testResults
      })
    }

    // Initialize Jellyfin API
    const jellyfinApi = new JellyfinApi(
      user.jellyfinServerUrl,
      user.jellyfinApiKey,
      user.jellyfinUserId
    )

    // Test 2: Check server connectivity
    try {
      await jellyfinApi.testConnection()
      testResults.connectivity.serverReachable = true
      testResults.connectivity.apiKeyValid = true
    } catch (error) {
      testResults.errors.push(`Server connectivity failed: ${error.message}`)
      if (error.message.includes('ECONNREFUSED')) {
        testResults.errors.push('Server appears to be down or URL is incorrect')
      } else if (error.message.includes('401')) {
        testResults.errors.push('API key is invalid or expired')
      }
    }

    // Test 3: Check if user exists
    if (testResults.connectivity.serverReachable) {
      try {
        const userInfo = await jellyfinApi.getUserById(user.jellyfinUserId)
        if (userInfo) {
          testResults.connectivity.userExists = true
          testResults.configuration.username = userInfo.Name
        }
      } catch (error) {
        testResults.errors.push(`User validation failed: ${error.message}`)
      }
    }

    // Test 4: Check anime library access
    if (testResults.connectivity.userExists) {
      try {
        const animeLibrary = await jellyfinApi.getAnimeItems(user.jellyfinUserId)
        testResults.connectivity.animeLibraryAccessible = true
        testResults.animeLibraryCount = animeLibrary ? animeLibrary.length : 0
      } catch (error) {
        testResults.errors.push(`Anime library access failed: ${error.message}`)
      }
    }

    // Determine overall success
    const allTestsPassed = testResults.connectivity.serverReachable &&
                          testResults.connectivity.apiKeyValid &&
                          testResults.connectivity.userExists &&
                          testResults.connectivity.animeLibraryAccessible

    res.status(200).json({
      success: allTestsPassed,
      message: allTestsPassed ? 'All Jellyfin tests passed' : 'Some Jellyfin tests failed',
      data: testResults
    })

  } catch (error) {
    console.error('Jellyfin test error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error during Jellyfin test',
      error: error.message
    })
  }
} 