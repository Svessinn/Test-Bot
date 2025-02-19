const { Client, Interaction, PermissionFlagsBits, ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const path = require("path");
const getPatImage = require("../../utils/commandResponses/patImages");

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

    const response = new EmbedBuilder()
      .setColor("#7289DA")
      .setDescription(`${interaction.user} **patted** <@${interaction.options.get("user").value}>`)
      .setImage(getPatImage());

    try {
      await interaction.editReply({
        embeds: [response],
      });
    } catch (error) {
      await interaction.editReply({
        content: `Bot Error, Try again later`,
      });
      logger.log("error", `There was an error :\n${error}`);
      console.log(error);
    }
  }, // What the bot replies with

  name: "pat", // Name of the command
  description: "Pat a user", // Description of the command
  // devOnly: true, // Is a dev only command
  // testOnly: true, // Is a test command
  usage: "/pat [user | userID]", // How to use this command. [required], (optional)
  example: "/pat 130462164640202754", // Example of how to run this command
  options: [
    {
      name: "user",
      description: "The user you want to pat",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
  ], // Input options
  // deleted: true, // If the command is no longer in use
  // permissionsRequired: [], // What permissions are needed to run the command
  botPermissions: [PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.SendMessages], // What permissions the bot needs to run the command
};
