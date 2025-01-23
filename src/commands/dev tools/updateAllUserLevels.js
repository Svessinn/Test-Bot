const { Client, Interaction, PermissionFlagsBits } = require("discord.js");
const path = require("path");
const getAllLevels = require("../../queries/getAllLevels");
const calculateLevelExp = require("../../utils/calculateLevelExp");
const updateUserLevelData = require("../../queries/updateUserLevelData");
const getGuildLevelRoles = require("../../queries/getGuildLevelRoles");
const deleteGuildUserLevel = require("../../queries/deleteGuildUserLevel");

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

    await interaction.reply({ content: "Updating all user levels" });

    try {
      const userData = await getAllLevels();
      let guildLevelRoles = {};

      for (const user of userData) {
        let requiredExp = calculateLevelExp(user.level);
        let level = user.level;
        while (user.exp <= requiredExp && level > 1) {
          level--;
          requiredExp = calculateLevelExp(level);
        }

        while (user.exp > calculateLevelExp(level)) {
          level++;
        }

        await updateUserLevelData(user.userId, user.guildId, level);

        if (!guildLevelRoles[user.guildId]) {
          guildLevelRoles[user.guildId] = await getGuildLevelRoles(user.guildId);
        }

        if (guildLevelRoles[user.guildId].length > 0) {
          let member;
          try {
            const guild = client.guilds.cache.get(user.guildId);
            member = await guild.members.fetch(user.userId);
          } catch (error) {
            logger.log("error", `Could not fetch member with ID: ${user.userId}`);
            console.log(error);
            continue;
          }
          const rolesToAdd = [];
          const rolesToRemove = [];

          guildLevelRoles[user.guildId].forEach((role) => {
            if (role.level <= level) {
              rolesToAdd.push(role.roleId);
            } else {
              rolesToRemove.push(role.roleId);
            }
          });

          await member.roles.remove(rolesToRemove);
          await member.roles.add(rolesToAdd);
        }
      }

      await interaction.editReply({
        content: `Updated all user levels`,
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

  name: "update-all-user-level", // Name of the command
  description: "Updates all users levels to the correct level based on their current exp", // Description of the command
  devOnly: true, // Is a dev only command
  // testOnly: true, // Is a test command
  usage: "/update-all-user-level", // How to use this command. [required], (optional)
  example: "/update-all-user-level", // Example of how to run this command
  options: [], // Input options
  // deleted: true, // If the command is no longer in use
  permissionsRequired: [PermissionFlagsBits.Administrator], // What permissions are needed to run the command
  botPermissions: [PermissionFlagsBits.ManageRoles, PermissionFlagsBits.SendMessages], // What permissions the bot needs to run the command
};
