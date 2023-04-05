const { Client, Interaction, ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const path = require("path");
const addGuildWarning = require("../../queries/addGuildWarning");
const delGuildWarning = require("../../queries/deleteGuildWarning");
const getWarnPunishments = require("../../queries/getGuildWarningPunishments");
const getGuildUserPunishments = require("../../queries/getGuildUserPunishments");
const getGuildWarnWithId = require("../../queries/getGuildWarningWithId");
const getGuildWarnWithUser = require("../../queries/getGuildWarningWithUser");

// Logging tool
const winston = require("winston");
const logger = winston.createLogger({
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: `logs/log.log` })],
  format: winston.format.printf(
    (log) => `[${log.level.toUpperCase()}] - ${path.basename(__filename)} - ${log.message} ${new Date(Date.now()).toUTCString()}`
  ),
});

module.exports = {
  /**
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

    let subcommand = interaction.options._subcommand;

    if (subcommand === "add") {
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

      try {
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
        logger.log("error", `There was an error adding a warning:\n${error}`);
        console.log(error);
      }
    } else if (subcommand === "delete") {
      let ID = interaction.options.get("id").value;
      let outEmbed = new EmbedBuilder().setColor("Blurple");
      const deletedWarn = await getGuildWarnWithId(interaction.guild.id, ID);
      if (deletedWarn) {
        const member = await interaction.guild.members.fetch(deletedWarn.userId);

        await delGuildWarning(interaction.guild.id, ID);

        outEmbed.setTitle(`Deleted warning`).setDescription(`${member} was warned for: __${deletedWarn.reason}__`);
      } else {
        outEmbed.setTitle(`No warning with that ID`);
      }

      try {
        await interaction.editReply({
          embeds: [outEmbed],
        });
        return;
      } catch (error) {
        await interaction.editReply({
          content: `Bot Error, Try again later`,
        });
        logger.log("error", `There was an error deleting a warning:\n${error}`);
        console.log(error);
        return;
      }
    } else if (subcommand === "get") {
      let outEmbed = new EmbedBuilder().setColor("Blurple");
      let out = "";
      const userID = interaction.options.get("user").value;
      const member = await interaction.guild.members.fetch(userID);
      const userWarns = await getGuildWarnWithUser(interaction.guild.id, userID);
      console.log(userWarns);
      if (userWarns.length) {
        userWarns.forEach((w) => {
          out += `__**ID**:__ ${w.id} - __**Reason**:__ ${w.reason}\n`;
        });
        outEmbed.setTitle(`${member.user.tag} has ${userWarns.length} warnings`).setDescription(out);
      } else {
        outEmbed.setTitle("That user doesn't have any warnings");
      }
      try {
        await interaction.editReply({
          embeds: [outEmbed],
        });
        return;
      } catch (error) {
        await interaction.editReply({
          content: `Bot Error, Try again later`,
        });
        logger.log("error", `There was an error deleting a warning:\n${error}`);
        console.log(error);
        return;
      }
    }
  }, // What the bot replies with

  name: "warn", // Name of the command
  description: "Deal with user warnings", // Description of the command
  // devOnly: true, // Is a dev only command
  // testOnly: true, // Is a test command
  usage: "/warn add [user | userID] [reason]\n/warn delete [ID]\n/warn get [user | userID]", // How to use this command. [required], (optional)
  example: "/warn add 130462164640202754 Rule 6\n/warn delete 3\n/warn get 130462164640202754", // Example of how to run this command
  options: [
    {
      name: "add",
      description: "Warn a member",
      type: ApplicationCommandOptionType.Subcommand,
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
      ],
    },
    {
      name: "delete",
      description: "Delete a warning",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "id",
          description: "The ID of the warning you want to delete",
          type: ApplicationCommandOptionType.Integer,
          required: true,
        },
      ],
    },
    {
      name: "get",
      description: "Get warnings for a user",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "user",
          description: "User whos warnings you want to get",
          type: ApplicationCommandOptionType.User,
          required: true,
        },
      ],
    },
  ], // Input options
  // deleted: true, // If the command is no longer in use
  permissionsRequired: [PermissionFlagsBits.ModerateMembers], // What permissions are needed to run the command
  botPermissions: [
    PermissionFlagsBits.ModerateMembers,
    PermissionFlagsBits.BanMembers,
    PermissionFlagsBits.KickMembers,
    PermissionFlagsBits.EmbedLinks,
  ], // What permissions the bot needs to run the command
};
