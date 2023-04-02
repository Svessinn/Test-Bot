const path = require("path");
const { Client, Guild } = require("discord.js");
const delAllGuildData = require("../../queries/deleteAllGuildData");
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
 * @param {Guild} guild
 */

module.exports = async (client, guild) => {
  try {
    await delAllGuildData(guild.id);
  } catch (error) {
    logger.log("error", `There was an error running this command: \n${error}`);
    console.log(error);
  }
};
