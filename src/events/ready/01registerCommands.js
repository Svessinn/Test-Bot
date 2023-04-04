const getLocalCommands = require("../../utils/getLocalCommands");
const areCommandsDifferent = require("../../utils/areCommandsDifferent");
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
 * @param {Client} client
 */

let localCommand;
module.exports = async (client) => {
  try {
    const localCommands = getLocalCommands();
    const applicationCommands = client.application.commands;
    await applicationCommands.fetch();

    for (localCommand of localCommands) {
      const { name, description, options } = localCommand;

      const existingCommand = await applicationCommands.cache.find((cmd) => cmd.name === name);

      if (existingCommand) {
        if (localCommand.deleted) {
          await applicationCommands.delete(existingCommand.id);
          logger.log("info", `Deleted command "${name}"`);
          continue;
        }

        if (areCommandsDifferent(existingCommand, localCommand)) {
          await applicationCommands.edit(existingCommand.id, {
            description,
            options,
          });

          logger.log("info", `Edited command: "${name}"`);
        }
      } else {
        if (localCommand.deleted) {
          logger.log("info", `Skipping command registration for "${name}" as it is set to deleted`);
          continue;
        }

        await applicationCommands.create({
          name,
          description,
          options,
        });

        logger.log("info", `Registered command "${name}"`);
      }
    }
  } catch (error) {
    logger.log("error", `There was an error in registering ${localCommand.name}\n${error}\n`);
    console.log(error);
  }
};
