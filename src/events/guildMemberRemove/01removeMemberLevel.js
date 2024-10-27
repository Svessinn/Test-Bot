const path = require("path");
const { Client, Interaction } = require("discord.js");
const delGuildUserLevel = require("../../queries/deleteGuildUserLevel");

// Logging tool
const winston = require("winston");
const logger = winston.createLogger({
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: `logs/log.log` })],
  format: winston.format.printf(
    (log) => `[${log.level.toUpperCase()}] - ${path.basename(__filename)} - ${log.message} ${new Date(Date.now()).toUTCString()}`
  ),
});

/**
 * @param {Client} client
 * @param {Interaction} interaction
 */

module.exports = async (client, interaction) => {
  try {
    await delGuildUserLevel(interaction.guild.id, interaction.user.id);
  } catch (error) {
    logger.log("error", `There was an error running this command: \n${error}`);
    console.log(error);
  }
};
