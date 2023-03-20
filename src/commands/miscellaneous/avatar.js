const { Client, Interaction, ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const path = require("path");
const fetch = require("axios");

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
    await interaction.deferReply({
      ephemeral: false,
    });

    let subcommand = interaction.options._subcommand;

    let avatarEmbed = new EmbedBuilder();

    if (subcommand === "guild") {
      avatarEmbed
        .setImage(
          interaction.guild.iconURL({
            size: 512,
            dynamic: true,
          })
        )
        .setColor("Blurple")
        .setAuthor({
          name: interaction.guild.name,
          iconURL: interaction.guild.iconURL(),
        });
    }

    if (subcommand === "user") {
      const targetUser = interaction.options._hoistedOptions.length ? interaction.options._hoistedOptions[0].user : interaction.user;

      avatarEmbed
        .setImage(
          targetUser.displayAvatarURL({
            size: 512,
            dynamic: true,
          })
        )
        .setColor("Blurple")
        .setAuthor({
          name: targetUser.tag,
          iconURL: targetUser.displayAvatarURL(),
        });
    }

    if (subcommand === "server") {
      const targetUser = interaction.options._hoistedOptions.length ? interaction.options._hoistedOptions[0].user : interaction.user;

      const res = await fetch.get(`https://discord.com/api/guilds/${interaction.guild.id}/members/${targetUser.id}`, {
        headers: {
          Authorization: `Bot ${client.token}`,
        },
      });

      let url;
      if (res.data?.avatar || false) {
        url = `https://cdn.discordapp.com/guilds/${interaction.guild.id}/users/${targetUser.id}/avatars/${res.data.avatar}?size=512`;
      } else {
        url = targetUser.displayAvatarURL({
          size: 512,
          dynamic: true,
        });
      }

      avatarEmbed
        .setImage(url, {
          dynamic: true,
        })
        .setColor("Blurple")
        .setAuthor({
          name: targetUser.tag,
          iconURL: url,
        });
    }

    try {
      await interaction.editReply({
        embeds: [avatarEmbed],
      });
    } catch (error) {
      await interaction.editReply({
        content: `Bot Error, Try again later`,
      });
      logger.log("error", `There was an error locking a channel:\n${error}`);
      console.log(error);
    }
  }, // What the bot replies with

  name: "avatar", // Name of the command
  description: "Get the avatar of another user", // Description of the command
  // devOnly: true, // Is a dev only command
  // testOnly: true, // Is a test command
  usage: "/avatar [user | userID]", // How to use this command. [required], (optional)
  example: "/avatar 130462164640202754", // Example of how to run this command
  options: [
    {
      type: ApplicationCommandOptionType.Subcommand,
      name: "user",
      description: "Get user's main avatar",
      options: [
        {
          type: ApplicationCommandOptionType.User,
          name: "target-user",
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
          name: "target-user",
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
  // botPermissions: [], // What permissions the bot needs to run the command
};
