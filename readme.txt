To run the bot:
  Be in the main 'Test Bot' folder, not the 'src' folder
  
  Run the 'node src/index' command
  And if that is successful, the bot will send a message similar to:
    [INFO] - 99botOnline.js - "Test Bot#0204" is online. Thu, 24 Oct 2024 19:23:23 GMT

  If you bot has joined around 500-2000 servers you should use sharding
  There is already a sharding manager coded for the bot
  To run the bot in Sharding mode
  Run the 'node src/sharding' command
  And if that is successful the bot will send a message similar to:
    [INFO] - sharding.js - Shard 0 ready Fri, Thu, 24 Oct 2024 19:24:23 GMT
    [INFO] - 99botOnline.js - "Test Bot#0204" is online. Thu, 24 Oct 2024 19:24:24 GMT
  Depending on the amount of servers that your bot is in
  The amount of shards will increase
  (This version of the bot is only in 2 servers, so there's only Shard 0)