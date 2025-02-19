const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");
const path = require("path");

// Logging tool
const winston = require("winston");
const logger = winston.createLogger({
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: `logs/log.log` })],
  format: winston.format.printf(
    (log) =>
      `[${log.level.toUpperCase()}] - ${path.basename(__filename)} - ${log.message} ${new Date(Date.now()).toUTCString()}`
  ),
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

    await interaction.deferReply({
      flags: MessageFlags.Ephemeral,
    });
    try {
      const getLocalCommands = require("../../utils/getLocalCommands");
      const localCommands = getLocalCommands();

      let helpEmbed;

      const commandName = interaction.options.get("command")?.value || false;
      if (commandName) {
        const localCommand = await localCommands.find((x) => x.name === commandName);

        if (!localCommand) {
          interaction.editReply({
            content: "Invalid command",
          });
          return;
        }

        helpEmbed = new EmbedBuilder()
          .setTitle(`Command: /${commandName}`)
          .setDescription(
            `**Description:** ${localCommand.description}\n**Usage:**\n${localCommand.usage}\n**Example:**\n${localCommand.example}`
          )
          .setColor("#7289DA");
      } else {
        helpEmbed = new EmbedBuilder().setTitle("Under Development").setColor("#7289DA").setDescription("\u200b");
      }

      interaction.editReply({
        embeds: [helpEmbed],
      });
    } catch (error) {
      interaction.editReply({
        content: "Unknown command",
      });
      logger.log("error", `There was an error getting help with a command:\n${error}`);
      console.log(error);
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
  botPermissions: [PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.SendMessages], // What permissions the bot needs to run the command
};
