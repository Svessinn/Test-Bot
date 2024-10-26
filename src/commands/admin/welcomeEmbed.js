const { Client, Interaction, EmbedBuilder, ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");
const path = require("path");
const colourNameToHex = require("../../utils/colourToHex");
const welcomeEmbedCreate = require("../../queries/upsertGuildWelcomeEmbed");
const welcomeEmbedDelete = require("../../queries/deleteGuildWelcomeEmbed");
const welcomeEmbedFetch = require("../../queries/getWelcomeEmbedData.js");
const WelcomeChannelCreate = require("../../queries/upsertGuildWelcomeChannel");
const WelcomeChannelDelete = require("../../queries/deleteGuildWelcomeChannel.js");

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
      interaction.reply("This command can only be ran in a guild");
      return;
    }
    if (interaction.member.user.bot) {
      interaction.reply("Bots can't user this command");
      return;
    }

    await interaction.deferReply({
      content: `Creating embed`,
      ephemeral: true,
    });

    let subcommand = interaction.options._subcommand;

    if (subcommand === "manage") {
      let colour = interaction.options.get("colour")?.value || null;
      if (colour && !/^#[0-9A-F]{6}$/i.test(colour)) {
        colour = await colourNameToHex(colour);
      }

      try {
        welcomeEmbedCreate(
          interaction.guild.id,
          colour,
          interaction.options.get("title")?.value || null,
          interaction.options.get("title-url")?.value || null,
          interaction.options.get("author-name")?.value || null,
          interaction.options.get("author-icon-url")?.value || null,
          interaction.options.get("author-url")?.value || null,
          interaction.options.get("description")?.value || null,
          interaction.options.get("thumbnail-url")?.value || null,
          interaction.options.get("image-url")?.value || null,
          interaction.options.get("timestamp")?.value || 0,
          interaction.options.get("footer-text")?.value || null,
          interaction.options.get("footer-icon-url")?.value || null,
          interaction.options.get("content")?.value || null
        );
        await interaction.editReply({
          content: `Welcome embed created/changed`,
        });
      } catch (error) {
        await interaction.editReply({
          content: `Bot Error, Try again later`,
        });
        logger.log("error", `There was an error managing guild welcome channel:\n${error}`);
        console.log(error);
      }
    }

    if (subcommand === "delete") {
      try {
        await welcomeEmbedDelete(interaction.guild.id);
        await WelcomeChannelDelete(interaction.guild.id);

        interaction.editReply({
          content: `Welcome Embed Successfully Deleted`,
          ephemeral: true,
        });
      } catch (error) {
        await interaction.editReply({
          content: `Bot Error, Try again later`,
        });
        logger.log("error", `There was an error deleting guild welcome channel:\n${error}`);
        console.log(error);
      }
    }

    if (subcommand === "channel") {
      try {
        let welcomeChannel = interaction.options.get("channel")?.value || interaction.channel.id;

        await WelcomeChannelCreate(interaction.guild.id, welcomeChannel);

        interaction.editReply({
          content: `Welcome Channel Successfully Created`,
          ephemeral: true,
        });
      } catch (error) {
        await interaction.editReply({
          content: `Bot Error, Try again later`,
        });
        logger.log("error", `There was an error selecting guild welcome channel:\n${error}`);
        console.log(error);
      }
    }

    if (subcommand === "view") {
      //do something
      try {
        let welcomeEmbedInfo = await welcomeEmbedFetch(interaction.guild.id);
        if (!welcomeEmbedInfo) {
          interaction.editReply({
            content: `Your guild doesn't have a Welcome Embed set-up`,
            ephemeral: true,
          });
          return;
        }

        let welcomeText = welcomeEmbedInfo.content;
        if (!welcomeText) {
          welcomeText = "";
        }
        welcomeText = welcomeText.replace(/\\/g, "\n").replace("{user}", `<@${interaction.user.id}>`);

        let welcomeEmbed = new EmbedBuilder()
          .setColor(welcomeEmbedInfo.colour)
          .setTitle(welcomeEmbedInfo.title?.replace("{user}", interaction.user.tag) || welcomeEmbedInfo.title)
          .setURL(welcomeEmbedInfo.titleURL)
          .setAuthor({
            name: welcomeEmbedInfo.authorName?.replace("{user}", interaction.user.tag) || welcomeEmbedInfo.authorName,
            iconURL:
              welcomeEmbedInfo.authorIconURL?.replace(
                "{user}",
                interaction.user.displayAvatarURL({
                  size: 1024,
                  dynamic: true,
                })
              ) || welcomeEmbedInfo.authorIconURL,
            url: welcomeEmbedInfo.authorURL,
          })
          .setDescription(
            welcomeEmbedInfo.description.replace(/\\/g, "\n")?.replace("{user}", `<@${interaction.user.id}>`) ||
              welcomeEmbedInfo.description.replace(/\\/g, "\n")
          )
          .setThumbnail(welcomeEmbedInfo.thumbnail)
          .setImage(welcomeEmbedInfo.image)
          .setTimestamp(welcomeEmbedInfo.timestamp || false ? Date.now() : null)
          .setFooter({
            text: welcomeEmbedInfo.footerText?.replace("{user}", interaction.user.tag) || welcomeEmbedInfo.footerText,
            iconURL:
              welcomeEmbedInfo.footerIconURL?.replace(
                "{user}",
                interaction.user.displayAvatarURL({
                  size: 1024,
                  dynamic: true,
                })
              ) || welcomeEmbedInfo.footerIconURL,
          });

        interaction.editReply({
          content: `Welcome Embed Successfully Viewed\n${welcomeText}`,
          embeds: [welcomeEmbed],
          ephemeral: true,
        });
      } catch (error) {
        await interaction.editReply({
          content: `Bot Error, Try again later`,
        });
        logger.log("error", `There was an error deleting guild welcome channel:\n${error}`);
        console.log(error);
      }
    }
  }, // What the bot replies with

  name: "welcome-embed", // Name of the command
  description: "Manage  the Welcome embed of the server", // Description of the command
  // devOnly: true, // Is a dev only command
  // testOnly: true, // Is a test command
  usage:
    "/welcome-embed cerate [description] (colour, title, title-url, author-name, author-icon-url, thumbnail-url, image-url, timestamp, footer-text, footer-icon-url)\n/melcome-embed delete",
  example:
    "/welcome-embed create description:welcome to our server {user} colour:#5539cc timestamp:True\n*{user} is replaced by the tag of the user that just joined,\nIt can be used in the author-name, description, title and/or footer*\n/welcome-embed delete",
  nameLocalizations: {},
  options: [
    {
      type: ApplicationCommandOptionType.Subcommand,
      name: "manage",
      description: "Create/Change a Welcome embed for your server",
      options: [
        {
          name: "description",
          description: "Text in the embed (for newline use \\)",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: "colour",
          description: "Set embed colour",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "title",
          description: "Embed title",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "title-url",
          description: "URL for the title",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "author-name",
          description: "Author Name",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "author-icon-url",
          description: "URL for the Author Icon",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "author-url",
          description: "URL for the Autor",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "thumbnail-url",
          description: "URL for a thumbnail photo",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "image-url",
          description: "URL for the main inage of the embed",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "timestamp",
          description: "Timestamp in the footer",
          type: ApplicationCommandOptionType.Boolean,
          required: false,
        },
        {
          name: "footer-text",
          description: "Text in the footer",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "footer-icon-url",
          description: "URL for the footer icon. For user's icon use {user}",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "content",
          description: "Additional text, not in the embed. To tag a user use {user}",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
      ],
    },
    {
      type: ApplicationCommandOptionType.Subcommand,
      name: "delete",
      description: "Delete your server's Welcome embed",
    },
    {
      type: ApplicationCommandOptionType.Subcommand,
      name: "channel",
      description: "Set Welcome Cahnnel, If left blank: current channel is selected",
      options: [
        {
          name: "channel",
          description: "Select a channel that the Welcome Embed should be sent to",
          type: ApplicationCommandOptionType.Channel,
          required: false,
        },
      ],
    },
    {
      type: ApplicationCommandOptionType.Subcommand,
      name: "view",
      description: "Look at your welcome embed",
    },
  ], // Input options
  // deleted: true, // If the command is no longer in use
  permissionsRequired: [PermissionFlagsBits.Administrator], // What permissions are needed to run the command
  botPermissions: [PermissionFlagsBits.EmbedLinks], // What permissions the bot needs to run the command
};
