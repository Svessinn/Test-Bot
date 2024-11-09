const { Client, Interaction, EmbedBuilder } = require("discord.js");
const path = require("path");
const welcomeEmbedFetch = require("../../queries/getGuildWelcomeEmbed");
const getWelcomeChannel = require("../../queries/getGuildWelcomeChannel");
const winston = require("winston");

// Logging tool
const logger = winston.createLogger({
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: `logs/log.log` })],
  format: winston.format.printf(
    (log) => `[${log.level.toUpperCase()}] - ${path.basename(__filename)} - ${log.message} ${new Date(Date.now()).toUTCString()}`
  ),
});

/**
 * @param {Client} client
 * @param {Interaction} interaction
 */

module.exports = async (client, interaction) => {
  if (interaction.bot) return;

  let embedInfo = await welcomeEmbedFetch(interaction.guild.id);
  if (!embedInfo) return;

  let embedChannel = await getWelcomeChannel(interaction.guild.id);
  if (!embedChannel) {
    embedChannel = interaction.guild.systemChannel;
  } else {
    embedChannel = interaction.guild.channels.cache.find((i) => i.id === embedChannel);
  }

  try {
    let welcomeText = embedInfo.content;
    if (!welcomeText) {
      welcomeText = "";
    }
    welcomeText = welcomeText.replace(/\\/g, "\n").replace("{user}", `<@${interaction.user.id}>`);

    let welcomeEmbed = new EmbedBuilder()
      .setColor(embedInfo.colour)
      .setTitle(embedInfo.title?.replace("{user}", interaction.user.tag) || embedInfo.title)
      .setURL(embedInfo.titleURL)
      .setAuthor({
        name: embedInfo.authorName?.replace("{user}", interaction.user.tag) || embedInfo.authorName,
        iconURL:
          embedInfo.authorIconURL?.replace(
            "{user}",
            interaction.user.displayAvatarURL({
              size: 1024,
              dynamic: true,
            })
          ) || embedInfo.authorIconURL,
        url: embedInfo.authorURL,
      })
      .setDescription(embedInfo.description.replace(/\\/g, "\n")?.replace("{user}", `<@${interaction.user.id}>`) || embedInfo.description)
      .setThumbnail(embedInfo.thumbnail)
      .setImage(embedInfo.image)
      .setTimestamp(embedInfo.timestamp || false ? Date.now() : null)
      .setFooter({
        text: embedInfo.footerText?.replace("{user}", interaction.user.tag) || embedInfo.footerText,
        iconURL:
          embedInfo.footerIconURL?.replace(
            "{user}",
            interaction.user.displayAvatarURL({
              size: 1024,
              dynamic: true,
            })
          ) || embedInfo.footerIconURL,
      });

    embedChannel.send({ content: welcomeText, embeds: [welcomeEmbed] });
  } catch (error) {
    logger.log("error", `There was an error sending welcome embed:\n${error}`);
    console.log(error);
  }
};
