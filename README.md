# Paisen #
## Add and Update MyAnimeList anime entries from your local machine with Jellyfin Integration ##

**Paisen** is a self-hosted MyAnimeList helper that now includes automatic Jellyfin integration! Watch anime on your Jellyfin server and automatically update your MyAnimeList progress.

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

10. Save the .env.local file.

11. Install [MongoDB](https://www.mongodb.com/docs/manual/administration/install-community/) and [MongoDB Compass](https://www.mongodb.com/try/download/compass).

12. Start mongodb service as per your OS. e.g. For some linux systems
```bash
    systemctl enable --now mongodb.service
```

13. Build the project.
```bash
    npm run build
```

14. Start the project server.
```bash
    npm start
```

15. Open google chrome with *--disable-web-security*, otherwise the APIs **won't work**.
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
- Paisen identifies the anime and matches it with MyAnimeList
- Your MAL list is automatically updated with the new episode count
- Status is automatically changed to "watching" or "completed" as appropriate

**Manual Mode:**
- Use the manual sync feature to process your recent Jellyfin watch history
- Choose how many items to process and whether to force updates
- Review the sync results before applying changes (dry run mode)

### Anime Matching ###

Paisen uses intelligent matching to connect Jellyfin anime with MyAnimeList entries:
- **Direct ID Matching**: Uses MAL or AniDB IDs if present in Jellyfin metadata
- **Title Matching**: Fuzzy matching of anime titles with normalization
- **Studio/Genre Matching**: Identifies anime content based on studios and genres
- **Confidence Scoring**: Shows match confidence to help identify potential issues

### Troubleshooting ###

**Connection Issues:**
- Ensure Jellyfin server is accessible from Paisen
- Check that the API key is valid and has proper permissions
- Verify the server URL includes the correct protocol (http/https) and port

**Sync Issues:**
- Check that your anime has proper metadata in Jellyfin
- Use the manual sync with dry run to test matching
- Review the sync results for any matching failures
- Ensure your MAL access token is still valid

**Webhook Issues:**
- Verify the webhook URL is correct and accessible
- Check Jellyfin logs for webhook delivery failures
- Test with manual sync if webhooks aren't working

## Features ##

### Core Features ###
- **MyAnimeList Integration**: Full OAuth2 integration with MAL
- **Anime List Management**: View, update, and manage your anime list
- **Search Functionality**: Search for anime and add to your list
- **Statistics Dashboard**: View your anime watching statistics

### Jellyfin Integration Features ###
- **Automatic Sync**: Real-time updates via webhooks
- **Manual Sync**: On-demand synchronization with options
- **Intelligent Matching**: Multiple strategies for anime identification
- **Dry Run Mode**: Preview changes before applying
- **Detailed Reporting**: Comprehensive sync results and error reporting
- **Flexible Configuration**: Easy setup and management

# *** This is a hobby project and is under construction. Some things may not work. Please use at your own risk *** #