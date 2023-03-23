const { Client, Interaction } = require("discord.js");
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

    await interaction.deferReply();

    const reply = await interaction.fetchReply();

    const ping = reply.createdTimestamp - interaction.createdTimestamp;

    interaction.editReply(`Pong! Client ${ping}ms | Websocket: ${client.ws.ping}ms`);
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
