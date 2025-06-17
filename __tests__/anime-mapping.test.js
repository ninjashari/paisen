/**
 * Anime Mapping Tests
 * 
 * This test suite verifies the anime mapping functionality between
 * MyAnimeList and AniDB using the offline database from manami-project.
 * 
 * Test Coverage:
 * - Offline database service functionality
 * - Mapping CRUD operations
 * - API endpoint behavior
 * - Data validation and error handling
 */

import OfflineDatabaseService from '../lib/offlineDatabase'
import AnimeMapping from '../models/AnimeMapping'
import OfflineDatabase from '../models/OfflineDatabase'
import dbConnect from '../lib/dbConnect'
import mongoose from 'mongoose'

// Mock axios for testing
jest.mock('axios')
import axios from 'axios'
const mockedAxios = axios

// Mock fs for testing
jest.mock('fs')
import fs from 'fs'
const mockedFs = fs

describe('Anime Mapping System', () => {
  let offlineDbService

  beforeAll(async () => {
    // Connect to test database
    await dbConnect()
    offlineDbService = new OfflineDatabaseService()
  })

  afterAll(async () => {
    // Clean up and close connection
    await mongoose.connection.close()
  })

  beforeEach(async () => {
    // Clear test data before each test
    await AnimeMapping.deleteMany({})
    await OfflineDatabase.deleteMany({})
  })

  describe('OfflineDatabaseService', () => {
    describe('URL Construction', () => {
      test('should have correct URLs for manami-project database', () => {
        expect(offlineDbService.minifiedJsonUrl).toBe(
          'https://raw.githubusercontent.com/manami-project/anime-offline-database/master/anime-offline-database-minified.json'
        )
        expect(offlineDbService.schemaJsonUrl).toBe(
          'https://raw.githubusercontent.com/manami-project/anime-offline-database/master/anime-offline-database-minified.schema.json'
        )
      })
    })

    describe('MAL ID Extraction', () => {
      test('should extract MAL ID from sources array', () => {
        const sources = [
          'https://anidb.net/anime/1',
          'https://myanimelist.net/anime/1234',
          'https://example.com/other'
        ]
        
        const malId = offlineDbService.extractMalId(sources)
        expect(malId).toBe(1234)
      })

      test('should return null for invalid sources', () => {
        expect(offlineDbService.extractMalId(null)).toBeNull()
        expect(offlineDbService.extractMalId([])).toBeNull()
        expect(offlineDbService.extractMalId(['https://example.com'])).toBeNull()
      })
    })

    describe('AniDB ID Extraction', () => {
      test('should extract AniDB ID from sources array', () => {
        const sources = [
          'https://myanimelist.net/anime/1234',
          'https://anidb.net/anime/5678',
          'https://example.com/other'
        ]
        
        const anidbId = offlineDbService.extractAnidbId(sources)
        expect(anidbId).toBe(5678)
      })

      test('should return null for invalid sources', () => {
        expect(offlineDbService.extractAnidbId(null)).toBeNull()
        expect(offlineDbService.extractAnidbId([])).toBeNull()
        expect(offlineDbService.extractAnidbId(['https://example.com'])).toBeNull()
      })
    })

    describe('Mapping Processing (Unit Tests)', () => {
      test('should process valid offline database data without DB operations', async () => {
        const mockData = {
          data: [
            {
              title: 'Test Anime 1',
              sources: [
                'https://myanimelist.net/anime/1',
                'https://anidb.net/anime/101'
              ],
              synonyms: ['Test Anime Alternative'],
              type: 'TV',
              episodes: 12,
              status: 'finished'
            },
            {
              title: 'Test Anime 2',
              sources: [
                'https://myanimelist.net/anime/2',
                'https://anidb.net/anime/102'
              ],
              synonyms: [],
              type: 'Movie',
              episodes: 1,
              status: 'finished'
            },
            {
              title: 'Incomplete Anime',
              sources: [
                'https://myanimelist.net/anime/3'
                // Missing AniDB source
              ]
            }
          ]
        }

        // Mock bulkUpsertMappings to avoid actual DB operations during test
        const originalBulkUpsert = offlineDbService.bulkUpsertMappings
        offlineDbService.bulkUpsertMappings = jest.fn().mockResolvedValue()

        const stats = await offlineDbService.processMappings(mockData)
        
        expect(stats.processed).toBe(3)
        expect(stats.malMappings).toBe(3)
        expect(stats.anidbMappings).toBe(2)
        expect(stats.completeMappings).toBe(2)
        expect(stats.errors).toBe(0)

        // Verify bulkUpsertMappings was called with correct data
        expect(offlineDbService.bulkUpsertMappings).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              malId: 1,
              anidbId: 101,
              animeTitle: 'Test Anime 1'
            }),
            expect.objectContaining({
              malId: 2,
              anidbId: 102,
              animeTitle: 'Test Anime 2'
            })
          ])
        )

        // Restore original method
        offlineDbService.bulkUpsertMappings = originalBulkUpsert
      })

      test('should handle invalid data gracefully', async () => {
        const invalidData = { invalid: 'data' }
        
        await expect(offlineDbService.processMappings(invalidData))
          .rejects
          .toThrow('Invalid offline database format')
      })
    })

    describe('Database Status', () => {
      test('should return database status', async () => {
        // Create test database status
        await OfflineDatabase.updateStatus('success', null, {
          malMappings: 100,
          anidbMappings: 90,
          completeMappings: 85
        })

        // Create test mappings
        await AnimeMapping.create([
          { malId: 1, anidbId: 101, animeTitle: 'Test 1', mappingSource: 'offline_database' },
          { malId: 2, anidbId: 102, animeTitle: 'Test 2', mappingSource: 'user_confirmed' }
        ])

        const status = await offlineDbService.getDatabaseStatus()
        
        expect(status.downloadStatus).toBe('success')
        expect(status.totalMappings).toBe(2)
        expect(status.confirmedMappings).toBe(1)
      })
    })

    describe('Database Update (Integration)', () => {
      beforeEach(() => {
        // Reset mocks before each test in this block
        mockedFs.readFileSync.mockReset();
      });

      test('should update offline database successfully from local files', async () => {
        const mockMinifiedData = {
          data: [
            { title: 'Anime 1', sources: ['https://myanimelist.net/anime/1', 'https://anidb.net/anime/101'] }
          ]
        };
        const mockSchemaData = { $schema: 'test-schema' };

        // Mock reading from filesystem
        mockedFs.readFileSync.mockImplementation(path => {
          if (path.includes('minified.json')) {
            return JSON.stringify(mockMinifiedData);
          }
          if (path.includes('schema.json')) {
            return JSON.stringify(mockSchemaData);
          }
          return '';
        });
        
        const result = await offlineDbService.updateOfflineDatabase();
        
        expect(result.success).toBe(true);
        expect(result.stats.completeMappings).toBe(1);
        
        const dbStatus = await OfflineDatabase.getMostRecent();
        expect(dbStatus.downloadStatus).toBe('success');
        expect(dbStatus.totalEntries).toBe(1);
      });

      test('should handle file read error during update', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        mockedFs.readFileSync.mockImplementation(() => {
          throw new Error('File not found');
        });

        const result = await offlineDbService.updateOfflineDatabase();

        expect(result.success).toBe(false);
        expect(result.error).toBe('File not found');

        const dbStatus = await OfflineDatabase.getMostRecent();
        expect(dbStatus.downloadStatus).toBe('failed');
        consoleErrorSpy.mockRestore();
      });

      test('should handle invalid JSON data from local file', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        mockedFs.readFileSync.mockReturnValue('invalid json');

        const result = await offlineDbService.updateOfflineDatabase();
        
        expect(result.success).toBe(false);
        expect(result.error).toMatch(/Unexpected token/); // Check for JSON parsing error

        const dbStatus = await OfflineDatabase.getMostRecent();
        expect(dbStatus.downloadStatus).toBe('failed');
        consoleErrorSpy.mockRestore();
      });
    })
  })

  describe('AnimeMapping Model', () => {
    describe('Creating Mappings', () => {
      test('should create mapping with required fields', async () => {
        const mapping = await AnimeMapping.create({
          malId: 1234,
          anidbId: 5678,
          animeTitle: 'Test Anime',
          mappingSource: 'offline_database',
          offlineDbMetadata: {
            type: 'TV',
            episodes: 12,
            sources: ['https://myanimelist.net/anime/1234'],
            synonyms: ['Alternative Title']
          }
        })

        expect(mapping.malId).toBe(1234)
        expect(mapping.anidbId).toBe(5678)
        expect(mapping.animeTitle).toBe('Test Anime')
        expect(mapping.mappingSource).toBe('offline_database')
        expect(mapping.offlineDbMetadata.type).toBe('TV')
      })

      test('should enforce unique MAL ID constraint', async () => {
        await AnimeMapping.create({
          malId: 1,
          anidbId: 101,
          animeTitle: 'Anime 1',
          mappingSource: 'offline_database'
        })
        
        await expect(AnimeMapping.create({
          malId: 1,
          anidbId: 102,
          animeTitle: 'Anime 1 Duplicate',
          mappingSource: 'offline_database'
        })).rejects.toThrow()
      })
    })

    describe('Finding Mappings', () => {
      beforeEach(async () => {
        await AnimeMapping.create([
          { malId: 1, anidbId: 101, animeTitle: 'Cowboy Bebop', mappingSource: 'offline_database' },
          { malId: 2, anidbId: 102, animeTitle: 'Neon Genesis Evangelion', mappingSource: 'user_confirmed' }
        ])
      })

      test('should find mapping by MAL ID', async () => {
        const mapping = await AnimeMapping.findByMalId(1)
        expect(mapping.animeTitle).toBe('Cowboy Bebop')
        expect(mapping.anidbId).toBe(101)
      })

      test('should find mapping by AniDB ID', async () => {
        const mapping = await AnimeMapping.findByAnidbId(102)
        expect(mapping.animeTitle).toBe('Neon Genesis Evangelion')
        expect(mapping.malId).toBe(2)
      })

      test('should return null for non-existent mapping', async () => {
        const mapping = await AnimeMapping.findByMalId(999)
        expect(mapping).toBeNull()
      })
    })

    describe('Confirming Mappings', () => {
      test('should confirm mapping and update source', async () => {
        const userId = new mongoose.Types.ObjectId()
        
        await AnimeMapping.create({
          malId: 1,
          anidbId: 101,
          animeTitle: 'Test Anime',
          mappingSource: 'offline_database'
        })

        const confirmed = await AnimeMapping.confirmMapping(1, userId)
        
        expect(confirmed.mappingSource).toBe('user_confirmed')
        expect(confirmed.confirmedByUserId.toString()).toBe(userId.toString())
      })
    })
  })

  describe('Manual Mapping Creation', () => {
    test('should create manual mapping', async () => {
      const userId = new mongoose.Types.ObjectId()
      
      const mapping = await offlineDbService.createManualMapping(
        9999,
        8888,
        'Manual Test Anime',
        userId
      )

      expect(mapping.malId).toBe(9999)
      expect(mapping.anidbId).toBe(8888)
      expect(mapping.mappingSource).toBe('manual')
      expect(mapping.confirmedByUserId.toString()).toBe(userId.toString())
    })

    test('should update existing mapping when creating manual', async () => {
      const userId = new mongoose.Types.ObjectId()
      
      // Create initial mapping
      await AnimeMapping.create({
        malId: 1,
        anidbId: 101,
        animeTitle: 'Original',
        mappingSource: 'offline_database'
      })

      // Update with manual mapping
      const updated = await offlineDbService.createManualMapping(
        1,
        999,
        'Updated Manual',
        userId
      )

      expect(updated.anidbId).toBe(999)
      expect(updated.mappingSource).toBe('manual')
      expect(updated.confirmedByUserId.toString()).toBe(userId.toString())

      // Verify only one mapping exists
      const count = await AnimeMapping.countDocuments({ malId: 1 })
      expect(count).toBe(1)
    })
  })

  describe('Search Functionality', () => {
    beforeEach(async () => {
      await AnimeMapping.create([
        { 
          malId: 1, 
          anidbId: 101, 
          animeTitle: 'Cowboy Bebop', 
          mappingSource: 'offline_database',
          offlineDbMetadata: { 
            synonyms: ['カウボーイビバップ'],
            type: 'TV'
          }
        },
        { 
          malId: 2, 
          anidbId: 102, 
          animeTitle: 'Neon Genesis Evangelion', 
          mappingSource: 'offline_database',
          offlineDbMetadata: { 
            synonyms: ['新世紀エヴァンゲリオン', 'NGE'],
            type: 'TV'
          }
        },
        { 
          malId: 3, 
          anidbId: 103, 
          animeTitle: 'Attack on Titan', 
          mappingSource: 'offline_database',
          offlineDbMetadata: {
            type: 'TV'
          }
        }
      ])
    })

    test('should search by title', async () => {
      const results = await offlineDbService.searchMappingsByTitle('Cowboy', 10)
      expect(results).toHaveLength(1)
      expect(results[0].animeTitle).toBe('Cowboy Bebop')
    })

    test('should search case insensitively', async () => {
      const results = await offlineDbService.searchMappingsByTitle('cowboy', 10)
      expect(results).toHaveLength(1)
      expect(results[0].animeTitle).toBe('Cowboy Bebop')
    })

    test('should limit search results', async () => {
      const results = await offlineDbService.searchMappingsByTitle('e', 1)
      expect(results).toHaveLength(1)
    })

    test('should return empty array for no matches', async () => {
      const results = await offlineDbService.searchMappingsByTitle('NonExistent', 10)
      expect(results).toHaveLength(0)
    })
  })

  describe('Data Validation', () => {
    test('should validate required fields', async () => {
      const invalidMapping = new AnimeMapping({})
      
      await expect(invalidMapping.save()).rejects.toThrow()
    })

    test('should update timestamps on save', async () => {
      const mapping = await AnimeMapping.create({
        malId: 1,
        anidbId: 101,
        animeTitle: 'Test',
        mappingSource: 'offline_database'
      })

      const originalUpdatedAt = mapping.updatedAt
      
      // Wait a moment and update
      await new Promise(resolve => setTimeout(resolve, 10))
      mapping.animeTitle = 'Updated Test'
      await mapping.save()

      expect(mapping.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime())
    })
  })
}) 