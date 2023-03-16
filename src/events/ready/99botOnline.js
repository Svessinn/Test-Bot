const path = require('path');
const { Client } = require('discord.js');

// Logging tool
const winston = require('winston');
const logger = winston.createLogger({
	transports: [
		new winston.transports.Console(),
		new winston.transports.File({ filename: `logs/log.log` }),
	],
	format: winston.format.printf(log => `[${log.level.toUpperCase()}] - ${path.basename(__filename)} - ${log.message} ${new Date(Date.now()).toUTCString()}`),
});

/**
 * 
 * @param {Client} bot 
 */

module.exports = (bot) => {
  logger.log('info', `"${bot.user.username}" is online.`);
};