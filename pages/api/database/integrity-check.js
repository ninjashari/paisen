/**
 * Database Integrity Check API Endpoint
 * 
 * This endpoint performs comprehensive data integrity checks on the database,
 * identifying missing external IDs, duplicate entries, orphaned records,
 * and other data quality issues.
 */

import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import dbConnect from '@/lib/dbConnect'
import Anime from '@/models/Anime'
import User from '@/models/User'

export default async function handler(req, res) {
  // Only accept GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    })
  }

  // Get user session
  const session = await getServerSession(req, res, authOptions)
  if (!session || !session.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    })
  }

  try {
    // Connect to database
    await dbConnect()

    // Check for anime missing external IDs
    const missingExternalIds = await Anime.countDocuments({
      $or: [
        { 'externalIds.anidb': { $exists: false } },
        { 'externalIds.tvdb': { $exists: false } },
        { 'externalIds.tmdb': { $exists: false } }
      ]
    })

    // Check for duplicate MAL IDs
    const duplicateEntries = await Anime.aggregate([
      {
        $group: {
          _id: '$malId',
          count: { $sum: 1 },
          docs: { $push: '$_id' }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ])

    // Check for anime without basic information
    const missingBasicInfo = await Anime.countDocuments({
      $or: [
        { title: { $exists: false } },
        { title: '' },
        { media_type: { $exists: false } },
        { status: { $exists: false } }
      ]
    })

    // Check for orphaned user list status entries
    const orphanedUserListStatus = await Anime.aggregate([
      { $unwind: '$userListStatus' },
      {
        $lookup: {
          from: 'users',
          localField: 'userListStatus.userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $match: {
          user: { $size: 0 }
        }
      },
      {
        $count: 'orphanedCount'
      }
    ])

    // Check for anime with invalid scores or episode counts
    const invalidData = await Anime.countDocuments({
      $or: [
        { mean: { $lt: 0, $gt: 10 } },
        { num_episodes: { $lt: 0 } },
        { rank: { $lt: 0 } },
        { popularity: { $lt: 0 } }
      ]
    })

    // Check for users with incomplete configurations
    const incompleteUserConfigs = await User.countDocuments({
      $or: [
        {
          $and: [
            { jellyfinServerUrl: { $exists: true } },
            { jellyfinApiKey: { $exists: false } }
          ]
        },
        {
          $and: [
            { jellyfinApiKey: { $exists: true } },
            { jellyfinUserId: { $exists: false } }
          ]
        }
      ]
    })

    // Check for anime with future air dates but marked as finished
    const inconsistentAirDates = await Anime.countDocuments({
      $and: [
        { status: 'finished_airing' },
        { end_date: { $gt: new Date() } }
      ]
    })

    // Check for sync metadata issues
    const syncMetadataIssues = await Anime.countDocuments({
      $or: [
        { 'syncMetadata.lastSyncedFromMal': { $exists: false } },
        { 'syncMetadata.syncVersion': { $exists: false } }
      ]
    })

    // Get detailed information about issues
    const issueDetails = {
      duplicateAnime: duplicateEntries.map(dup => ({
        malId: dup._id,
        count: dup.count,
        documentIds: dup.docs
      })),
      missingExternalIdsSample: await Anime.find({
        $or: [
          { 'externalIds.anidb': { $exists: false } },
          { 'externalIds.tvdb': { $exists: false } },
          { 'externalIds.tmdb': { $exists: false } }
        ]
      })
      .limit(10)
      .select('malId title externalIds')
      .lean(),
      
      missingBasicInfoSample: await Anime.find({
        $or: [
          { title: { $exists: false } },
          { title: '' },
          { media_type: { $exists: false } },
          { status: { $exists: false } }
        ]
      })
      .limit(10)
      .select('malId title media_type status')
      .lean()
    }

    // Calculate overall data quality score
    const totalAnime = await Anime.countDocuments()
    const totalIssues = missingExternalIds + duplicateEntries.length + 
                       missingBasicInfo + invalidData + inconsistentAirDates + syncMetadataIssues
    
    const dataQualityScore = totalAnime > 0 ? 
      Math.max(0, 100 - (totalIssues / totalAnime * 100)) : 100

    res.status(200).json({
      success: true,
      missingExternalIds,
      duplicateEntries: duplicateEntries.length,
      orphanedRecords: orphanedUserListStatus[0]?.orphanedCount || 0,
      missingBasicInfo,
      invalidData,
      incompleteUserConfigs,
      inconsistentAirDates,
      syncMetadataIssues,
      totalIssues,
      dataQualityScore: Math.round(dataQualityScore),
      issueDetails,
      summary: {
        totalAnime,
        totalUsers: await User.countDocuments(),
        healthStatus: totalIssues === 0 ? 'excellent' : 
                     totalIssues < 10 ? 'good' : 
                     totalIssues < 50 ? 'fair' : 'poor'
      },
      message: `Data integrity check completed. Found ${totalIssues} issues across ${totalAnime} anime entries.`
    })

  } catch (error) {
    console.error('Database integrity check error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to perform integrity check',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
} 