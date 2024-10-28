const { Client, Interaction, PermissionFlagsBits, ApplicationCommandOptionType } = require("discord.js");
const path = require("path");
const rng = require("../../utils/generateRandomNumber");

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

    await interaction.deferReply({
      ephemeral: false,
    });

    const min = interaction.options.get("min")?.value || 0;
    const max = interaction.options.get("max")?.value || 100;

    const num = rng(min, max);

    try {
      await interaction.editReply({
        content: `${num}`,
      });
    } catch (error) {
      await interaction.editReply({
        content: `Bot Error, Try again later`,
      });
      logger.log("error", `There was an error generating a random number:\n${error}`);
      console.log(error);
    }
  }, // What the bot replies with

  name: "rng", // Name of the command
  description: "Generate a random integer", // Description of the command
  // devOnly: true, // Is a dev only command
  // testOnly: true, // Is a test command
  usage: "/rng (min) (max)", // How to use this command. [required], (optional)
  example: "/rng 0 100", // Example of how to run this command
  options: [
    {
      name: "min",
      description: "Minimum (default 0)",
      type: ApplicationCommandOptionType.Integer,
    },
    {
      name: "max",
      description: "Maximum (default 100)",
      type: ApplicationCommandOptionType.Integer,
    },
  ], // Input options
  // deleted: true, // If the command is no longer in use
  // permissionsRequired: [], // What permissions are needed to run the command
  botPermissions: [PermissionFlagsBits.SendMessages], // What permissions the bot needs to run the command
};
