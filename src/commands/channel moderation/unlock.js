const { Client, Interaction, ApplicationCommandOptionType, ChannelType, PermissionFlagsBits } = require("discord.js");
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

    await interaction.deferReply();

    const unlockChannel = await interaction.guild.channels.fetch(interaction.options.get("target-channel").value);

    try {
      unlockChannel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: null }).then(
        await interaction.editReply({
          content: `${unlockChannel} has been unlocked`,
        })
      );
    } catch (error) {
      await interaction.editReply({
        content: `Bot Error, Try again later`,
      });
      logger.log("error", `There was an error unlocking a channel:\n${error}`);
      console.log(error);
    }
  }, // What the bot replies with

  name: "unlock", // Name of the command
  description: "Unlocks a channel", // Description of the command
  // devOnly: true, // Is a dev only command
  // testOnly: true, // Is a test command
  usage: "/unlock [channel | channelID]",
  example: "/unlock 1016853745809756242",
  options: [
    {
      name: "target-channel",
      description: "The channel that you want to unlock",
      required: true,
      type: ApplicationCommandOptionType.Channel,
      channelTypes: [ChannelType.GuildText],
    },
  ], // Input options
  // deleted: true, // If the command is no longer in use
  permissionsRequired: [PermissionFlagsBits.ManageChannels], // What permissions are needed to run the command
  botPermissions: [PermissionFlagsBits.ManageChannels], // What permissions the bot needs to run the command
};
