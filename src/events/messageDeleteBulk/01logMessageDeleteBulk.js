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
 */

module.exports = async (client, ...args) => {
  const deletedMessages = args[0];
  const interactionChannel = args[1];

  const event = path.basename(__dirname);
  const log = await getEventLogger(interactionChannel.guild.id, event);

  if (log) {
    try {
      const channel = await getLogChannel(interactionChannel.guild.id);
      const logChannel = interactionChannel.guild.channels.cache.get(channel.channelId);

      let embed = new EmbedBuilder()
        .setAuthor({ name: `Bulk Delete`, iconURL: interactionChannel.guild.iconURL() })
        .setDescription(`${Array.from(deletedMessages).length} messages deleted in <#${interactionChannel.id}>`)
        .setFooter({ text: `Channel ID: ${interactionChannel.id}` })
        .setTimestamp()
        .setColor("#7289DA");

      await logChannel.send({ embeds: [embed] });
      return;
    } catch (error) {
      logger.log("error", `There was an error logging ${event} for ${interactionChannel.guild.id}: \n${error}`);
      console.log(error);
    }
  }

  return;
};
