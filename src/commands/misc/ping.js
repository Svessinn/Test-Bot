const {
  Client,
  Interaction,
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
   * @param {Client} bot
   * @param {Interaction} interaction
   */

  callback: async (bot, interaction) => {
    await interaction.deferReply();

    const reply = await interaction.fetchReply();

    const ping = reply.createdTimestamp - interaction.createdTimestamp;

    interaction.editReply(
      `Pong! Client ${ping}ms | Websocket: ${bot.ws.ping}ms`
    );
    /*
    interaction.reply({
      content: `Pong! ${bot.ws.ping}ms`, // The content the bot replies with
      //ephemeral: true, // If only the user that send the command should see the reply
    })
    */
  }, // What the bot replies with

  name: "ping", // Name of the command
  description: "Replies with the bot's ping!", // Description of the command
  // devOnly: true, // Is a dev only command
  // testOnly: true, // Is a test command
  usage: "/ping",
  example: `/ping`,
  // options: [{}], // Input options
  // deleted: true, // If the command is no longer in use
  // permissionsRequired: [], // What permissions are needed to run the command
  // botPermissions: [], // What permissions the bot needs to run the command
};
