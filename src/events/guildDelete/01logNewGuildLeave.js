const path = require("path");
const { Client, Guild } = require("discord.js");

// Logging tool
const winston = require("winston");
const logger = winston.createLogger({
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: `logs/log.log` })],
  format: winston.format.printf(
    (log) =>
      `[${log.level.toUpperCase()}] - ${path.basename(__filename)} - ${log.message} ${new Date(Date.now()).toUTCString()}`
  ),
});

const guildLogger = winston.createLogger({
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: `logs/guild.log` })],
  format: winston.format.printf(
    (log) =>
      `[${log.level.toUpperCase()}] - ${path.basename(__filename)} - ${log.message} ${new Date(Date.now()).toUTCString()}`
  ),
});

/**
 * @param {Client} client
 * @param {Guild} guild
 */

module.exports = async (client, guild) => {
  try {
    guildLogger.log("info", `Left guild ${guild.name} with ID: ${guild.id}`);
  } catch (error) {
    logger.log("error", `There was an error deleting guild data for ${guild.id} \n${error}`);
    console.log(error);
  }
};
