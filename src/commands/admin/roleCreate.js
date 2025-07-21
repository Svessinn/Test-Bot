const { Client, Interaction, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const path = require("path");

// Logging tool
const winston = require("winston");
const level = require("../economy/level");
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

    await interaction.deferReply({});

    const roleName = interaction.options.getString("name");
    const roleColor = interaction.options.getString("colour") || "#000000"; // Default color if not provided
    const guild = interaction.guild;
    const role = await guild.roles.create({
      name: roleName,
      color: roleColor,
      reason: `Role created by ${interaction.user.tag}`,
    });
    const outEmbed = new EmbedBuilder()
      .setColor(roleColor)
      .setTitle("Role Created")
      .setDescription(`Role <@&${role.id}> has been created successfully!`)
      .addFields({ name: "Role ID", value: role.id, inline: true })
      .setFooter({ text: guild.name, iconURL: guild.iconURL() })
      .setTimestamp();
    await interaction.editReply({
      embeds: [outEmbed],
    });
  }, // What the bot replies with

  name: "role-create", // Name of the command
  description: "Create a role", // Description of the command
  // devOnly: true, // Is a dev only command
  // testOnly: true, // Is a test command
  usage: "/role-create [name] (colour)", // How to use this command. [required], (optional)
  example: "/role-create test #123456", // Example of how to run this command
  options: [
    {
      name: "name",
      description: "Name of the role",
      type: 3, // STRING
      required: true,
    },
    {
      name: "colour",
      description: "Colour of the role (hex code)",
      type: 3, // STRING
      required: false,
    },
  ], // Input options
  // deleted: true, // If the command is no longer in use
  permissionsRequired: [PermissionFlagsBits.ManageRoles], // What permissions are needed to run the command
  botPermissions: [PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageRoles], // What permissions the bot needs to run the command
};
