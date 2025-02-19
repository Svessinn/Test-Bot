const { Client, Interaction, PermissionFlagsBits, ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const path = require("path");
const getKissImage = require("../../utils/commandResponses/kissImages");

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
      .setDescription(`${interaction.user} **kissed** <@${interaction.options.get("user").value}>`)
      .setImage(getKissImage());

    try {
      if (interaction.options.get("user").value === interaction.user.id) {
        await interaction.editReply({
          content: `You can't kiss yourself`,
        });
        return;
      }
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

  name: "kiss", // Name of the command
  description: "Kiss a user", // Description of the command
  // devOnly: true, // Is a dev only command
  // testOnly: true, // Is a test command
  usage: "/kiss [user | userID]", // How to use this command. [required], (optional)
  example: "/kiss 130462164640202754", // Example of how to run this command
  options: [
    {
      name: "user",
      description: "The user you want to kiss",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
  ], // Input options
  // deleted: true, // If the command is no longer in use
  // permissionsRequired: [], // What permissions are needed to run the command
  botPermissions: [PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.SendMessages], // What permissions the bot needs to run the command
};
