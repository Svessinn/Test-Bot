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

  callback: (bot, interaction) => {
    const eq = interaction.options.get("expression").value;
    try {
      interaction.reply({
        content: String(Number(eval(eq))), // The content the bot replies with
        //ephemeral: true, // If only the user that send the command should see the reply
      });
    } catch (error) {
      interaction.reply({
        content: "Invalid input", // The content the bot replies with
        //embeds: [embed] // The embeds the bot replies with
        //ephemeral: true, // If only the user that send the command should see the reply
      });
    }
  }, // What the bot replies with

  name: "calc", // Name of the command
  description: "Calculator", // Description of the command
  // devOnly: true, // Is a dev only command
  // testOnly: true, // Is a test command
  usage: "/calc [expression]",
  example: "/calc 1+1",
  options: [
    {
      name: "expression",
      description: "Input a maths expression",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ], // Input options
  // deleted: true, // If the command is no longer in use
  // permissionsRequired: [], // What permissions are needed to run the command
  // botPermissions: [], // What permissions the bot needs to run the command
};
