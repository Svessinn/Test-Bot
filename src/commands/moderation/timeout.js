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
    const targetUserId = interaction.options.get("target-user").value;
    const duration = interaction.options.get("duration").value;
    const reason =
      interaction.options.get("reason")?.value || "No reason provided";

    await interaction.deferReply();

    let targetUser;
    try {
      targetUser = await interaction.guild.members.fetch(targetUserId);
    } catch (error) {
      await interaction.editReply(`That user is not a part of this server`);
      return;
    }

    if (targetUser.user.bot) {
      await interaction.editReply(`I can't timeout a bot`);
      return;
    }

    const msDuration =
      ms(duration) < 2419198000
        ? ms(duration) > 5000
          ? ms(duration)
          : 5000
        : 2419198000;

    if (isNaN(msDuration)) {
      await interaction.editReply("Prease provide a valie timeout duration");
      return;
    }

    const targetuserRolePosition = targetUser.roles.highest.position; // Highest role of the targeted user
    const requestUserRolePosition = interaction.member.roles.highest.position; // Highest role of the user running the command
    const botRolePosition = interaction.guild.members.me.roles.highest.position; // Highest role of the bot

    if (targetuserRolePosition >= requestUserRolePosition) {
      await interaction.editReply({
        content: `You can't timeout that user bacause they have the same or higher role than you`,
      });
      return;
    }

    if (targetuserRolePosition >= botRolePosition) {
      await interaction.editReply({
        content: `I can't timeout that user because they have the same or higher role that me`,
      });
      return;
    }

    // Timeout the user
    try {
      const { default: prettyMs } = await import("pretty-ms");

      let kickEmbed = new EmbedBuilder()
        .setAuthor({
          name: `Member Timed Out | ${targetUser.user.tag}`,
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
            name: "Duration",
            value: prettyMs(msDuration, { verbose: true }),
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

      if (targetUser.isCommunicationDisabled()) {
        await targetUser.timeout(msDuration, reason);

        await interaction.editReply({
          content: `User ${targetUser}'s timeout was updated`,
          embeds: [kickEmbed],
        });
        return;
      }

      await targetUser.timeout(msDuration, reason);

      await interaction.editReply({
        // content: `User ${targetUser} was timeed out`,
        embeds: [kickEmbed],
      });
    } catch (error) {
      await interaction.editReply({
        content: `Bot Error, Try again later`,
      });
      logger.log("error", `There was an error when timing out:\n${error}`);
      console.log(error);
    }
  }, // What the bot replies with

  name: "timeout", // Name of the command
  description: "Timeout a member in the server", // Description of the command
  // devOnly: true, // Is a dev only command
  // testOnly: true, // Is a test command
  usage: "/timeout [user | userID] [duration] (reason)",
  example: "/timeout 130462164640202754 6h",
  options: [
    {
      name: "target-user",
      description: "The user that you want to timeout",
      required: true,
      type: ApplicationCommandOptionType.Mentionable,
    },
    {
      name: "duration",
      description: "The duration of the timeout (30s, 30m, 1h, 1d)",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
    {
      name: "reason",
      description: "The reason for the timeout",
      type: ApplicationCommandOptionType.String,
    },
  ], // Input options
  // deleted: true, // If the command is no longer in use
  permissionsRequired: [PermissionFlagsBits.MuteMembers], // What permissions are needed to run the command
  botPermissions: [
    PermissionFlagsBits.MuteMembers,
    PermissionFlagsBits.EmbedLinks,
  ], // What permissions the bot needs to run the command
};
