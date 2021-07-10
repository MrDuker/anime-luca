# anime-luca
Source code for the private moderation bot on my [personal discord server.](https://discord.gg/CQTSjVea8e)

### Bot Features
> **NOTE:**
> This bot is primarily focused to work only on a __single__ server. Which means that **no, unfortunately you cannot really use this as a proper example for moderation bots.**

Here are the bot features available so far:
- Small caching system
- Custom small database system
- Warn-based moderation system
	- Clear warnings
	- Adding warnings
	- Listing warnings
- FAQ \/ frequently-asked-questions
- Join position command
- Mimicing people with webhooks
- Mute system
	- Continuing to listen to mute timeouts after bot login/restart
- Moderation logging
	- Welcome & Leaves
- Automation
	- Auto-role for member joins
	- Auto-filter for unmentionable usernames/nicknames with [`decancer`](https://npm.im/decancer)
	- Auto-dehoist for usernames/nicknames
	- Anti-N-word
	- Anti-discord-ads (except for in a special advertising channel)
	- Only-once-advertisement system
- Eval command
	- Fake eval command

### Running
Testing/running the bot is easy. Just clone this repo and run the following on your terminal:
```bash
$ npm i && node .
```

### Environment Variables
Here are the list of environment variables (A.K.A secrets) used by the bot:
```
# mongodb database URI here.
DB_URI=mongodb+srv://username:password1234@cluster0-9abcd.mongodb.net/main?retryWrites=true&w=majority

# discord webhook path used for logging moderation events
LOGGERS_WEBHOOK=/api/webhooks/WEBHOOK_ID/WEBHOOK_TOKEN

# your discord token
TOKEN=???

# discord webhook path used for the bot's mimic command
WEBHOOK_URL=/api/webhooks/WEBHOOK_ID/WEBHOOK_TOKEN
```

### Directories
Here are some information on the bot's directory and files so you don't get lost:
- [`index.js`](https://github.com/vierofernando/anime-luca/blob/main/index.js) The main entry point for the program. **No, this is not the bot's main file.**
- [`bot/`](https://github.com/vierofernando/anime-luca/tree/main/bot) The core bot files.
	- [`bot/constants.js`](https://github.com/vierofernando/anime-luca/blob/main/bot/weeb.js) The bot constants. More of a config file.
	- [`bot/constants.js`](https://github.com/vierofernando/anime-luca/blob/main/bot/constants.js) The bot constants. More of a config file.
	- [`bot/db.js`](https://github.com/vierofernando/anime-luca/blob/main/bot/db.js) The bot's database handler. The bot uses [`mongodb`](https://mongodb.com/) for it's database and [`mongodb`](https://npm.im/mongodb) as it's driver.
	- [`bot/faq.txt`](https://github.com/vierofernando/anime-luca/blob/main/bot/faq.txt) The main FAQ file contents used for the bot's faq command.
	- [`bot/logger.js`](https://github.com/vierofernando/anime-luca/blob/main/bot/logger.js) Console logger file. Acts like the [chalk npm module.](https://npm.im/chalk) with it's regex parser.
	- [`bot/mainGuild.js`](https://github.com/vierofernando/anime-luca/blob/main/bot/mainGuild.js) Handles the *"single-guild caching system"*. Here, only little guild info and members info are cached.
	- [`bot/util.js`](https://github.com/vierofernando/anime-luca/blob/main/bot/util.js) Utility functions.
	- [`bot/weeb.js`](https://github.com/vierofernando/anime-luca/blob/main/bot/weeb.js) The core bot file. Where the bot starts and dies.
- [`anime-list/`](https://github.com/vierofernando/anime-luca/tree/main/anime-list) The command files.
- [`anime-events/`](https://github.com/vierofernando/anime-luca/tree/main/anime-list) Gateway event handler files.