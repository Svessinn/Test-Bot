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
 * @param {Interaction} createdInvite
 */

module.exports = async (client, createdInvite) => {
  const event = path.basename(__dirname);
  const log = await getEventLogger(createdInvite.guild.id, event);

  if (log) {
    try {
      const channel = await getLogChannel(createdInvite.guild.id);
      const logChannel = createdInvite.guild.channels.cache.get(channel.channelId);

      let embed = new EmbedBuilder()
        .setAuthor({ name: `Invite Created`, iconURL: createdInvite.guild.iconURL() })
        .setDescription(
          `**Created by <@${createdInvite.inviterId}>: \n\`https://discord.gg/${createdInvite.code}\` (to <#${createdInvite.channel.id}>)**`
        )
        .setFooter({ text: `Invite code: ${createdInvite.code}` })
        .setTimestamp()
        .setColor("#7289DA");

      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      logger.log("error", `There was an error logging ${event} for ${createdInvite.guild.id}: \n${error}`);
      console.log(error);
    }
  }

  return;
};
