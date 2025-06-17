/**
 * Simplified Jellyfin Integration Tests
 * 
 * This test suite validates core Jellyfin API integration functionality
 * with simplified mocking to ensure reliable test execution.
 */

describe('Jellyfin Integration', () => {
  describe('Core Functionality', () => {
    /**
     * Test that the Jellyfin API class can be imported and instantiated
     */
    test('should be able to import and instantiate JellyfinApi', () => {
      // Dynamic import to avoid module loading issues
      const JellyfinApi = require('../lib/jellyfin').default || require('../lib/jellyfin')
      
      const api = new JellyfinApi('http://localhost:8096', 'test-key', 'test-user')
      
      expect(api.serverUrl).toBe('http://localhost:8096')
      expect(api.apiKey).toBe('test-key')
      expect(api.userId).toBe('test-user')
    })

    /**
     * Test URL normalization
     */
    test('should normalize server URLs correctly', () => {
      const JellyfinApi = require('../lib/jellyfin').default || require('../lib/jellyfin')
      
      const apiWithSlash = new JellyfinApi('http://localhost:8096/', 'test-key')
      const apiWithoutSlash = new JellyfinApi('http://localhost:8096', 'test-key')
      
      expect(apiWithSlash.serverUrl).toBe('http://localhost:8096')
      expect(apiWithoutSlash.serverUrl).toBe('http://localhost:8096')
    })

    /**
     * Test anime information extraction
     */
    test('should extract anime information from Jellyfin items', () => {
      const JellyfinApi = require('../lib/jellyfin').default || require('../lib/jellyfin')
      const api = new JellyfinApi('http://localhost:8096', 'test-key')

      const mockItem = {
        Id: 'episode123',
        Name: 'Episode 5',
        SeriesName: 'Attack on Titan',
        ParentIndexNumber: 1,
        IndexNumber: 5,
        ProductionYear: 2013,
        Overview: 'Test episode description',
        Genres: ['Animation', 'Action'],
        Studios: [{ Name: 'MAPPA' }],
        ProviderIds: {
          AniDb: '9541',
          MyAnimeList: '16498'
        },
        UserData: {
          Played: true,
          PlaybackPositionTicks: 1500000000
        }
      }

      const result = api.extractAnimeInfo(mockItem)

      expect(result.jellyfinId).toBe('episode123')
      expect(result.title).toBe('Episode 5')
      expect(result.seriesName).toBe('Attack on Titan')
      expect(result.seasonNumber).toBe(1)
      expect(result.episodeNumber).toBe(5)
      expect(result.year).toBe(2013)
      expect(result.genres).toEqual(['Animation', 'Action'])
      expect(result.studios).toEqual(['MAPPA'])
      expect(result.providerIds.anidb).toBe('9541')
      expect(result.providerIds.mal).toBe('16498')
      expect(result.userData.Played).toBe(true)
    })

    /**
     * Test anime studio identification
     */
    test('should identify known anime studios', () => {
      const JellyfinApi = require('../lib/jellyfin').default || require('../lib/jellyfin')
      const api = new JellyfinApi('http://localhost:8096', 'test-key')

      // Known anime studios
      expect(api.isAnimeStudio('MAPPA')).toBe(true)
      expect(api.isAnimeStudio('Studio Ghibli')).toBe(true)
      expect(api.isAnimeStudio('Toei Animation')).toBe(true)
      expect(api.isAnimeStudio('Kyoto Animation')).toBe(true)

      // Non-anime studios
      expect(api.isAnimeStudio('Universal Pictures')).toBe(false)
      expect(api.isAnimeStudio('Warner Bros')).toBe(false)
      expect(api.isAnimeStudio('Disney')).toBe(false)
    })

    /**
     * Test webhook payload parsing
     */
    test('should parse webhook payloads correctly', () => {
      const JellyfinApi = require('../lib/jellyfin').default || require('../lib/jellyfin')
      const api = new JellyfinApi('http://localhost:8096', 'test-key')

      const mockPayload = {
        NotificationType: 'PlaybackStop',
        UserId: 'user123',
        ItemId: 'episode456',
        ItemType: 'Episode',
        Name: 'Episode 1',
        SeriesName: 'Naruto',
        SeasonNumber: 1,
        EpisodeNumber: 1,
        PlaybackPositionTicks: 14000000000,
        RunTimeTicks: 14400000000,
        UtcTimestamp: '2023-12-01T12:00:00Z'
      }

      const result = api.parseWebhookPayload(mockPayload)

      expect(result.eventType).toBe('PlaybackStop')
      expect(result.userId).toBe('user123')
      expect(result.itemId).toBe('episode456')
      expect(result.itemType).toBe('Episode')
      expect(result.itemName).toBe('Episode 1')
      expect(result.seriesName).toBe('Naruto')
      expect(result.seasonNumber).toBe(1)
      expect(result.episodeNumber).toBe(1)
      expect(result.playbackPosition).toBe(14000000000)
      expect(result.runtime).toBe(14400000000)
      expect(result.timestamp).toBeInstanceOf(Date)
    })
  })

  describe('API Integration', () => {
    /**
     * Test that API endpoints exist and are accessible
     */
    test('should have all required API endpoints', async () => {
      // Test that the API files exist
      const fs = require('fs')
      const path = require('path')

      const apiPaths = [
        'pages/api/jellyfin/config.js',
        'pages/api/jellyfin/sync.js',
        'pages/api/jellyfin/webhook.js',
        'pages/api/jellyfin/library.js',
        'pages/api/jellyfin/activity.js'
      ]

      apiPaths.forEach(apiPath => {
        const fullPath = path.join(process.cwd(), apiPath)
        expect(fs.existsSync(fullPath)).toBe(true)
      })
    })

    /**
     * Test that database API endpoints exist
     */
    test('should have all required database API endpoints', () => {
      const fs = require('fs')
      const path = require('path')

      const dbApiPaths = [
        'pages/api/database/anime-stats.js',
        'pages/api/database/user-stats.js',
        'pages/api/database/sync-stats.js',
        'pages/api/database/integrity-check.js'
      ]

      dbApiPaths.forEach(apiPath => {
        const fullPath = path.join(process.cwd(), apiPath)
        expect(fs.existsSync(fullPath)).toBe(true)
      })
    })
  })

  describe('Page Components', () => {
    /**
     * Test that new pages exist
     */
    test('should have Jellyfin info page', () => {
      const fs = require('fs')
      const path = require('path')

      const jellyfinInfoPath = path.join(process.cwd(), 'pages/jellyfin-info.js')
      expect(fs.existsSync(jellyfinInfoPath)).toBe(true)
    })

    /**
     * Test that database info page exists
     */
    test('should have database info page', () => {
      const fs = require('fs')
      const path = require('path')

      const databaseInfoPath = path.join(process.cwd(), 'pages/database-info.js')
      expect(fs.existsSync(databaseInfoPath)).toBe(true)
    })
  })

  describe('Configuration', () => {
    /**
     * Test that Jest configuration is properly set up
     */
    test('should have proper Jest configuration', () => {
      const fs = require('fs')
      const path = require('path')

      const jestConfigPath = path.join(process.cwd(), 'jest.config.js')
      const jestSetupPath = path.join(process.cwd(), 'jest.setup.js')

      expect(fs.existsSync(jestConfigPath)).toBe(true)
      expect(fs.existsSync(jestSetupPath)).toBe(true)
    })

    /**
     * Test that package.json has test scripts
     */
    test('should have test scripts in package.json', () => {
      const fs = require('fs')
      const path = require('path')

      const packageJsonPath = path.join(process.cwd(), 'package.json')
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

      expect(packageJson.scripts.test).toBeDefined()
      expect(packageJson.scripts['test:watch']).toBeDefined()
      expect(packageJson.scripts['test:coverage']).toBeDefined()
    })
  })
}) 