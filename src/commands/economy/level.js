const { Client, Interaction, ApplicationCommandOptionType } = require("discord.js");
const path = require("path");
const winston = require("winston");
const getLevel = require("../../queries/getUserLevelData");

// Logging tool
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

    const member = interaction.options.get("user")?.value || interaction.member.id;

    const level = await getLevel(member, interaction.guild.id);

    let targetUser;
    try {
      targetUser = await interaction.guild.members.fetch(member);
    } catch (err) {
      logger.log("error", err);
    }

    if (targetUser.user.bot) {
      await interaction.editReply({
        content: `${targetUser.user.tag} is a bot, and therefore doesn't have a level`,
      });
      return;
    }

    try {
      if (level) {
        await interaction.editReply({
          content: `${targetUser.user.tag} is level ${level.level}`,
        });
        return;
      }

      await interaction.editReply({
        content: `${targetUser.user.tag} is level 0`,
      });
    } catch (error) {
      await interaction.editReply({
        content: `Bot Error, Try again later`,
      });
      logger.log("error", `There was an error when sending level:\n${error}`);
      console.log(error);
    }
  }, // What the bot replies with

  name: "level", // Name of the command
  description: "Get level of a user", // Description of the command
  // devOnly: true, // Is a dev only command
  // testOnly: true, // Is a test command
  usage: "/level (user | userID)", // How to use this command. [required], (optional)
  example: "/level", // Example of how to run this command
  options: [
    {
      name: "user",
      description: "User who's level you want",
      type: ApplicationCommandOptionType.User,
    },
  ], // Input options
  // deleted: true, // If the command is no longer in use
  // permissionsRequired: [], // What permissions are needed to run the command
  // botPermissions: [], // What permissions the bot needs to run the command
};
