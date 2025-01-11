const { Client, Interaction, ApplicationCommandOptionType, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
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

    await interaction.deferReply({});

    let subcommand = interaction.options.getSubcommand();
    let role = interaction.guild.roles.cache.get(interaction.options.get("role").value);

    let outEmbed = new EmbedBuilder()
      .setColor("#7289DA")
      .setTimestamp()
      .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
      .setTitle(`Gave role: ${role.name}`);

    const membersCache = interaction.guild.members.cache;

    if (subcommand === "member") {
      let member = membersCache.get(interaction.options.get("member").value);

      await member.roles.add(role);

      outEmbed.setDescription(`Gave ${member} the ${role} role`);
    }

    if (subcommand === "all") {
      membersCache.forEach(async (member) => {
        await member.roles.add(role);
      });

      outEmbed.setDescription(`Gave ${role} to all members`);
    }

    if (subcommand === "all-humans") {
      membersCache.forEach(async (member) => {
        if (!member.user.bot) {
          await member.roles.add(role);
        }
      });

      outEmbed.setDescription(`Gave ${role} to all humans`);
    }

    if (subcommand === "all-bots") {
      membersCache.forEach(async (member) => {
        if (member.user.bot) {
          await member.roles.add(role);
        }
      });

      outEmbed.setDescription(`Gave ${role} to all bots`);
    }

    try {
      await interaction.editReply({
        embeds: [outEmbed],
      });
    } catch (error) {
      await interaction.editReply({
        content: `Bot Error, Try again later`,
      });
      logger.log("error", `There was an error :\n${error}`);
      console.log(error);
    }
  }, // What the bot replies with

  name: "give-role", // Name of the command
  description: "Give role to member", // Description of the command
  // devOnly: true, // Is a dev only command
  // testOnly: true, // Is a test command
  usage: "/give-role", // How to use this command. [required], (optional)
  example: "/give-role", // Example of how to run this command
  options: [
    {
      name: "member",
      description: "Give a role to a specific member",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "member",
          description: "The member you want to give a role to",
          type: ApplicationCommandOptionType.User,
          required: true,
        },
        {
          name: "role",
          description: "The role you want to give",
          type: ApplicationCommandOptionType.Role,
          required: true,
        },
      ],
    },
    {
      name: "all",
      description: "Give a role to a all members",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "role",
          description: "The role you want to give",
          type: ApplicationCommandOptionType.Role,
          required: true,
        },
      ],
    },
    {
      name: "all-humans",
      description: "Give a role to a all human members",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "role",
          description: "The role you want to give",
          type: ApplicationCommandOptionType.Role,
          required: true,
        },
      ],
    },
    {
      name: "all-bots",
      description: "Give a role to all bot members",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "role",
          description: "The role you want to give",
          type: ApplicationCommandOptionType.Role,
          required: true,
        },
      ],
    },
  ], // Input options
  // deleted: true, // If the command is no longer in use
  permissionsRequired: [PermissionFlagsBits.ManageRoles], // What permissions are needed to run the command
  botPermissions: [PermissionFlagsBits.ManageRoles, PermissionFlagsBits.EmbedLinks], // What permissions the bot needs to run the command
};
