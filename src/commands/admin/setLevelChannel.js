const { Client, Interaction, ApplicationCommandOptionType, ChannelType, PermissionFlagsBits } = require("discord.js");
const path = require("path");
const upsertGuildLevelChannel = require("../../queries/upsertGuildLevelChannel");

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

    await interaction.deferReply({});

    try {
      const channel = interaction.options.get("channel");
      if (channel?.value || false) {
        upsertGuildLevelChannel(interaction.guild.id, channel.value);
        await interaction.editReply({
          content: `Levelup channel set to <#${channel.value}>`,
        });
      } else {
        await interaction.editReply({
          content: `Error`,
        });
      }
    } catch (error) {
      await interaction.editReply({
        content: `Bot Error, Try again later`,
      });
      logger.log("error", `There was an error setting level channel:\n${error}`);
      console.log(error);
    }
  }, // What the bot replies with

  name: "level-channel", // Name of the command
  description: "Set channel to send the levelup messages to", // Description of the command
  // devOnly: true, // Is a dev only command
  // testOnly: true, // Is a test command
  usage: "/level-channel [channel]", // How to use this command. [required], (optional)
  example: "/level-channel 1016853745809756242", // Example of how to run this command
  options: [
    {
      name: "channel",
      description: "Channel which the levelup messages are sent",
      type: ApplicationCommandOptionType.Channel,
      channelTypes: [ChannelType.GuildText],
      required: true,
    },
  ], // Input options
  // deleted: true, // If the command is no longer in use
  permissionsRequired: [PermissionFlagsBits.Administrator], // What permissions are needed to run the command
  botPermissions: [PermissionFlagsBits.SendMessages], // What permissions the bot needs to run the command
};
