const { devs, testServer } = require("../../../config.json");
const getLocalCommands = require("../../utils/getLocalCommands");
const path = require("path");
const { Client, Interaction } = require("discord.js");
const perToName = require("../../utils/permissionToName");

// Logging tool
const winston = require("winston");
const logger = winston.createLogger({
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: `logs/log.log` })],
  format: winston.format.printf(
    (log) => `[${log.level.toUpperCase()}] - ${path.basename(__filename)} - ${log.message} ${new Date(Date.now()).toUTCString()}`
  ),
});

const commandLogger = winston.createLogger({
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: `logs/command.log` })],
  format: winston.format.printf((log) => `[${log.level.toUpperCase()}] - ${log.message} ${new Date(Date.now()).toUTCString()}`),
});

/**
 * @param {Client} client
 * @param {Interaction} interaction
 * @returns {Promise<void>}
 */

// The interactionCreate files are numbered according to their type value
// 1: Ping (Ping interaction)
// 2: ApplicationCommand (Command, ContextMenu, etc.)
// 3: MessageComponent (Button, SelectMenu, etc.)
// 4: Autocomplete (Autocomplete interaction)
// 5: ModalSubmit (Modal submit interaction)
// This file is for interactions that are not handled by any other file, therefore it is numbered 99.
// This file will log the interaction type to a file and the interaction itself to the console & log file.
// This is useful for debugging and for future implementations of new interaction types.
module.exports = async (client, interaction) => {
  if ([2, 3, 5].includes(interaction.type)) return;
  logger.log("info", `Interaction of type ${interaction.type} was not handled.`);
  console.log(interaction);
  return;
};
