const { Client, Interaction, ApplicationCommandOptionType, ChannelType, PermissionFlagsBits } = require("discord.js");
const path = require("path");

// Logging tool
const winston = require("winston");
const logger = winston.createLogger({
  // Define the logging tool's transports
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: `logs/log.log` })],
  // Define the logging format
  format: winston.format.printf((log) => `[${log.level.toUpperCase()}] - ${path.basename(__filename)} - ${log.message} ${new Date(Date.now()).toUTCString()}`),
});

module.exports = {
  /**
   *
   * @param {Client} client - The Discord.js client
   * @param {Interaction} interaction - The interaction data
   */

  callback: async (client, interaction) => {
    // Check if the interaction is in a guild
    if (!interaction.inGuild()) {
      interaction.reply("This command can only be ran in a guild");
      return;
    }
    // Check if the member using the command is not a bot
    if (interaction.member.user.bot) {
      interaction.reply("Bots can't user this command");
      return;
    }

    await interaction.deferReply();

    // Fetch the channel that needs to be locked
    const lockChannel = await interaction.guild.channels.fetch(interaction.options.get("target-channel").value);

    try {
      // Edit the channel's permission overwrites to disallow sending messages
      lockChannel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: false }).then(
        await interaction.editReply({
          content: `${lockChannel} has been locked`,
        })
      );
    } catch (error) {
      // If an error occurs, log it and reply with an error message
      await interaction.editReply({
        content: `Bot Error, Try again later`,
      });
      logger.log("error", `There was an error locking a channel:\n${error}`);
      console.log(error);
    }
  }, // What the bot replies with

  name: "lock", // Name of the command
  description: "Locks a channel", // Description of the command
  // devOnly: true, // Is a dev only command
  // testOnly: true, // Is a test command
  usage: "/lock [channel | channelID]", // How to use this command
  example: "/lock 1016853745809756242", // Example of how to run this command
  options: [
    // Input options
    {
      name: "target-channel",
      description: "The channel that you want to lock",
      required: true,
      type: ApplicationCommandOptionType.Channel,
      channelTypes: [ChannelType.GuildText],
    },
  ],
  // deleted: true, // If the command is no longer in use
  permissionsRequired: [PermissionFlagsBits.ManageChannels], // What permissions are needed to run the command
  botPermissions: [PermissionFlagsBits.ManageChannels], // What permissions the bot needs to run the command
};
