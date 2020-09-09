# Discord bot

Discord bot for personal use.

### How to run

```npm install```

You need to add following directory structure manually:
```
root
  ...
  config.json
  logs
    combined.log
  leaderboards
    leaderboard_KO.json
```

You also need to add these lines to your config.json:
```
{
    "prefix" : "DESIRED TOKEN FOR YOUR COMMANDS (eg. "!")",
    "token" : "YOUR DISCORD BOT TOKEN",
    "twitchClientID": "YOUR TWITCH CLIENT ID (for twitch command)",
    "pastebinKey": "YOUR PASTEBIN DEV KEY (for print command)"
}
```

