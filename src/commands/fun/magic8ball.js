const { Client, Interaction, PermissionFlagsBits, ApplicationCommandOptionType } = require("discord.js");
const path = require("path");
const get8ballResponse = require("../../utils/commandResponses/8ballResponses");

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

    await interaction.deferReply({
      ephemeral: false,
    });

    try {
      await interaction.editReply({
        content: `Your question: __${interaction.options.get("question").value}__\nMy answer: __${get8ballResponse()}__`,
      });
    } catch (error) {
      await interaction.editReply({
        content: `Bot Error, Try again later`,
      });
      logger.log("error", `There was an error :\n${error}`);
      console.log(error);
    }
  }, // What the bot replies with

  name: "magic-8ball", // Name of the command
  description: "Shake the magic 8ball", // Description of the command
  // devOnly: true, // Is a dev only command
  // testOnly: true, // Is a test command
  usage: "/magic-8ball [question]", // How to use this command. [required], (optional)
  example: '/magic-8ball "Are you human?"', // Example of how to run this command
  options: [
    {
      name: "question",
      description: "The question you want answered",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ], // Input options
  // deleted: true, // If the command is no longer in use
  // permissionsRequired: [], // What permissions are needed to run the command
  // botPermissions: [], // What permissions the bot needs to run the command
};
