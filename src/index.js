/**
 * To use index.js change your package.json's main to "src/index.js"
 */

// importing stuff
require("dotenv").config();
const { Client, IntentsBitField } = require("discord.js");
const TOKEN = process.env.TOKEN;
const eventHandler = require("./handlers/eventHandler");

// Setting up the bot client
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.GuildPresences,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

eventHandler(client);

// Logging in
client.login(TOKEN);
