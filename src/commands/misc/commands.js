const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const path = require("path");

String.prototype.capitalize = function () {
  return this.replace(/(^|\s)([a-z])/g, function (m, p1, p2) {
    return p1 + p2.toUpperCase();
  });
};

// Logging tool
const winston = require("winston");
const getAllFiles = require("../../utils/getAllFiles");
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: `logs/log.log` }),
  ],
  format: winston.format.printf(
    (log) =>
      `[${log.level.toUpperCase()}] - ${path.basename(__filename)} - ${
        log.message
      } ${new Date(Date.now()).toUTCString()}`
  ),
});

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */

  callback: async (client, interaction) => {
    await interaction.deferReply();
    try {
      const getLocalCommands = require("../../utils/getLocalCommands");
      const subCategory =
        interaction.options.get("category")?.value || undefined;
      const localCommands = getLocalCommands(subCategory);
      if (!localCommands.length) {
        interaction.editReply({
          content: "Invalid command subcategory",
        });
        return;
      }

      let commandsEmbed = new EmbedBuilder()
        .setTitle(`${client.user.username} Commands`)
        .setColor("Blurple");
      if (interaction.options.get("category")?.value || false) {
        try {
          commandsEmbed.setDescription(
            `${interaction.options.get("category").value.capitalize()} commands`
          );
        } catch (error) {
          interaction.editReply({
            content: "Invalid command category",
          });
          return;
        }
      }
      localCommands.forEach((command) => {
        commandsEmbed.addFields({
          name: command.name,
          value: command.description,
          inline: true,
        });
      });

      interaction.editReply({
        embeds: [commandsEmbed],
      });
    } catch (error) {
      interaction.editReply({
        content: "Bot Error, Try again later",
      });
    }
  },

  name: "commands",
  description: "Get a list of commands",
  // devOnly: true, // Is a dev only command
  // testOnly: true, // Is a test command
  usage: "/commands",
  example: `/commands`,
  options: [
    {
      name: "category",
      description: "Get commands for a specific category",
      type: ApplicationCommandOptionType.String,
      choices: [
        {
          name: "Admin",
          value: "admin",
        },
        {
          name: "Miscellanious",
          value: "misc",
        },
        {
          name: "Moderation",
          value: "moderation",
        },
      ],
    },
  ],

  // deleted: true, // If the command is no longer in use
  // permissionsRequired: [], // What permissions are needed to run the command
  botPermissions: [PermissionFlagsBits.EmbedLinks], // What permissions the bot needs to run the command
};
