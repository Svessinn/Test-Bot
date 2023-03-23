const { Client, Interaction, PermissionFlagsBits, ApplicationCommandOptionType } = require("discord.js");
const path = require("path");
const colourNameToHex = require("../../utils/colourToHex");

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

    await interaction.deferReply({
      ephemeral: false,
    });

    try {
      let colour = interaction.options.get("colour")?.value || null;
      if (colour && !/^#[0-9A-F]{6}$/i.test(colour)) {
        colour = await colourNameToHex(colour);
      }

      let newRole = await interaction.guild.roles.create({
        name: interaction.options.get("role-name").value,
        color: colour || null,
      });
      await interaction.editReply({
        content: `Created a new role: ${newRole}`,
        //embeds: [],
      });
    } catch (error) {
      await interaction.editReply({
        content: `Bot Error, Try again later`,
      });
      logger.log("error", `There was an error creating a new role:\n${error}`);
      console.log(error);
    }
  }, // What the bot replies with

  name: "add-role", // Name of the command
  description: "Add a server role", // Description of the command
  // devOnly: true, // Is a dev only command
  // testOnly: true, // Is a test command
  usage: "/add-role [Role Name]", // How to use this command. [required], (optional)
  example: "/add-role Moderator", // Example of how to run this command
  options: [
    {
      name: "role-name",
      description: "Name of the role you want to create",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "colour",
      description: "Color for the role",
      type: ApplicationCommandOptionType.String,
    },
  ], // Input options
  // deleted: true, // If the command is no longer in use
  permissionsRequired: [PermissionFlagsBits.ManageRoles], // What permissions are needed to run the command
  botPermissions: [PermissionFlagsBits.ManageRoles, PermissionFlagsBits.EmbedLinks], // What permissions the bot needs to run the command
};
