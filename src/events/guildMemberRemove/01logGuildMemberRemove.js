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
 * @param {Interaction} removedMember
 */

module.exports = async (client, removedMember) => {
  const event = path.basename(__dirname);
  const log = await getEventLogger(removedMember.guild.id, event);

  if (log) {
    try {
      const channel = await getLogChannel(removedMember.guild.id);
      const logChannel = removedMember.guild.channels.cache.get(channel.channelId);

      let embed = new EmbedBuilder()
        .setAuthor({ name: `User Left`, iconURL: removedMember.guild.iconURL() })
        .setDescription(`**\`${removedMember.user.username}\` (<@${removedMember.user.id}>)**`)
        .setFooter({ text: `User ID: ${removedMember.user.id}` })
        .setThumbnail(`https://cdn.discordapp.com/avatars/${removedMember.user.id}/${removedMember.user.avatar}.webp?size=1024`)
        .setTimestamp()
        .setColor("#7289DA");

      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      logger.log("error", `There was an error logging ${event} for ${removedMember.guild.id}: \n${error}`);
      console.log(error);
    }
  }

  return;
};
