const path = require("path");
const { Client } = require("discord.js");

// Logging tool
const winston = require("winston");
const logger = winston.createLogger({
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: `logs/log.log` })],
  format: winston.format.printf(
    (log) => `[${log.level.toUpperCase()}] - ${path.basename(__filename)} - ${log.message} ${new Date(Date.now()).toUTCString()}`
  ),
});

/**
 *
 * @param {Client} client
 */

module.exports = (client) => {
  logger.log("info", `"${client.user.tag}" is online.`);
};
