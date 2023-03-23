const { Client, Interaction, ApplicationCommandOptionType } = require("discord.js");
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

  callback: async (bot, interaction) => {
    if (!interaction.inGuild()) {
      interaction.reply("This command can only be ran in a guild");
      return;
    }
    if (interaction.member.user.bot) {
      interaction.reply("Bots can't user this command");
      return;
    }

    await interaction.deferReply();

    const eq = await interaction.options.get("expression").value;

    try {
      await interaction.editReply({
        content: String(Number(eval(eq))), // The content the bot replies with
        //ephemeral: true, // If only the user that send the command should see the reply
      });
    } catch (error) {
      await interaction.editReply({
        content: "Invalid input", // The content the bot replies with
        //embeds: [embed] // The embeds the bot replies with
        //ephemeral: true, // If only the user that send the command should see the reply
      });
      logger.log("error", `There was an error calculating:\n${error}`);
      console.log(error);
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
