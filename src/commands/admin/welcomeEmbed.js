/*
 *  Still a Work in Progress
 *  Haven't started on the Embed Building yet
 *  Still need to create the query for setting a Welcome Channel
 */
const { Client, Interaction, EmbedBuilder, ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");
const path = require("path");
const colourNameToHex = require("../../utils/colourToHex");
const welcomeEmbedDelete = require("../../queries/deleteGuildWelcomeEmbed");

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

    /*     let colour = interaction.options.get("colour")?.value || null;
    if (colour && !/^#[0-9A-F]{6}$/i.test(colour)) {
      colour = await colourNameToHex(colour);
    }

    let embed = new EmbedBuilder()
      .setColor(colour || null)
      .setTitle(interaction.options.get("title") ? interaction.options.get("title").value : null)
      .setURL(interaction.options.get("title-url") ? interaction.options.get("title-url").value : null)
      .setAuthor({
        name: interaction.options.get("author-name") ? interaction.options.get("author-name").value : null,
        iconURL: interaction.options.get("author-icon-url") ? interaction.options.get("author-icon-url").value : null,
        url: interaction.options.get("author-url") ? interaction.options.get("author-url").value : null,
      })
      .setDescription(interaction.options.get("description") ? interaction.options.get("description").value.replace(/\\/g, "\n") : null)
      .setThumbnail(interaction.options.get("thumbnail-url") ? interaction.options.get("thumbnail-url").value : null)
      .setImage(interaction.options.get("image-url") ? interaction.options.get("image-url").value : null)
      .setTimestamp(interaction.options.get("timestamp")?.value || false ? Date.now() : null)
      .setFooter({
        text: interaction.options.get("footer-text") ? interaction.options.get("footer-text").value : null,
        iconURL: interaction.options.get("footer-icon-url") ? interaction.options.get("footer-icon-url").value : null,
      });

    interaction.channel.send({
      embeds: [embed],
    }); */

    if (subcommand === "delete") {
      try {
        await welcomeEmbedDelete(interaction.guild.id);
        interaction.editReply({
          content: `Welcome Embed successfully deleted`,
          ephemeral: true,
        });
      } catch (error) {
        await interaction.editReply({
          content: `Bot Error, Try again later`,
        });
        logger.log("error", `There was an error getting an avatar:\n${error}`);
        console.log(error);
      }
    }
  }, // What the bot replies with

  name: "welcome-embed", // Name of the command
  description: "Manage the Welcome embed of the server", // Description of the command
  // devOnly: true, // Is a dev only command
  // testOnly: true, // Is a test command
  usage:
    "/welcome-embed cerate [description] (colour, title, title-url, author-name, author-icon-url, thumbnail-url, image-url, timestamp, footer-text, footer-icon-url)\n/melcome-embed delete",
  example:
    "/welcome-embed create description:welcome to our server {user} colour:#5539cc timestamp:True\n*{user} is replaced by the tag of the user that just joined,\nIt can be used in the description, title and/or footer*\n/welcome-embed delete",
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
          description: "URL for the footer icon",
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
      description: "Set Welcome Cahnnel",
      options: [
        {
          name: "channel",
          description: "Select a channel that the Welcome Embed should be sent to",
          type: ApplicationCommandOptionType.Channel,
          required: true,
        },
      ],
    },
  ], // Input options
  // deleted: true, // If the command is no longer in use
  permissionsRequired: [PermissionFlagsBits.Administrator], // What permissions are needed to run the command
  botPermissions: [PermissionFlagsBits.EmbedLinks], // What permissions the bot needs to run the command
};
