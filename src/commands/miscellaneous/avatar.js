const { Client, Interaction, ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
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
    await interaction.deferReply({
      ephemeral: false,
    });

    let targetUser;
    try {
      targetUser = await interaction.guild.members.fetch(interaction.options.get("target-user"));
    } catch (err) {
      logger.log("error", err);
    }

    const avatarEmbed = new EmbedBuilder()
      .setTitle(targetUser.user.tag)
      .setImage(targetUser.user.avatarURL({ size: 1024, dynamic: true }))
      .setTimestamp()
      .setFooter({
        text: `ID: ${targetUser.user.id}`,
      });

    try {
      await interaction.editReply({
        embeds: [avatarEmbed],
      });
    } catch (error) {
      await interaction.editReply({
        content: `Bot Error, Try again later`,
      });
      logger.log("error", `There was an error locking a channel:\n${error}`);
      console.log(error);
    }
  }, // What the bot replies with

  name: "avatar", // Name of the command
  description: "Get the avatar of another user", // Description of the command
  // devOnly: true, // Is a dev only command
  testOnly: true, // Is a test command
  usage: "/avatar [user | userID]", // How to use this command. [required], (optional)
  example: "/avatar 130462164640202754", // Example of how to run this command
  options: [
    {
      name: "target-user",
      description: "Who's avatar do you want?",
      required: true,
      type: ApplicationCommandOptionType.User,
    },
  ], // Input options
  // deleted: true, // If the command is no longer in use
  // permissionsRequired: [], // What permissions are needed to run the command
  // botPermissions: [], // What permissions the bot needs to run the command
};
