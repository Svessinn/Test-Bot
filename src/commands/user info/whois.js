const { Client, Interaction, ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
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

    const targetUserId = interaction.options.get("user")?.value || interaction.user.id;

    let targetUser;
    try {
      targetUser = await interaction.guild.members.fetch(targetUserId);
    } catch (err) {
      logger.log("error", err);
      interaction.editReply({
        embeds: [new EmbedBuilder().setDescription(`I couldn't find the user ${targetUserId}`)],
      });
      return;
    }

    try {
      const joinTime = Date.parse(interaction.member.joinedAt).toString().slice(0, -3);
      const registerTime = Date.parse(interaction.user.createdAt).toString().slice(0, -3);

      let roles = [];

      if (targetUser._roles.length) {
        for (let i = 0; i < targetUser._roles.length; i++) {
          let a = await targetUser.roles.cache.find((r) => r.id === targetUser._roles[i]);

          roles.push({
            role: `<@&${targetUser._roles[i]}>`,
            position: a.rawPosition,
          });
        }
      }

      roles.sort(function (a, b) {
        return b.position - a.position;
      });

      let rolesOut = "";

      for (let role of roles) {
        rolesOut += `${role.role} `;
      }

      rolesOut = rolesOut.length ? rolesOut : "None";

      const whoisEmbed = new EmbedBuilder()
        .setAuthor({
          name: targetUser.user.tag,
          iconURL: targetUser.user.avatarURL(),
        })
        .setThumbnail(targetUser.user.avatarURL())
        .setColor("#7289DA")
        .addFields(
          {
            name: `Joined`,
            value: `<t:${joinTime}:F>`,
            inline: true,
          },
          {
            name: `Registered`,
            value: `<t:${registerTime}:F>`,
            inline: true,
          },
          {
            name: `Roles [${targetUser._roles.length}]`,
            value: rolesOut,
          }
        )
        .setTimestamp()
        .setFooter({
          text: `ID: ${targetUserId}`,
        });
      await interaction.editReply({
        embeds: [whoisEmbed],
      });
    } catch (error) {
      await interaction.editReply({
        content: `Bot Error, Try again later`,
      });
      logger.log("error", `There was an error when getting user info:\n${error}`);
      console.log(error);
    }
  }, // What the bot replies with

  name: "whois", // Name of the command
  description: "Get info on a user", // Description of the command
  // devOnly: true, // Is a dev only command
  // testOnly: true, // Is a test command
  usage: "/whois (user | userID)",
  example: "/whois 130462164640202754",
  options: [
    {
      name: "user",
      description: "The user you want info on",
      type: ApplicationCommandOptionType.User,
      required: false,
    },
  ], // Input options
  // deleted: true, // If the command is no longer in use
  // permissionsRequired: [], // What permissions are needed to run the command
  botPermissions: [PermissionFlagsBits.EmbedLinks], // What permissions the bot needs to run the command
};
