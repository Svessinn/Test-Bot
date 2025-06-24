const path = require("path");
const { Client, Interaction, EmbedBuilder } = require("discord.js");
const getEventLogger = require("../../queries/getGuildEventLogger");
const getLogChannel = require("../../queries/getGuildLogChannel");

// Logging tool
const winston = require("winston");
const logger = winston.createLogger({
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: `logs/log.log` })],
  format: winston.format.printf(
    (log) =>
      `[${log.level.toUpperCase()}] - ${path.basename(__filename)} - ${log.message} ${new Date(Date.now()).toUTCString()}`
  ),
});

/**
 * @param {Client} client
 * @param {Interaction} deletedMessage
 */

module.exports = async (client, deletedMessage) => {
  if (deletedMessage.author.bot) return;

  const event = path.basename(__dirname);
  const log = await getEventLogger(deletedMessage.guild.id, event);

  if (!log) return;

  let attachments = [];
  for (let i of deletedMessage.attachments) {
    attachments.push([i[1].attachment, i[1].contentType]);
  }

  try {
    const channel = await getLogChannel(deletedMessage.guild.id);
    const logChannel = deletedMessage.guild.channels.cache.get(channel.channelId);

    let embed = new EmbedBuilder()
      .setAuthor({ name: `Message Deleted`, iconURL: deletedMessage.guild.iconURL() })
      .setDescription(
        `**Sent by <@${deletedMessage.author.id}> in https://discord.com/channels/${deletedMessage.guild.id}/${deletedMessage.channel.id}/${deletedMessage.id}` +
          ` <t:${Math.floor(deletedMessage.createdTimestamp / 1000)}:R>**\n${deletedMessage.content}`
      )
      .setFooter({ text: `User ID: ${deletedMessage.author.id}` })
      .setTimestamp()
      .setColor("#7289DA");

    if (attachments.length === 1 && attachments[0][1].startsWith("image/")) {
      embed.setImage(attachments[0][0]);
    } else {
      for (let i = 0; i < Math.min(attachments.length, 25); i++) {
        embed.addFields({ name: `Attachment ${i + 1}`, value: attachments[i][0], inline: true });
      }
    }

    await logChannel.send({ embeds: [embed] });
  } catch (error) {
    logger.log("error", `There was an error logging ${event} for ${deletedMessage.guild.id}: \n${error}`);
  }

  return;
};
