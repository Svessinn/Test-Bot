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
    // IntentsBitField.Flags.AutoModerationConfiguration,
    // IntentsBitField.Flags.AutoModerationExecution,
    // IntentsBitField.Flags.DirectMessagePolls,
    // IntentsBitField.Flags.DirectMessageReactions,
    // IntentsBitField.Flags.DirectMessageTyping,
    // IntentsBitField.Flags.DirectMessages,
    IntentsBitField.Flags.GuildBans,
    IntentsBitField.Flags.GuildEmojisAndStickers,
    // IntentsBitField.Flags.GuildExpressions,
    // IntentsBitField.Flags.GuildIntegrations,
    IntentsBitField.Flags.GuildInvites,
    IntentsBitField.Flags.GuildMembers,
    // IntentsBitField.Flags.GuildMessagePolls,
    // IntentsBitField.Flags.GuildMessageReactions,
    // IntentsBitField.Flags.GuildMessageTyping,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildModeration,
    // IntentsBitField.Flags.GuildPresences,
    IntentsBitField.Flags.GuildScheduledEvents,
    // IntentsBitField.Flags.GuildVoiceStates,
    // IntentsBitField.Flags.GuildWebhooks,
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.MessageContent,
  ],
});

eventHandler(client);

// Logging in
client.login(TOKEN);
