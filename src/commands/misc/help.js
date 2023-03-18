const { Client, Interaction, ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const path = require("path");

// Logging tool
const winston = require("winston");
const logger = winston.createLogger({
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: `logs/log.log` })],
  format: winston.format.printf((log) => `[${log.level.toUpperCase()}] - ${path.basename(__filename)} - ${log.message} ${new Date(Date.now()).toUTCString()}`),
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
      const localCommands = getLocalCommands();

      let helpEmbed;

      if (interaction.options.get("command")?.value || false) {
        const commandName = interaction.options.get("command").value;
        const localCommand = await localCommands.find((x) => x.name === commandName);

        helpEmbed = new EmbedBuilder()
          .setTitle(`Command: /${commandName}`)
          .setDescription(`**Description:** ${localCommand.description}\n**Usage:**\n${localCommand.usage}\n**Example:**\n${localCommand.example}`)
          .setColor("Blurple");
      } else {
        helpEmbed = new EmbedBuilder().setTitle("Under Development").setColor("Blurple");
      }

      interaction.editReply({
        embeds: [helpEmbed],
        ephemeral: true,
      });
    } catch (error) {
      interaction.editReply({
        content: "Unknown command",
        ephemeral: true,
      });
    }
  },

  name: "help",
  description: "Get help regarding the bot",
  // devOnly: true, // Is a dev only command
  // testOnly: true, // Is a test command
  usage: "/help (command)",
  example: `/help calc`,
  options: [
    {
      name: "command",
      description: "Command to get help for",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  // deleted: true, // If the command is no longer in use
  // permissionsRequired: [], // What permissions are needed to run the command
  botPermissions: [PermissionFlagsBits.EmbedLinks], // What permissions the bot needs to run the command
};
