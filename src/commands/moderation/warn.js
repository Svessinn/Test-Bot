const { Client, Interaction, ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder, PermissionsBitField } = require("discord.js");
const path = require("path");
const addGuildWarning = require("../../queries/addGuildWarning");
const getWarnPunishments = require("../../queries/getGuildWarningPunishments");
const getGuildUserPunishments = require("../../queries/getGuildUserPunishments");

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
    if (!interaction.inGuild()) {
      interaction.reply("This command can only be ran in a guild");
      return;
    }
    if (interaction.member.user.bot) {
      interaction.reply("Bots can't user this command");
      return;
    }

    await interaction.deferReply({
      ephemeral: false,
    });
    let punishmentEmbed;
    let usr = interaction.options.get("user").value;
    let rsn = interaction.options.get("reason").value;
    let newWarn = await addGuildWarning(interaction.guild.id, usr, rsn);
    newWarn = newWarn[newWarn.length - 1];

    const userWarns = await getGuildUserPunishments(interaction.guild.id, usr);
    const usrWarnNbr = userWarns.length;

    let targetUser;
    try {
      targetUser = await interaction.guild.members.fetch(usr);
    } catch (error) {
      await interaction.editReply(`That user is not a part of this server`);
      return;
    }

    const warningPunishments = await getWarnPunishments(interaction.guild.id);

    let punishmentIdx = warningPunishments.findIndex((p) => p.warnings === usrWarnNbr);

    let outEmbed = new EmbedBuilder()
      .setTimestamp()
      .setColor("Blurple")
      .setFooter({
        text: `ID: ${usr}`,
      })
      .setAuthor({
        name: `Member Warned | ${targetUser?.user?.tag || usr}`,
      })
      .setTitle(`Warning ID: ${newWarn.id}`)
      .addFields(
        {
          name: `User`,
          value: `<@${usr}>`,
          inline: true,
        },
        {
          name: `Moderator`,
          value: `<@${interaction.user.id}>`,
          inline: true,
        },
        {
          name: `Reason`,
          value: `${rsn}`,
          inline: true,
        }
      );
    try {
      if (punishmentIdx !== -1) {
        const punisment = warningPunishments[punishmentIdx];

        if (punisment.punishment === "ban") {
          await interaction.guild.bans
            .create(usr, {
              reason: `Warning Punishment for hitting ${usrWarnNbr} warnings\nPermanent ban`,
              deleteMessageSeconds: 259200,
            })
            .catch((err) => {
              logger.log("error", err);
            });
        } else if (punisment.punishment === "softban") {
          await interaction.guild.bans
            .create(usr, {
              reason: `Warning Punishment for hitting ${usrWarnNbr} warnings\nSoftban`,
              deleteMessageSeconds: 259200,
            })
            .catch((err) => {
              logger.log("error", err);
            });

          await interaction.guild.members.unban(usr).catch((err) => {
            logger.log("error", err);
          });
        } else if (punisment.punishment === "kick") {
          await targetUser.kick({ reason: `Warning Punishment for hitting ${usrWarnNbr} warnings\Kick` });
        } else if (punisment.punishment === "timeout") {
          await targetUser.timeout(punisment.time, rsn);
        }
      }
      if (!punishmentEmbed) {
        await interaction.editReply({
          embeds: [outEmbed],
        });
        return;
      }
      await interaction.editReply({
        embeds: [outEmbed, punishmentEmbed],
      });
      return;
    } catch (error) {
      await interaction.editReply({
        content: `Bot Error, Try again later`,
      });
      logger.log("error", `There was an error :\n${error}`);
      console.log(error);
    }
  }, // What the bot replies with

  name: "warn", // Name of the command
  description: "Warn a member", // Description of the command
  // devOnly: true, // Is a dev only command
  // testOnly: true, // Is a test command
  usage: "/warn [user | userID] [reason]", // How to use this command. [required], (optional)
  example: "/warn 130462164640202754 Rule 6", // Example of how to run this command
  options: [
    {
      name: "user",
      description: "The user you want to warn",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "reason",
      description: "The reason for the warning",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ], // Input options
  // deleted: true, // If the command is no longer in use
  permissionsRequired: [PermissionFlagsBits.ModerateMembers], // What permissions are needed to run the command
  botPermissions: [PermissionFlagsBits.ModerateMembers, PermissionFlagsBits.BanMembers, PermissionFlagsBits.KickMembers, PermissionFlagsBits.EmbedLinks], // What permissions the bot needs to run the command
};
