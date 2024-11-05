const path = require("path");
const { Client, EmbedBuilder, MessageFlagsBitField } = require("discord.js");
const getEventLogger = require("../../queries/getGuildEventLogger");
const getLogChannel = require("../../queries/getGuildLogChannel");
const msToTime = require("../../utils/msToTime");

// Logging tool
const winston = require("winston");
const logger = winston.createLogger({
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: `logs/log.log` })],
  format: winston.format.printf(
    (log) => `[${log.level.toUpperCase()}] - ${path.basename(__filename)} - ${log.message} ${new Date(Date.now()).toUTCString()}`
  ),
});

function compareObjects(oldObj, newObj) {
  let diffs = [];
  for (i in oldObj) {
    if (oldObj[i] !== newObj[i]) {
      if (i === "flags") {
        if (MessageFlagsBitField.resolve(oldObj.flags) !== MessageFlagsBitField.resolve(newObj.flags)) {
          diffs.push(i);
        }
      } else if (i === "embeds") {
        // Don't care about this
        /* if (oldObj.embeds.length !== newObj.embeds.length) diffs.push(i);
        for (j in oldObj.embeds) {
          if (oldObj.embeds[j] !== oldObj.embeds[j]) diffs.push(i);
        } */
      } else if (i === "components") {
        // Don't care about this
        /* if (oldObj.components.length !== newObj.components.length) diffs.push(i);
        for (j in oldObj.components) {
          if (oldObj.components[j] !== oldObj.components[j]) diffs.push(i);
        } */
      } else if (i === "attachments") {
        // Don't care about this
        // attachments are stored in a Collection() [Map]
      } else if (i === "stickers") {
        // Don't care about this
        // stickers are stored in a Collection() [Map]
      } else if (i === "mentions") {
        // Don't care about this
        // mentions are their own Object
      } else {
        diffs.push(i);
      }
    }
  }
  // Removing duplicates if there are any
  diffs = Array.from(new Set(diffs));
  return diffs;
}

/**
 * @param {Client} client
 */

module.exports = async (client, ...args) => {
  let oldMessage = args[0];
  let newMessage = args[1];

  if (oldMessage.author.bot) return;

  const changes = compareObjects(oldMessage, newMessage);

  if (!changes.length) return;

  const event = path.basename(__dirname);
  const log = await getEventLogger(oldMessage.guild.id, event);

  if (log) {
    try {
      const channel = await getLogChannel(oldMessage.guild.id);
      const logChannel = oldMessage.guild.channels.cache.get(channel.channelId);

      let embed = new EmbedBuilder()
        .setAuthor({ name: oldMessage.guild.name, iconURL: oldMessage.guild.iconURL() })
        .setTitle(`Message Edited https://discord.com/channels/${oldMessage.guild.id}/${oldMessage.channel.id}/${oldMessage.id}`)
        .setDescription(`Something changed for <#${oldMessage.id}>`)
        .setFooter({ text: `Message ID: ${oldMessage.id}` })
        .setThumbnail(`https://cdn.discordapp.com/avatars/${oldMessage.author.id}/${oldMessage.author.avatar}.webp?size=1024`)
        .setTimestamp();

      let embedDescription = ``;

      if (changes.includes("content")) {
        embedDescription += `\n**Was:** ${oldMessage.content}\n**Now:** ${newMessage.content}`;
      }

      // If something noteworthy was changed, update the embed
      if (embedDescription.length > 0) {
        embed.setDescription(embedDescription + `\n**Edited by:** <@${oldMessage.author.id}> <t:${Math.floor(newMessage.editedTimestamp / 1000)}:R>`);
      } else {
        return;
      }

      await logChannel.send({ embeds: [embed] });
      return;
    } catch (error) {
      logger.log("error", `There was an error logging ${event} for ${oldMessage.guild.id}: \n${error}`);
      console.log(error);
    }
  }

  return;
};