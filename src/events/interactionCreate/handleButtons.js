const { devs, testServer } = require("../../../config.json");
const getLocalCommands = require("../../utils/getLocalCommands");
const path = require("path");
const { Client, Interaction } = require("discord.js");

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
 * @param {Interaction} interaction
 * @returns
 */

module.exports = async (client, interaction) => {
  if (!interaction.isButton()) return;
  // console.log(interaction);
  await interaction.reply({
    ephemeral: true,
    content: "You pressed a button",
  });
  return;
};
