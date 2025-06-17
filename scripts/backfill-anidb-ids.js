const dotenv = require('dotenv');
const path = require('path');

// Explicitly load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

/**
 * Backfill AniDB IDs into the animes collection
 *
 * This script iterates through all documents in the `animes` collection,
 * finds the corresponding `anidbId` from the `animemappings` collection
 * based on the `malId`, and updates the anime document with this ID.
 */

const dbConnect = require('@/lib/dbConnect').default
const Anime = require('@/models/Anime').default
const AnimeMapping = require('@/models/AnimeMapping').default
const mongoose = require('mongoose')

async function backfillAniDBIds() {
  console.log('Connecting to the database...')
  await dbConnect()
  console.log('Database connected.')

  try {
    console.log('Fetching anime documents from the database...')
    const animes = await Anime.find({ 'externalIds.anidbId': null, 'externalIds.malId': { $ne: null } })
    console.log(`Found ${animes.length} anime documents to update.`)

    let updatedCount = 0
    let notFoundCount = 0

    for (const anime of animes) {
      const malId = anime.externalIds.malId
      if (!malId) continue

      const mapping = await AnimeMapping.findOne({ malId: malId })

      if (mapping && mapping.anidbId) {
        anime.externalIds.anidbId = mapping.anidbId
        await anime.save()
        updatedCount++
        console.log(`Updated anime "${anime.title}" (MAL ID: ${malId}) with AniDB ID: ${mapping.anidbId}`)
      } else {
        notFoundCount++
        console.log(`No mapping found for anime "${anime.title}" (MAL ID: ${malId})`)
      }
    }

    console.log('\n--- Backfill Summary ---')
    console.log(`Successfully updated: ${updatedCount} anime documents.`)
    console.log(`Mappings not found: ${notFoundCount} anime documents.`)
    console.log('------------------------')

  } catch (error) {
    console.error('An error occurred during the backfill process:', error)
  } finally {
    console.log('Closing database connection.')
    await mongoose.connection.close()
    console.log('Database connection closed.')
  }
}

backfillAniDBIds() 