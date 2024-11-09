const path = require("path");
const { Client, Interaction, EmbedBuilder } = require("discord.js");
const getEventLogger = require("../../queries/getGuildEventLogger");
const getLogChannel = require("../../queries/getGuildLogChannel");

// Logging tool
const winston = require("winston");
const logger = winston.createLogger({
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: `logs/log.log` })],
  format: winston.format.printf(
    (log) => `[${log.level.toUpperCase()}] - ${path.basename(__filename)} - ${log.message} ${new Date(Date.now()).toUTCString()}`
  ),
});

/**
 * @param {Client} client
 * @param {Interaction} deletedChannel
 */

module.exports = async (client, deletedChannel) => {
  const event = path.basename(__dirname);
  const log = await getEventLogger(deletedChannel.guild.id, event);

  if (log) {
    try {
      const channel = await getLogChannel(deletedChannel.guild.id);
      const logChannel = deletedChannel.guild.channels.cache.get(channel.channelId);

      let embed = new EmbedBuilder()
        .setAuthor({ name: `Channel Deleted`, iconURL: deletedChannel.guild.iconURL() })
        .setDescription(`**#${deletedChannel.name} was deleted**`)
        .setFooter({ text: `Channel ID: ${deletedChannel.id}` })
        .setTimestamp()
        .setColor("#7289DA");

      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      logger.log("error", `There was an error logging ${event} for ${deletedChannel.guild.id}: \n${error}`);
      console.log(error);
    }
  }

  return;
};
