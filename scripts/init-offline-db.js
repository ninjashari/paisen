import dotenv from 'dotenv';
import mongoose from 'mongoose';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define URLs for the offline database files
const DATABASE_URL = 'https://raw.githubusercontent.com/manami-project/anime-offline-database/master/anime-offline-database-minified.json'
const SCHEMA_URL = 'https://raw.githubusercontent.com/manami-project/anime-offline-database/master/anime-offline-database-minified.schema.json'

// Define local paths for storing the downloaded files
const DATABASE_PATH = path.join(__dirname, '../data/anime-offline-database-minified.json')
const SCHEMA_PATH = path.join(__dirname, '../data/anime-offline-database-minified.schema.json')

/**
 * Initialize the offline database
 */
async function initializeOfflineDatabase(offlineDbService) {
  try {
    // Update the offline database
    console.log('📥 Processing anime offline database...')
    const result = await offlineDbService.updateOfflineDatabase()
    
    if (result.success) {
      console.log('✅ Offline database initialized successfully!')
      console.log('📊 Statistics:')
      console.log(`   - Total entries processed: ${result.stats.processed}`)
      console.log(`   - MAL mappings found: ${result.stats.malMappings}`)
      console.log(`   - AniDB mappings found: ${result.stats.anidbMappings}`)
      console.log(`   - Complete mappings created: ${result.stats.completeMappings}`)
      if (result.stats.errors > 0) {
        console.log(`   - Errors encountered: ${result.stats.errors}`)
      }
    } else {
      console.error('❌ Failed to initialize offline database:', result.error)
    }

  } catch (error) {
    console.error('💥 Fatal error during initialization:', error)
    throw error;
  }
}

// Function to download a file from a URL
async function downloadFile(url, filePath) {
  const response = await axios.get(url, { responseType: 'stream' })
  const writer = fs.createWriteStream(filePath)
  response.data.pipe(writer)
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve)
    writer.on('error', reject)
  })
}

// Main function to update the offline database files
async function updateOfflineDatabaseFiles() {
  try {
    console.log('📥 Downloading anime offline database...')
    await downloadFile(DATABASE_URL, DATABASE_PATH)
    console.log('✅ Anime offline database updated successfully.')

    console.log('📥 Downloading anime offline database schema...')
    await downloadFile(SCHEMA_URL, SCHEMA_PATH)
    console.log('✅ Anime offline database schema updated successfully.')
  } catch (error) {
    console.error('❌ Error updating offline database:', error)
    throw error // Re-throw to be caught by the main initializer
  }
}

/**
 * Main execution
 */
async function main() {
  let dbConnection;
  try {
    console.log('🚀 Starting offline database initialization...');

    // Download latest database files
    await updateOfflineDatabaseFiles();

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    dbConnection = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Dynamically import the service after connection
    const { default: OfflineDatabaseService } = await import('../lib/offlineDatabase.js');
    const offlineDbService = new OfflineDatabaseService();

    // Initialize the database
    await initializeOfflineDatabase(offlineDbService);

    console.log('🎉 Initialization completed successfully!');
  } catch (error) {
    console.error('💥 Initialization failed:', error);
  } finally {
    if (dbConnection) {
      await dbConnection.connection.close();
      console.log('🔌 Disconnected from MongoDB');
    }
    process.exit(1);
  }
}

main();