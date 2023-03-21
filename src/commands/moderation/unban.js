const { Client, Interaction, EmbedBuilder, ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");
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
    if (!interaction.inGuild()) {
      interaction.reply("This command can only be ran in a guild");
      return;
    }
    if (interaction.member.user.bot) {
      interaction.reply("Bots can't user this command");
      return;
    }

    const targetUserId = interaction.options.get("user").value;

    await interaction.deferReply();

    // Getting the targeted user
    let targetUser;
    /*try {
      targetUser = await interaction.guild.members.fetch(targetUserId);
    } catch (error) {
      await interaction.editReply(`That user is not a part of this server`);
      return;
    };*/

    if (targetUserId === interaction.guild.ownerId) {
      await interaction.editReply(`You can't ban the server owner`);
      return;
    }

    // Unban the targetUser
    try {
      await interaction.guild.members.unban(targetUserId);

      let unbanEmbed = new EmbedBuilder()
        .setAuthor({
          name: `Member Unbanned`,
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
          }
        )
        .setFooter({
          text: `ID: ${targetUserId}`,
        })
        .setTimestamp()
        .setColor("Blurple");

      await interaction.editReply({
        // content: `User ${targetUser} was banned\nReason: ${reason}`,
        embeds: [unbanEmbed],
      });
    } catch (error) {
      await interaction.editReply({
        content: `Bot Error, Try again later`,
      });
      logger.log("error", `There was an error when unbanning:\n${error}`);
      console.log(error);
    }
  }, // What the bot replies with

  name: "unban", // Name of the command
  description: "Unbans a member from the server", // Description of the command
  // devOnly: true, // Is a dev only command
  // testOnly: true, // Is a test command
  usage: "/unban [user | userID]",
  example: "/unban 130462164640202754",
  options: [
    {
      name: "user",
      description: "The user that you want to ban from the server",
      required: true,
      type: ApplicationCommandOptionType.User,
    },
  ], // Input options
  // deleted: true, // If the command is no longer in use
  permissionsRequired: [PermissionFlagsBits.BanMembers], // What permissions are needed to run the command
  botPermissions: [PermissionFlagsBits.BanMembers, PermissionFlagsBits.EmbedLinks], // What permissions the bot needs to run the command
};
