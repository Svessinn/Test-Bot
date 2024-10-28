const { Client, Interaction, ApplicationCommandOptionType, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
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

    let subcommand = interaction.options._subcommand;

    let avatarEmbed = new EmbedBuilder().setColor("Blurple");

    if (subcommand === "guild") {
      avatarEmbed
        .setImage(
          interaction.guild.iconURL({
            size: 1024,
            dynamic: true,
          })
        )
        .setAuthor({
          name: interaction.guild.name,
          iconURL: interaction.guild.iconURL(),
        });
    }

    if (subcommand === "user") {
      const targetUser = interaction.options.get("user")?.user || interaction.user;

      avatarEmbed
        .setImage(
          targetUser.displayAvatarURL({
            size: 1024,
            dynamic: true,
          })
        )
        .setAuthor({
          name: targetUser.tag,
          iconURL: targetUser.displayAvatarURL(),
        });
    }

    if (subcommand === "server") {
      let targetUser = interaction.options?.get("user") || null;
      if (targetUser) {
        avatarEmbed
          .setImage(targetUser.member.displayAvatarURL({ size: 1024 }), {
            dynamic: true,
          })
          .setAuthor({
            name: targetUser.user.tag,
            iconURL: targetUser.member.displayAvatarURL(),
          });
      } else {
        avatarEmbed
          .setImage(interaction.member.displayAvatarURL({ size: 1024 }), {
            dynamic: true,
          })
          .setAuthor({
            name: interaction.user.tag,
            iconURL: interaction.member.displayAvatarURL(),
          });
      }
    }

    try {
      await interaction.editReply({
        embeds: [avatarEmbed],
      });
    } catch (error) {
      await interaction.editReply({
        content: `Bot Error, Try again later`,
      });
      logger.log("error", `There was an error getting an avatar:\n${error}`);
      console.log(error);
    }
  }, // What the bot replies with

  name: "avatar", // Name of the command
  description: "Get an avatar/icon", // Description of the command
  // devOnly: true, // Is a dev only command
  // testOnly: true, // Is a test command
  usage: "/avatar user [user | userID]\n/avatar server [user | userID]\n/avatar guild", // How to use this command. [required], (optional)
  example: "/avatar user 130462164640202754\n/avatar server 130462164640202754\n/avatar guild", // Example of how to run this command
  options: [
    {
      type: ApplicationCommandOptionType.Subcommand,
      name: "user",
      description: "Get user's main avatar",
      options: [
        {
          type: ApplicationCommandOptionType.User,
          name: "user",
          description: "The user who's avatar you want",
        },
      ],
    },
    {
      type: ApplicationCommandOptionType.Subcommand,
      name: "server",
      description: "Get user's server avatar",
      options: [
        {
          type: ApplicationCommandOptionType.User,
          name: "user",
          description: "The user who's avatar you want",
        },
      ],
    },
    {
      type: ApplicationCommandOptionType.Subcommand,
      name: "guild",
      description: "Get the server's icon",
      // options: [],
    },
  ], // Input options
  // deleted: true, // If the command is no longer in use
  // permissionsRequired: [], // What permissions are needed to run the command
  botPermissions: [PermissionFlagsBits.EmbedLinks], // What permissions the bot needs to run the command
};
