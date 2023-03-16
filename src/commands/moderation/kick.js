const {
  Client,
  Interaction,
  EmbedBuilder,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} = require("discord.js");
const path = require("path");

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
    const targetUserId = interaction.options.get("target-user").value;
    const reason =
      interaction.options.get("reason")?.value || "No reason provided";

    await interaction.deferReply();

    // Getting the targeted user
    let targetUser;
    try {
      targetUser = await interaction.guild.members.fetch(targetUserId);
    } catch (error) {
      await interaction.editReply(`That user is not a part of this server`);
      return;
    }

    if (!targetUser) {
      await interaction.editReply(`That user is not a part of this server`);
      return;
    }

    if (targetUser.id === interaction.guild.ownerId) {
      await interaction.editReply(`You can't kick the server owner`);
      return;
    }

    const targetuserRolePosition = targetUser.roles.highest.position; // Highest role of the targeted user
    const requestUserRolePosition = interaction.member.roles.highest.position; // Highest role of the user running the command
    const botRolePosition = interaction.guild.members.me.roles.highest.position; // Highest role of the bot

    if (targetuserRolePosition >= requestUserRolePosition) {
      await interaction.editReply(
        `You can't kick that user bacause they have the same or higher role than you`
      );
      return;
    }

    if (targetuserRolePosition >= botRolePosition) {
      await interaction.editReply(
        `I can't kick that user because they have the same or higher role that me`
      );
      return;
    }

    // Kick the targetUser
    try {
      await targetUser.kick({ reason });

      let kickEmbed = new EmbedBuilder()
        .setAuthor({
          name: `Member Kicked | ${targetUser.user.tag}`,
          //iconURL: targetUser.avatarURL
        })
        .addFields(
          {
            name: `User`,
            value: `<@${targetUserId}>`,
            inline: true,
          },
          {
            name: `Moderator`,
            value: `<@${interaction.member.user.id}>`,
            inline: true,
          },
          {
            name: `Reason`,
            value: `${reason}`,
            inline: true,
          }
        )
        .setFooter({
          text: `ID: ${targetUser.user.id}`,
        })
        .setTimestamp()
        .setColor("Blurple");

      await interaction.editReply({
        // content: `User ${targetUser} was kicked\nReason: ${reason}`,
        embeds: [kickEmbed],
      });
    } catch (error) {
      await interaction.editReply({
        content: `Bot Error, Try again later`,
      });
      logger.log("error", `There was an error when kicking:\n${error}`);
      console.log(error);
    }
  }, // What the bot replies with

  name: "kick", // Name of the command
  description: "Kicks a member from the server", // Description of the command
  // devOnly: true, // Is a dev only command
  // testOnly: true, // Is a test command
  usage: "/kick [user | userID] (reason)",
  example: "/kick 130462164640202754",
  options: [
    {
      name: "target-user",
      description: "The user that you want to kick from the server",
      required: true,
      type: ApplicationCommandOptionType.Mentionable,
    },
    {
      name: "reason",
      description: "The reason for the kick",
      type: ApplicationCommandOptionType.String,
    },
  ], // Input options
  // deleted: true, // If the command is no longer in use
  permissionsRequired: [PermissionFlagsBits.KickMembers], // What permissions are needed to run the command
  botPermissions: [
    PermissionFlagsBits.KickMembers,
    PermissionFlagsBits.EmbedLinks,
  ], // What permissions the bot needs to run the command
};
