const { Client, Interaction, ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");
const path = require("path");

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

    await interaction.deferReply();
    let status = interaction.options.get("unlock")?.value || false;

    try {
      if (status) {
        await interaction.guild.channels.cache.forEach((c) => {
          if (!c.type) {
            c.permissionOverwrites.edit(interaction.guild.id, { SendMessages: null });
          }
        });
        await interaction.editReply({
          content: `Server has been removed from locked down`,
        });
      } else {
        await interaction.guild.channels.cache.forEach((c) => {
          if (!c.type) {
            c.permissionOverwrites.edit(interaction.guild.id, { SendMessages: false });
          }
        });
        await interaction.editReply({
          content: `Server has been locked down`,
        });
      }
    } catch (error) {
      await interaction.editReply({
        content: `Bot Error, Try again later`,
      });
      logger.log("error", `There was an error locking down:\n${error}`);
      console.log(error);
    }
  }, // What the bot replies with

  name: "lockdown", // Name of the command
  description: "Locks the server down", // Description of the command
  // devOnly: true, // Is a dev only command
  // testOnly: true, // Is a test command
  usage: "/lockdown",
  example: "/lockdown",
  options: [
    {
      name: "unlock",
      description: "If you want to remove the lockdown",
      type: ApplicationCommandOptionType.Boolean,
    },
  ], // Input options
  // deleted: true, // If the command is no longer in use
  permissionsRequired: [PermissionFlagsBits.ManageChannels], // What permissions are needed to run the command
  botPermissions: [PermissionFlagsBits.ManageChannels], // What permissions the bot needs to run the command
};
