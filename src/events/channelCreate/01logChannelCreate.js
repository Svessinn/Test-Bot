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
 * @param {Interaction} createdChannel
 */

module.exports = async (client, createdChannel) => {
  const event = path.basename(__dirname);
  const log = await getEventLogger(createdChannel.guild.id, event);

  if (log) {
    try {
      const channel = await getLogChannel(createdChannel.guild.id);
      const logChannel = createdChannel.guild.channels.cache.get(channel.channelId);

      let embed = new EmbedBuilder()
        .setAuthor({ name: createdChannel.guild.name, iconURL: createdChannel.guild.iconURL() })
        .setDescription(`**Channel Created: #${createdChannel.name} (<#${createdChannel.id}>)**`)
        .setFooter({ text: `Channel ID: ${createdChannel.id}` })
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      logger.log("error", `There was an error logging ${event} for ${createdChannel.guild.id}: \n${error}`);
      console.log(error);
    }
  }

  return;
};
