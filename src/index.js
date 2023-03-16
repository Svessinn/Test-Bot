// importing stuff
require('dotenv').config();
const path = require('path');
const { Client, IntentsBitField } = require('discord.js');
const TOKEN = process.env.TOKEN;

// Setting up the bot client
const bot = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ]
});

// Logging tool
const winston = require('winston');
const logger = winston.createLogger({
	transports: [
		new winston.transports.Console(),
		new winston.transports.File({ filename: `logs/log.log` }),
	],
	format: winston.format.printf(log => `[${log.level.toUpperCase()}] - ${path.basename(__filename)} - ${log.message} ${new Date(Date.now()).toUTCString()}`),
});

// Connecting to a database
const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Event handler shit
const eventHandler = require('./handlers/eventHandler');
eventHandler(bot);

// Logging in
bot.login(TOKEN);
