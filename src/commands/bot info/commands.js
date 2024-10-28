const { Client, Interaction, ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const path = require("path");
const getAllFiles = require("../../utils/getAllFiles");
const getLocalCommands = require("../../utils/getLocalCommands");

String.prototype.capitalize = function () {
  return this.replace(/(^|\s)([a-z])/g, function (m, p1, p2) {
    return p1 + p2.toUpperCase();
  });
};

// Logging tool
const winston = require("winston");
const logger = winston.createLogger({
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: `logs/log.log` })],
  format: winston.format.printf(
    (log) => `[${log.level.toUpperCase()}] - ${path.basename(__filename)} - ${log.message} ${new Date(Date.now()).toUTCString()}`
  ),
});

let subCats = [];
allFiles = getAllFiles(path.join(__dirname, ".."), true);
allFiles.forEach((file) => {
  f = file.replace(/\\/g, "/").split("/").pop();
  subCats.push({
    name: f.capitalize(),
    value: f,
  });
});

module.exports = {
  /**
   * @param {Client} client
   * @param {Interaction} interaction
   */

  callback: async (client, interaction) => {
    if (!interaction.inGuild()) {
      interaction.reply("This command is only for use in a guild");
      return;
    }
    if (interaction.member.user.bot) {
      interaction.reply("Bots can't use this command");
      return;
    }

    await interaction.deferReply();

    try {
      const category = interaction.options.get("category").value;
      const localCommands = getLocalCommands(category);

      if (!localCommands.length) {
        interaction.editReply({
          content: "Invalid command subcategory",
        });
        return;
      }

      let commandsEmbed = new EmbedBuilder().setTimestamp().setColor("Blurple");

      if (category) {
        try {
          commandsEmbed.setTitle(`${interaction.options.get("category").value.capitalize()} commands`);
        } catch (error) {
          interaction.editReply({
            content: "Invalid command category",
          });
          return;
        }
      }

      let out = "";

      localCommands.forEach((command) => {
        out += `**${command.name}** - ${command.description}\n`;
      });

      commandsEmbed.setDescription(out);

      await interaction.editReply({
        embeds: [commandsEmbed],
      });
    } catch (error) {
      await interaction.editReply({
        content: "Bot Error, Try again later",
      });
      logger.log("error", `There was an error getting/sending commands list:\n${error}`);
      console.log(error);
    }
  },

  name: "commands",
  description: "Get a list of commands",
  // devOnly: true, // Is a dev only command
  // testOnly: true, // Is a test command
  usage: "/commands [category]",
  example: `/commands Economy`,
  options: [
    {
      name: "category",
      description: "Get commands for a specific category",
      type: ApplicationCommandOptionType.String,
      choices: subCats,
      required: true,
    },
  ],

  // deleted: true, // If the command is no longer in use
  // permissionsRequired: [], // What permissions are needed to run the command
  botPermissions: [PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.SendMessages], // What permissions the bot needs to run the command
};
