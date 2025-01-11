const { Client, Interaction, ApplicationCommandOptionType, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const path = require("path");
const getLevelupRoles = require("../../queries/getGuildLevelRoles");
const addLevelupRole = require("../../queries/addGuildLevelRole");
const delLevelupRole = require("../../queries/deleteGuildLevelRole");

// Logging tool
const winston = require("winston");
const level = require("../economy/level");
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

    let subcommand = interaction.options.getSubcommand();
    let outEmbed = new EmbedBuilder().setColor("#7289DA");

    if (subcommand === "get") {
      let out = "\u200b";
      const levelupRoles = await getLevelupRoles(interaction.guild.id);
      outEmbed
        .setTitle(`Levelup roles for ${interaction.guild.name}`)
        .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
        .setTimestamp();
      levelupRoles.forEach((r) => {
        out += `**<@&${r.roleId}>** given at level ${r.level}\n`;
      });
      outEmbed.setDescription(out);
      try {
        await interaction.editReply({
          embeds: [outEmbed],
        });
      } catch (error) {
        await interaction.editReply({
          content: `Bot Error, Try again later`,
        });
        logger.log("error", `There was an error getting levelup roles:\n${error}`);
        console.log(error);
      }
    }

    if (subcommand === "add") {
      const roleId = interaction.options.get("role").value;
      const level = interaction.options.get("level").value;

      await addLevelupRole(interaction.guild.id, roleId, level);

      outEmbed
        .setTitle(`Added new levelup role`)
        .setTimestamp()
        .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
        .setDescription(`**Role** <@&${roleId}> will be given at **level ${String(level)}**`);

      try {
        await interaction.editReply({
          embeds: [outEmbed],
        });
      } catch (error) {
        await interaction.editReply({
          content: `Bot Error, Try again later`,
        });
        logger.log("error", `There was an error adding a levelup role:\n${error}`);
        console.log(error);
      }
    }

    if (subcommand === "delete") {
      const roleId = interaction.options.get("role").value;

      await delLevelupRole(interaction.guild.id, roleId);

      outEmbed
        .setTitle(`Removed a levelup role`)
        .setTimestamp()
        .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
        .setDescription(`**Role** <@&${roleId}> will no longer be given at any level`);

      try {
        await interaction.editReply({
          embeds: [outEmbed],
        });
      } catch (error) {
        await interaction.editReply({
          content: `Bot Error, Try again later`,
        });
        logger.log("error", `There was an error removing a levelup role:\n${error}`);
        console.log(error);
      }
    }
  }, // What the bot replies with

  name: "level-roles", // Name of the command
  description: "Manage levelup roles", // Description of the command
  // devOnly: true, // Is a dev only command
  // testOnly: true, // Is a test command
  usage: "/level-roles get\n/level-roles add [role] [level]\n/level-roles delete [role]", // How to use this command. [required], (optional)
  example: '/level-roles get\n/level-roles add "@Level 10" 10\n/level-roles delete "@Level 10"', // Example of how to run this command
  options: [
    {
      name: "get",
      description: "Get a list of all levelup roles",
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "add",
      description: "Add a levelup role (max 25 per guild)",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "role",
          description: "The role you want to add",
          type: ApplicationCommandOptionType.Role,
          required: true,
        },
        {
          name: "level",
          description: "The level you want to assign the role to",
          type: ApplicationCommandOptionType.Integer,
          required: true,
        },
      ],
    },
    {
      name: "delete",
      description: "Delete a levelup role",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "role",
          description: "The role you want to delete",
          type: ApplicationCommandOptionType.Role,
          required: true,
        },
      ],
    },
  ], // Input options
  // deleted: true, // If the command is no longer in use
  permissionsRequired: [PermissionFlagsBits.Administrator], // What permissions are needed to run the command
  botPermissions: [PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.SendMessages], // What permissions the bot needs to run the command
};
