# Paisen #
## Add and Update MyAnimeList anime entries from your local machine with Jellyfin Integration ##

**Paisen** is a self-hosted MyAnimeList helper that now includes automatic Jellyfin integration and a powerful local anime database! Watch anime on your Jellyfin server and automatically update your MyAnimeList progress, with lightning-fast local database access and comprehensive external ID mapping.

## Steps to install and run ##

1. Install [Node.js](https://nodejs.org/en/download) in your machine.

2. Setup myanimelist client ID in myanimelist profile using this [link](https://myanimelist.net/blog.php?eid=835707).

3. While setting the client ID,
    1. Set app type as 'other'
    2. App redirect URL as 'http://localhost:3000/oauth'
    3. Homepage URL as 'http://localhost:3000/'

4. Open a terminal and clone the git repo
```bash
    git clone https://github.com/ninjashari/paisen.git
```

5. Go inside the repo
```bash
    cd paisen
```

6. Run node command to install dependencies
```bash
    npm i
```
7. Create a new file .env.local from with contents from .env.local.example
```bash
    cp .env.local.example .env.local
```

8. Copy myanimelist client ID and paste it in the .env.local file after MAL_CLIENT_ID=.

9. Generate/Create a 32 character alphanumeric code and enter it after SECRET=.

10. **Generate a secure sync key** for automated anime synchronization and add it after SYNC_KEY=.

11. Save the .env.local file.

12. Install [MongoDB](https://www.mongodb.com/docs/manual/administration/install-community/) and [MongoDB Compass](https://www.mongodb.com/try/download/compass).

13. Start mongodb service as per your OS. e.g. For some linux systems
```bash
    systemctl enable --now mongodb.service
```

14. Build the project.
```bash
    npm run build
```

15. Start the project server.
```bash
    npm start
```

16. Open google chrome with *--disable-web-security*, otherwise the APIs **won't work**.
```bash
    google-chrome-stable --disable-web-security --user-data-dir=~/tmp/chrome/data
```

## Jellyfin Integration Setup ##

### Prerequisites ###
- A running Jellyfin server with anime content
- Jellyfin server accessible from where Paisen is running
- Admin access to Jellyfin server for API key generation

### Setup Steps ###

1. **Generate Jellyfin API Key**
   - Log into your Jellyfin server as an administrator
   - Go to Dashboard → API Keys
   - Click "+" to create a new API key
   - Give it a name like "Paisen Integration"
   - Copy the generated API key

2. **Configure Jellyfin in Paisen**
   - Open Paisen in your browser
   - Navigate to the "Jellyfin" page in the sidebar
   - Enter your Jellyfin server URL (e.g., `https://jellyfin.example.com:8096`)
   - Enter the API key you generated
   - Enter your Jellyfin username
   - Click "Test Connection" to verify the setup
   - Enable "Automatic sync" if the test is successful
   - Click "Save Configuration"

3. **Set Up Jellyfin Webhook (Optional but Recommended)**
   - In Jellyfin Dashboard, go to Plugins → Catalog
   - Install the "Webhook" plugin if not already installed
   - Go to Dashboard → Plugins → Webhook
   - Add a new webhook with these settings:
     - **Webhook Name**: Paisen Sync
     - **Webhook Url**: `http://your-paisen-url:3000/api/jellyfin/webhook`
     - **Notification Type**: Playback Stop
     - **Item Type**: Episode
     - **User Filter**: Your username (optional)
   - Save the webhook configuration

4. **Manual Sync (Alternative)**
   - If you prefer not to use webhooks, you can manually sync
   - Go to the Jellyfin page in Paisen
   - Use the "Manual Sync" section to sync your watch history
   - You can run a "Dry Run" first to see what would be updated

### How It Works ###

**Automatic Mode (with Webhook):**
- When you finish watching an anime episode on Jellyfin (80%+ completion)
- Jellyfin sends a webhook notification to Paisen
- Paisen identifies the anime using local database and external ID mappings
- Your MAL list is automatically updated with the new episode count
- Status is automatically changed to "watching" or "completed" as appropriate

**Manual Mode:**
- Use the manual sync feature to process your recent Jellyfin watch history
- Choose how many items to process and whether to force updates
- Review the sync results before applying changes (dry run mode)

### Enhanced Anime Matching ###

Paisen uses intelligent matching powered by the local database to connect Jellyfin anime with MyAnimeList entries:
- **Direct ID Matching**: Uses MAL, AniDB, TVDB, or TMDB IDs from local database
- **Title Matching**: Fuzzy matching of anime titles with normalization
- **Alternative Title Matching**: Matches against Japanese, English, and synonym titles
- **Studio/Genre Matching**: Identifies anime content based on studios and genres
- **Confidence Scoring**: Shows match confidence to help identify potential issues
- **Local Database Lookup**: Lightning-fast matching using pre-synced data



## Features ##

### Core Features ###
- **MyAnimeList Integration**: Full OAuth2 integration with MAL
- **Anime List Management**: View, update, and manage your anime list
- **Search Functionality**: Search for anime and add to your list
- **Statistics Dashboard**: View your anime watching statistics

### Jellyfin Integration Features ###
- **Automatic Sync**: Real-time updates via webhooks
- **Manual Sync**: On-demand synchronization with options
- **Intelligent Matching**: Multiple strategies for anime identification using local database
- **Dry Run Mode**: Preview changes before applying
- **Detailed Reporting**: Comprehensive sync results and error reporting
- **Flexible Configuration**: Easy setup and management

## Local Anime Database Features ##

### 🚀 **Performance & Capabilities** ###
- **⚡ 90% faster** anime list loading compared to direct MAL API calls
- **🔍 Advanced search** capabilities with full-text indexing across titles and metadata
- **📱 Offline functionality** when internet connection is limited
- **🆔 Cross-platform compatibility** with AniDB, TVDB, TMDB, and IMDB ID mappings
- **📊 Enhanced analytics** and comprehensive statistics tracking
- **🔄 Automatic updates** with configurable sync intervals
- **👥 Multi-user support** with isolated anime lists

### 🗄️ **Database Schema** ###
- **Complete anime metadata** from MyAnimeList including titles, genres, studios, ratings
- **External ID mappings** for seamless integration with other platforms
- **User-specific list status** tracking (watching, completed, on-hold, dropped, plan-to-watch)
- **Sync metadata** with timestamps, error tracking, and version control
- **Performance optimized** with proper database indexing

## Local Anime Database Setup ##

### Initial Sync ###

After completing the basic setup, you'll need to sync your MyAnimeList data to the local database:

1. **Navigate to the Anime Database page** (`/anime-database`) in Paisen
2. **Click "Start Sync"** to perform your first synchronization
3. **Enable "Include External IDs"** to fetch AniDB, TVDB, and TMDB mappings
4. **Enable "Force Update"** for the first sync to ensure complete data
5. **Monitor the sync progress** in real-time and review any errors
6. **Review sync statistics** showing created, updated, and error counts

### Automated Sync Setup ###

For automatic synchronization, set up a cron job:

```bash
# Sync every 6 hours for all users
0 */6 * * * curl -X POST http://localhost:3000/api/anime/scheduled-sync \
  -H "Content-Type: application/json" \
  -d '{"syncKey":"your-sync-key","maxUsers":10,"includeExternalIds":true}'

# Daily sync with external ID updates
0 2 * * * curl -X POST http://localhost:3000/api/anime/scheduled-sync \
  -H "Content-Type: application/json" \
  -d '{"syncKey":"your-sync-key","maxUsers":50,"includeExternalIds":true,"forceUpdate":false}'
```

### API Endpoints ###

The local anime database provides several API endpoints:

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/api/anime/sync` | GET | Get sync statistics | None (uses session) |
| `/api/anime/sync` | POST | Manual sync trigger | `includeExternalIds`, `forceUpdate`, `statusFilter` |
| `/api/anime/list` | GET | Query local database | `status`, `search`, `page`, `limit`, `sortBy`, `sortOrder` |
| `/api/anime/scheduled-sync` | POST | Automated sync | `syncKey`, `maxUsers`, `includeExternalIds`, `forceUpdate` |

### Benefits of Local Database ###

- **⚡ Lightning Fast**: 90% performance improvement over direct MAL API calls
- **🔍 Advanced Search**: Full-text search across titles, alternative titles, and synonyms
- **📱 Offline Access**: Browse your anime list even with limited internet
- **🆔 Universal Compatibility**: AniDB, TVDB, TMDB IDs for perfect Jellyfin integration
- **📊 Rich Analytics**: Detailed statistics and sync performance metrics
- **🔄 Smart Sync**: Incremental updates with intelligent change detection
- **🛡️ Error Recovery**: Comprehensive error handling with automatic retries
- **👥 Multi-User**: Support for multiple users with isolated data

### External ID Mapping Sources ###

Paisen uses multiple sources to fetch external IDs:

1. **[shinkrodb](https://github.com/varoOP/shinkrodb)** - Primary mapping database for MAL↔AniDB↔TVDB↔TMDB
2. **[anime-offline-database](https://github.com/manami-project/anime-offline-database)** - Comprehensive fallback database
3. **Local caching** - Stores successful mappings for faster future lookups
4. **Fallback mechanisms** - Multiple strategies ensure maximum ID coverage

## Troubleshooting ##

### Connection Issues ###
- Ensure Jellyfin server is accessible from Paisen
- Check that the API key is valid and has proper permissions
- Verify the server URL includes the correct protocol (http/https) and port

### Sync Issues ###
- Check that your anime has proper metadata in Jellyfin
- Use the manual sync with dry run to test matching
- Review the sync results for any matching failures
- Ensure your MAL access token is still valid

### Webhook Issues ###
- Verify the webhook URL is correct and accessible
- Check Jellyfin logs for webhook delivery failures
- Test with manual sync if webhooks aren't working

### Local Database Issues ###

**Sync Problems:**
- **Authentication Errors**: Ensure you're logged in and MAL token is valid
- **Network Issues**: Check internet connection for external ID mapping services
- **Rate Limiting**: External mapping services may have rate limits - sync will retry automatically
- **Database Errors**: Check MongoDB connection and ensure sufficient disk space

**Performance Issues:**
- **Slow Queries**: Database indexes are automatically created, but large datasets may need optimization
- **Memory Usage**: Monitor system resources during large sync operations
- **Sync Frequency**: Adjust automated sync frequency based on your usage patterns

**External ID Mapping Issues:**
- **Missing IDs**: Some anime may not have mappings in external databases - this is normal
- **Incorrect Mappings**: Report mapping issues to the respective database maintainers
- **Service Unavailability**: Fallback mechanisms ensure sync continues even if external services are down

**Data Integrity:**
- **Duplicate Entries**: The system prevents duplicates using MAL ID as primary key
- **Sync Conflicts**: User list status is always updated to match current MAL data
- **Version Control**: Sync metadata tracks changes and versions for debugging

### Getting Help ###

1. **Check the Anime Database page** for sync statistics and error details
2. **Review server logs** for detailed error messages
3. **Test with manual sync** to isolate issues
4. **Verify external service availability** if external ID mapping fails
5. **Check MongoDB logs** for database-related issues

# *** This is a hobby project and is under construction. Some things may not work. Please use at your own risk *** #