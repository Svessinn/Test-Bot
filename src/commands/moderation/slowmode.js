const {
  Client,
  Interaction,
  EmbedBuilder,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} = require("discord.js");
const path = require("path");
const ms = require("ms");

// Logging tool
const winston = require("winston");
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
    const targetChannelId = interaction.options.get("target-channel").value;
    const duration = interaction.options.get("time")?.value || "5s";

    await interaction.deferReply({
      ephemeral: true,
    });

    let targetChannel;
    try {
      targetChannel = await interaction.guild.channels.fetch(targetChannelId);
    } catch (error) {
      await interaction.editReply(`That is not a valid channel`);
      return;
    }

    let sDuration = ms(duration) / 1000;

    // Timeout the user
    try {
      if (
        targetChannel.rateLimitPerUser &&
        !(interaction.options.get("time")?.value || false)
      ) {
        sDuration = 0;
      }
      await targetChannel.setRateLimitPerUser(sDuration);

      await interaction.editReply({
        content: `<#${targetChannelId}>'s slowmode has been set to ${sDuration} seconds`,
      });
    } catch (error) {
      await interaction.editReply({
        content: `Bot Error, Try again later`,
      });
      logger.log("error", `There was an error setting up slowmode:\n${error}`);
      console.log(error);
    }
  }, // What the bot replies with

  name: "slowmode", // Name of the command
  description: "Set a channel into slowmode", // Description of the command
  // devOnly: true, // Is a dev only command
  // testOnly: true, // Is a test command
  usage: "/slowmode [channel | channelID] (time {default: 5s})",
  example: "/slowmode 1016853745809756242 30s",
  options: [
    {
      name: "target-channel",
      description: "The channel that you want to put into slowmode",
      required: true,
      type: ApplicationCommandOptionType.Channel,
    },
    {
      name: "time",
      description: "Time to set slowmode (30s, 30m, 1h, 1d)",
      required: false,
      type: ApplicationCommandOptionType.String,
    },
  ], // Input options
  // deleted: true, // If the command is no longer in use
  permissionsRequired: [PermissionFlagsBits.ManageChannels], // What permissions are needed to run the command
  botPermissions: [
    PermissionFlagsBits.ManageChannels,
    PermissionFlagsBits.EmbedLinks,
  ], // What permissions the bot needs to run the command
};
