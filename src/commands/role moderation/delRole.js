const { Client, Interaction, PermissionFlagsBits, ApplicationCommandOptionType } = require("discord.js");
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

    await interaction.deferReply({
      ephemeral: false,
    });

    try {
      let role = interaction.guild.roles.cache.get(interaction.options.get("role").value);
      await interaction.guild.roles.delete(interaction.options.get("role").value);

      interaction.editReply({
        content: `Deleted role: ${role.name}`,
      });
    } catch (error) {
      await interaction.editReply({
        content: `Bot Error, Try again later`,
      });
      logger.log("error", `There was an error deleting a role:\n${error}`);
      console.log(error);
    }
  }, // What the bot replies with

  name: "delete-role", // Name of the command
  description: "Delete a server role", // Description of the command
  // devOnly: true, // Is a dev only command
  // testOnly: true, // Is a test command
  usage: "/delete-role [Role]", // How to use this command. [required], (optional)
  example: "/delete-role Moderator", // Example of how to run this command
  options: [
    {
      name: "role",
      description: "The role you want to delete",
      type: ApplicationCommandOptionType.Role,
      required: true,
    },
  ], // Input options
  // deleted: true, // If the command is no longer in use
  permissionsRequired: [PermissionFlagsBits.ManageRoles], // What permissions are needed to run the command
  botPermissions: [PermissionFlagsBits.ManageRoles, PermissionFlagsBits.EmbedLinks], // What permissions the bot needs to run the command
};
