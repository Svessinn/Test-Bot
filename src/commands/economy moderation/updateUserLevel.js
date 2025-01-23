const { Client, Interaction, PermissionFlagsBits, ApplicationCommandOptionType } = require("discord.js");
const path = require("path");
const getUserLevelData = require("../../queries/getUserLevelData");
const calculateLevelExp = require("../../utils/calculateLevelExp");
const updateUserLevelData = require("../../queries/updateUserLevelData");
const getGuildLevelRoles = require("../../queries/getGuildLevelRoles");

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

    await interaction.deferReply({});

    try {
      const user = interaction.options.getUser("user");
      const userData = await getUserLevelData(user.id, interaction.guild.id);

      if (!userData) {
        await interaction.editReply({
          content: `User data not found for ${user.tag}`,
        });
        return;
      }

      let { level, exp } = userData;
      let requiredExp = calculateLevelExp(level);

      while (exp <= requiredExp && level > 1) {
        level--;
        requiredExp = calculateLevelExp(level);
      }

      while (exp > calculateLevelExp(level)) {
        level++;
      }

      // Update the user data with the new level
      await updateUserLevelData(user.id, interaction.guild.id, level);
      const guildLevelRoles = await getGuildLevelRoles(interaction.guild.id);

      const member = await interaction.guild.members.fetch(user.id);
      const rolesToAdd = [];
      const rolesToRemove = [];

      guildLevelRoles.forEach((role) => {
        if (role.level <= level) {
          rolesToAdd.push(role.roleId);
        } else {
          console.log(
            `Removing role <@&${role.roleId}> from ${member.user.tag} as they are below level ${role.level} and are level ${level}`
          );
          rolesToRemove.push(role.roleId);
        }
      });

      await member.roles.add(rolesToAdd);
      await member.roles.remove(rolesToRemove);

      await interaction.editReply({
        content: `Updated ${user.tag}'s level to ${level}`,
        embeds: [],
      });
    } catch (error) {
      await interaction.editReply({
        content: `Bot Error, Try again later`,
      });
      logger.log("error", `There was an error :\n${error}`);
      console.log(error);
    }
  }, // What the bot replies with

  name: "update-user-level", // Name of the command
  description: "Updates the selected user's level to the correct level based on their current exp", // Description of the command
  // devOnly: true, // Is a dev only command
  // testOnly: true, // Is a test command
  usage: "/update-user-level [user]", // How to use this command. [required], (optional)
  example: "/update-user-level 130462164640202754", // Example of how to run this command
  options: [
    {
      type: ApplicationCommandOptionType.User,
      name: "user",
      description: "The user to update the level of",
      required: true,
    },
  ], // Input options
  // deleted: true, // If the command is no longer in use
  permissionsRequired: [PermissionFlagsBits.ModerateMembers, PermissionFlagsBits.ManageRoles], // What permissions are needed to run the command
  botPermissions: [PermissionFlagsBits.ManageRoles, PermissionFlagsBits.ModerateMembers, PermissionFlagsBits.SendMessages], // What permissions the bot needs to run the command
};
