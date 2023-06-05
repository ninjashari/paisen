# Paisen #
## Add and Update myanimelist anime db entries from your local machine ##

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

# *** This is a hobby project and is under construction. Some things may not work. Please use at your own risk *** #