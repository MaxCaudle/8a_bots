# 8a_bots
Whether or not they intended this, 8a has created an API the public can hit. As the best part of 8a after ticking sendies is fucking with your friends - it seemed like a good idea to start playing with the API.

A climbing slack group I'm in (it's cooler than it sounds) was complaining about the feature drop the new 8a included. They took away XSS from us, and the more nefarious users (not me!) haven't figured out how to get it back. They also took away the ability to follow your friends (now reinstated). But, a week ago it wasn't there and a week ago I began the journey of writing the evil that is JS.

Anyway. This repo might end up holding other bots, but for now - it is just Jens.

## Jens
I Jens better than Jens. After 2 weeks of not getting notifications when my friends sent riggies, I almost quit 8a, and as the only purpose of climbing is logging 8a I almost quit climbing. Instead, I wrote a firebase app that checks for sends every hour and posts them to a slack channel.

I currently have 3 `/slash` commands, which you trigger from slack.  
1. `/jens add user-name` - I add a user to the database. The user-name should be the name in the user's url. E.g. for me, the URL to my profile is: `https://www.8a.nu/user/mason-caiby` and the slash command to add me is: `/jens add mason-caiby`. I will let you know in a private message if the user already exists in the Database
1. `/jens list` - I send a message to the user that triggers it with a list of users in the database.
1. `/jens check` - I will check to see if a user has sent a route in the current year, and post it to whichever channel you have me configured to. I also update the database so it isn't posted again. This function is also run every hour.
