const {
  Client,
  Interaction,
  EmbedBuilder,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} = require("discord.js");
const path = require("path");

// Logging tool
const winston = require("winston");
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: `logs/log.log` }),
  ],
  format: winston.format.printf(
    (log) =>
      `[${log.level.toUpperCase()}] - ${path.basename(__filename)} - ${
        log.message
      } ${new Date(Date.now()).toUTCString()}`
  ),
});

module.exports = {
  /**
   *
   * @param {Client} bot
   * @param {Interaction} interaction
   */

  callback: async (bot, interaction) => {
    await interaction.deferReply({
      content: `Creating embed`,
      ephemeral: true,
    });

    let embed = new EmbedBuilder()
      .setColor(
        interaction.options.get("color")
          ? interaction.options.get("color").value
          : null
      )
      .setTitle(
        interaction.options.get("title")
          ? interaction.options.get("title").value
          : null
      )
      .setURL(
        interaction.options.get("title-url")
          ? interaction.options.get("title-url").value
          : null
      )
      .setAuthor({
        name: interaction.options.get("author-name")
          ? interaction.options.get("author-name").value
          : null,
        iconURL: interaction.options.get("author-icon-url")
          ? interaction.options.get("author-icon-url").value
          : null,
        url: interaction.options.get("author-url")
          ? interaction.options.get("author-url").value
          : null,
      })
      .setDescription(
        interaction.options.get("description")
          ? interaction.options.get("description").value.replace(/\\/g, "\n")
          : null
      )
      .setThumbnail(
        interaction.options.get("thumbnail-url")
          ? interaction.options.get("thumbnail-url").value
          : null
      )
      .setImage(
        interaction.options.get("image-url")
          ? interaction.options.get("image-url").value
          : null
      )
      .setTimestamp(
        interaction.options.get("timestamp")?.value || false ? Date.now() : null
      )
      .setFooter({
        text: interaction.options.get("footer-text")
          ? interaction.options.get("footer-text").value
          : null,
        iconURL: interaction.options.get("footer-icon-url")
          ? interaction.options.get("footer-icon-url").value
          : null,
      });

    interaction.channel.send({
      embeds: [embed],
    });

    interaction.editReply({
      content: `Embed sent`,
      ephemeral: true,
    });
  }, // What the bot replies with

  name: "create-embed", // Name of the command
  description: "Creates an embed", // Description of the command
  // devOnly: true, // Is a dev only command
  // testOnly: true, // Is a test command
  usage:
    "/create-embed [description] (colour, title, title-url, author-name, author-icon-url, thumbnail-url, image-url, timestamp, footer-text, footer-icon-url)",
  example:
    "/create-embed description:this is an embed colour:#5539cc timestamp:True",
  nameLocalizations: {},
  options: [
    {
      name: "description",
      description: "Text in the embed (for newline use \\)",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "colour",
      description: "Set embed colour (HEX)",
      type: ApplicationCommandOptionType.String,
      required: false,
      nameLocalizations: {
        bg: "цвят",
        cs: "barva",
        da: "farve",
        de: "farbe",
        el: "χρώμα",
        "en-GB": "colour",
        "en-US": "color",
        "es-ES": "color",
        fi: "väri",
        fr: "couleur",
        hr: "boja",
        hi: "रंग",
        hu: "szín",
        id: "warna",
        it: "colore",
        ja: "色",
        ko: "색상",
        lt: "spalva",
        nl: "kleur",
        no: "farge",
        pl: "kolor",
        "pt-BR": "cor",
        ro: "culoare",
        ru: "цвет",
        "sv-SE": "färg",
        th: "สี",
        tr: "renk",
        uk: "колір",
        vi: "màu-sắc",
        "zh-CN": "顏色",
        "zh-TW": "颜色",
      },
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
  ], // Input options
  // deleted: true, // If the command is no longer in use
  permissionsRequired: [PermissionFlagsBits.Administrator], // What permissions are needed to run the command
  botPermissions: [PermissionFlagsBits.EmbedLinks], // What permissions the bot needs to run the command
};
