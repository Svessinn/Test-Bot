const path = require("path");
const { Client, ButtonInteraction } = require("discord.js");

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
 * @param {ButtonInteraction} interaction
 */

module.exports = async (client, interaction) => {
  if (!interaction.isModalSubmit()) return;
  // I decided to not use the modal submit interaction for now, but you can use this as a reference for future implementations.
  return;
};
