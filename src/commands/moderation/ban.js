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
    const delMessages = interaction.options.get("delete-messages")?.value || 0;

    await interaction.deferReply();

    if (!targetUserId) {
      await interaction.editReply(`That user is not a part of this server`);
      return;
    }

    if (targetUserId === interaction.guild.ownerId) {
      await interaction.editReply(`You can't ban the server owner`);
      return;
    }

    let targetUser;
    try {
      targetUser = await interaction.guild.members.fetch(targetUserId);
    } catch (err) {
      logger.log("error", err);
    }

    const targetuserRolePosition = targetUser?.roles?.highest?.position || 0; // Highest role of the targeted user
    const requestUserRolePosition = interaction.member.roles.highest.position; // Highest role of the user running the command
    const botRolePosition = interaction.guild.members.me.roles.highest.position; // Highest role of the bot

    if (targetuserRolePosition >= requestUserRolePosition) {
      await interaction.editReply(
        `You can't ban that user bacause they have the same or higher role than you`
      );
      return;
    }

    if (targetuserRolePosition >= botRolePosition) {
      await interaction.editReply(
        `I can't ban that user because they have the same or higher role that me`
      );
      return;
    }

    // Ban the target-user
    try {
      await interaction.guild.bans
        .create(targetUserId, {
          reason: reason,
          deleteMessageSeconds: delMessages,
        })
        .catch((err) => {
          logger.log("error", err);
        });

      let banEmbed = new EmbedBuilder()
        .setAuthor({
          name: `Member Banned | ${targetUser?.user?.tag || targetUserId}`,
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
          text: `ID: ${targetUserId}`,
        })
        .setTimestamp()
        .setColor("Blurple");

      await interaction.editReply({
        // content: `User <@${targetUserId}> was banned\nReason: ${reason}`,
        embeds: [banEmbed],
      });
    } catch (error) {
      await interaction.editReply({
        content: `Bot Error, Try again later`,
      });
      logger.log("error", `There was an error when banning:\n${error}`);
      console.log(error);
    }
  }, // What the bot replies with

  name: "ban", // Name of the command
  description: "Bans a member from the server", // Description of the command
  // devOnly: true, // Is a dev only command
  // testOnly: true, // Is a test command
  usage: "/ban [user | userID] (reason, message delete limit)",
  example: "/ban 130462164640202754 bannable offense 7 days",
  options: [
    {
      name: "target-user",
      description: "The user that you want to ban from the server",
      required: true,
      type: ApplicationCommandOptionType.Mentionable,
    },
    {
      name: "reason",
      description: "The reason for the ban",
      type: ApplicationCommandOptionType.String,
    },
    {
      name: "delete-messages",
      description:
        "how far back would you like the messages of this user to be deleted",
      type: ApplicationCommandOptionType.Number,
      choices: [
        {
          name: "Don't delete any messages",
          value: 0,
          nameLocalizations: {},
        },
        {
          name: "1 hour",
          value: 3600,
        },
        {
          name: "3 hours",
          value: 10800,
        },
        {
          name: "6 hours",
          value: 21600,
        },
        {
          name: "12 hours",
          value: 43200,
        },
        {
          name: "1 day",
          value: 86400,
        },
        {
          name: "2 days",
          value: 172800,
        },
        {
          name: "3 days",
          value: 259200,
        },
        {
          name: "4 days",
          value: 345600,
        },
        {
          name: "5 days",
          value: 432000,
        },
        {
          name: "6 days",
          value: 518400,
        },
        {
          name: "7 days",
          value: 604800,
        },
      ],
    },
  ], // Input options
  // deleted: true, // If the command is no longer in use
  permissionsRequired: [PermissionFlagsBits.BanMembers], // What permissions are needed to run the command
  botPermissions: [
    PermissionFlagsBits.BanMembers,
    PermissionFlagsBits.EmbedLinks,
  ], // What permissions the bot needs to run the command
};
