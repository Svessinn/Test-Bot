const path = require("path");
const { Client, Guild, GuildAuditLogsEntry, EmbedBuilder } = require("discord.js");
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
 * @param {Client} client - The Discord client instance
 * @param {GuildAuditLogsEntry} auditLogEntry - The audit log entry that was created
 * @param {Guild} guild - The guild where the audit log entry was created
 */
module.exports = async (client, auditLogEntry, guild) => {
  // Ignore audit log entries that target users
  if (auditLogEntry.targetType === "User") return;

  const event = path.basename(__dirname);
  const log = await getEventLogger(guild.id, event);

  if (log) {
    try {
      const channel = await getLogChannel(guild.id);
      const logChannel = guild.channels.cache.get(channel.channelId);

      // Create an embed message with the audit log entry details
      let embed = new EmbedBuilder()
        .setAuthor({ name: `${auditLogEntry.targetType} ${auditLogEntry.actionType}`, iconURL: guild.iconURL() })
        .setDescription(
          `**${auditLogEntry.targetType}:** ${Object.keys(auditLogEntry.target).length > 1 ? auditLogEntry.target : auditLogEntry.targetId}\n**Executor:** <@${auditLogEntry.executorId}>`
        )
        .setFooter({ text: `${auditLogEntry.targetType} ID: ${auditLogEntry.id}` })
        .setTimestamp()
        .setColor("#7289DA");

      // Send the embed message to the log channel
      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      // Log any errors that occur
      logger.log("error", `There was an error logging ${event} for ${guild.id}: \n${error}`);
      console.log(error);
    }
  }

  return;
};
