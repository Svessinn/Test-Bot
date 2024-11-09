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
 * @param {Interaction} newMember
 */

module.exports = async (client, newMember) => {
  const event = path.basename(__dirname);
  const log = await getEventLogger(newMember.guild.id, event);

  if (log) {
    try {
      const channel = await getLogChannel(newMember.guild.id);
      const logChannel = newMember.guild.channels.cache.get(channel.channelId);

      let embed = new EmbedBuilder()
        .setAuthor({ name: `New User Joined`, iconURL: newMember.guild.iconURL() })
        .setDescription(`**\`${newMember.user.username}\` (<@${newMember.user.id}>)**`)
        .setFooter({ text: `User ID: ${newMember.user.id}` })
        .setThumbnail(`https://cdn.discordapp.com/avatars/${newMember.user.id}/${newMember.user.avatar}.webp?size=1024`)
        .setTimestamp()
        .setColor("#7289DA");

      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      logger.log("error", `There was an error logging ${event} for ${newMember.guild.id}: \n${error}`);
      console.log(error);
    }
  }

  return;
};
