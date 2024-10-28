const { Client, Interaction, PermissionFlagsBits } = require("discord.js");
const path = require("path");

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
      interaction.reply("This command is only for use in a guild");
      return;
    }
    if (interaction.member.user.bot) {
      interaction.reply("Bots can't use this command");
      return;
    }

    await interaction.deferReply();

    try {
      await interaction.editReply({
        content: `Vote for our bot on top.gg: https://top.gg/bot/${client.user.id}/vote`,
      });
    } catch (error) {
      await interaction.editReply({
        content: `Bot Error, Try again later`,
      });
      logger.log("error", `There was an error when getting user info:\n${error}`);
      console.log(error);
    }
  }, // What the bot replies with

  name: "vote", // Name of the command
  description: "Get a link to vote for the bot", // Description of the command
  // devOnly: true, // Is a dev only command
  testOnly: true, // Is a test command
  usage: "/vote",
  example: `/vote`,
  // options: [], // Input options
  // deleted: true, // If the command is no longer in use
  // permissionsRequired: [], // What permissions are needed to run the command
  botPermissions: [PermissionFlagsBits.SendMessages], // What permissions the bot needs to run the command
};
