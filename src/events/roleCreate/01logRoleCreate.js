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
 * @param {Interaction} createdRole
 */

module.exports = async (client, createdRole) => {
  const event = path.basename(__dirname);
  const log = await getEventLogger(createdRole.guild.id, event);

  if (log) {
    try {
      const channel = await getLogChannel(createdRole.guild.id);
      const logChannel = createdRole.guild.channels.cache.get(channel.channelId);

      let embed = new EmbedBuilder()
        .setAuthor({ name: `Role Created`, iconURL: createdRole.guild.iconURL() })
        .setDescription(`**\`${createdRole.name}\` (<@&${createdRole.id}>)**`)
        .setFooter({ text: `Role ID: ${createdRole.id}` })
        .setTimestamp()
        .setColor("#7289DA");

      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      logger.log("error", `There was an error logging ${event} for ${createdRole.guild.id}: \n${error}`);
      console.log(error);
    }
  }

  return;
};
