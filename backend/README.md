# PAISEN

Uodate and manage myanimelist.net anime list and update watched/watching series with jellyfin client

## Instructions

1.  Create a [myanimelist](https://myanimelist.net/) profile

2.  Login to your profile and go to [API config page](https://myanimelist.net/apiconfig)

3.  Create a new ID as shown

![mal](./extra/mal.jpg)

4.  Click submit and a new ID will be created. Copy the clentID after creation.

5.  Install [Node.js](https://nodejs.org/en) and [mongoDB](https://www.mongodb.com/)

6.  Take a pull of this branch and install node dependencies as

        `git clone  https://github.com/ninjashari/paisen.git`
        
        `cd paisen`
        
        `npm i`
        
        Create a .env file here with following text :
        
                ```
                    PORT=5000

                    NODE_ENV=development

                    ATLAS_URI=mongodb://127.0.0.1:27017

                ```

7.  To start node dev server:

        `npm start`

8.  Now, got to frontend folder and open README.md and follow instructions