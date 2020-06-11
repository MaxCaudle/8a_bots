# Jens

I Jens better than Jens himself. Important warning - 8a's API, which I rely on might be private. You might get in trouble for using this. The author doesn't know.

I currently have 3 `/slash` commands, which you trigger from slack.  
1. `/jens add user-name` - I add a user to the database. The user-name should be the name in the user's url. E.g. for me, the URL to my profile is: `https://www.8a.nu/user/mason-caiby` and the slash command to add me is: `/jens add mason-caiby`. I will let you know in a private message if the user already exists in the Database
1. `/jens list` - I send a message to the user that triggers it with a list of users in the database.
1. `/jens check` - I will check to see if a user has sent a route in the current year, and post it to whichever channel you have me configured to. I also update the database so it isn't posted again. This function is also run every hour.

## Making your own Jens
Making a Jens will require a lot of setup. But, might be worth it if you're bored.

1. You'll need a slack group - you're on you're own for this one
1. Then you'll need to make a new firebase app. It HAS to have the `Blaze pay a you go plan` I have mine set to alert me if I'm going to spend $1 a month. It's free so far.
1. You'll need to add an app to your slack space.
1. You'll need to configure some things in this repo.

I've had the pleasure of using well written help guides and will try to emulate them here.
### Make your firebase app
1. https://firebase.google.com/
1. Login with you google account
1. Click `Get Started` Button.
1. `Create a project`
1. Name it and accept terms
1. I disabled Google Analytics - you do you
1. Create a Firebase database  
    1. Once your project is made click `Database` under `Develop` in the left side bar
    1. Click `enable database`
1. Make sure you are set to the `blaze` payment plan
    1. Click the gear beside `Project Overview` in the left pane
    1. `Usage and billing`
    1. `Details & Settings`
    1. `Modify Plan`
    1. `Blaze`
    1. You should now just follow their steps.
1. Ok. You're done with firebase for now

### Add the app to your slack space
1. In the Slack App Click `Apps` in the left side bar
1. `Browse App Directory`
1. In the webpage you are brought to click `Build` in the top bar.
1. `Start Building`
1. Give it a name and select the appropriate workspace
1. There might be some steps here, Sorry I'm not going to make a second App to write a how-to
1. Make sure the App is installed in your workspace
1. Click `Add features and functionality`
1. `Incoming Webhooks` create a new webhook for whatever channel you want
Jens to post to - you'll need the hook later
1. `Slash commands` - you'll need to make a new slash command. Mine is `/jens` and this is my help comment `/jens add user-name | list | check`
1. `Bots` should be enabled (automatically?)
1. `Permissions` should also be the default it is set to (?)

### Configure your clone of this repo.
Ok cool. Now you're ready to install the App to firebase and everything.

1. Clone this repo with whatever method you prefer (I use SSH keys because I have to).  
```git clone git@github.com:MasonCaiby/8a_bots.git```
or   
```git clone https://github.com/MasonCaiby/8a_bots.git```
1. `cd jens`
1. Make sure you have `node 10` installed `nvm install 10`
1. `nvm use 10`
1. Install the firebase cli tools `npm install -g firebase-tools`
1. You might need to `firebase init` to set it to the correct firebase? Idk I've never done this. Maybe try editing `.firebaserc` to the correct project from the firebase console.
1. Copy `functions/slackHooks.js.example` to `functions/slackHooks.js`
1. Add the Webhook you made in the slack step here. I wouldn't change the var name unless you want to fix it elsewhere.
1. and you SHOULD be good to `firebase deploy`

## Post installation
Ok cool, now you're ready to Jens! I would add some people to your DB `jens add user-name`. If you want to check that he's working, I decrement the number of sends a user has by going into the database and changing the number (you must `enter` to save the changes)

## How I work
I am a stack of axios requests to 8a's API (public or private, IDK) And store the number of sends for a user and in a database. Then we just check if the number of sends has changed. Why not store their sends? I wanted to keep the DB a bit smaller. This is probably more performant too. There's the edge case that someone posts a send from the same year, but before their latest tick and I post the wrong one. But I (the author) don't feel like accounting or that.