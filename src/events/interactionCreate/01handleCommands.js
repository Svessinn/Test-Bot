const { devs, testServer } = require("../../../config.json");
const getLocalCommands = require("../../utils/getLocalCommands");
const path = require("path");
const { Client, Interaction, MessageFlags, PermissionsBitField } = require("discord.js");
const perToName = require("../../utils/permissionToName");

// Logging tool
const winston = require("winston");
const logger = winston.createLogger({
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: `logs/log.log` })],
  format: winston.format.printf(
    (log) =>
      `[${log.level.toUpperCase()}] - ${path.basename(__filename)} - ${log.message} ${new Date(Date.now()).toUTCString()}`
  ),
});

const commandLogger = winston.createLogger({
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: `logs/command.log` })],
  format: winston.format.printf(
    (log) => `[${log.level.toUpperCase()}] - ${log.message} ${new Date(Date.now()).toUTCString()}`
  ),
});

/**
 * @param {Client} client
 * @param {Interaction} interaction
 */

module.exports = async (client, interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const localCommands = getLocalCommands();
  commandLogger.log(
    "info",
    `Command: ${interaction.commandName} was ran by ${interaction.user.username} in ${interaction.guild.name}`
  );

  try {
    const commandObject = localCommands.find((cmd) => cmd.name === interaction.commandName);
    if (!commandObject) return;

    if (!interaction.inGuild()) {
      interaction.reply("This command is only for use in a guild");
      return;
    }

    if (commandObject.devOnly) {
      if (!devs.includes(interaction.member.id)) {
        interaction.reply({
          content: "Only developers are allowed to run this command",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
    }

    if (commandObject.testOnly) {
      if (!(interaction.guild.id === testServer)) {
        interaction.reply({
          content: "This command can not be ran here",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
    }

    if (commandObject.permissionsRequired?.length && !devs.includes(interaction.user.id)) {
      for (const permission of commandObject.permissionsRequired) {
        if (!interaction.member.permissions.has(permission)) {
          interaction.reply({
            content: `You do not have permission to run the ${commandObject.name} command`,
            flags: MessageFlags.Ephemeral,
          });
          return;
        }
      }
    }

    if (commandObject.botPermissions?.length) {
      for (const permission of commandObject.botPermissions) {
        botPerms = interaction.guild.members.me;
        if (!botPerms.permissions.has(permission)) {
          interaction.reply({
            content: `I don't have enough permissions\nMissing: ${perToName(permission)}`,
            flags: MessageFlags.Ephemeral,
          });
          return;
        }
      }
    }

    await commandObject.callback(client, interaction);
  } catch (error) {
    logger.log("error", `There was an error running this command: \n${error}`);
    console.log(error);
  }
};
