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
 * Handles the creation of a guild audit log entry.
 *
 * @param {Client} client - The Discord client instance.
 * @param {GuildAuditLogsEntry} auditLogEntry - The audit log entry that was created.
 * @param {Guild} guild - The guild where the audit log entry was created.
 * @returns {Promise<void>}
 *
 * @async
 * @function
 *
 * @description
 * This function is triggered when a new audit log entry is created in a guild. It retrieves the event logger configuration
 * and log channel for the guild, constructs an embed message with details of the audit log entry, and sends it to the log channel.
 * If any errors occur during this process, they are logged using the winston logger.
 */
module.exports = async (client, auditLogEntry, guild) => {
  // Get the event name from the directory name
  const event = path.basename(__dirname);
  // Get the event logger configuration for the guild
  const log = await getEventLogger(guild.id, event);

  if (log) {
    try {
      // Get the log channel for the guild
      const channel = await getLogChannel(guild.id);
      const logChannel = guild.channels.cache.get(channel.channelId);

      // Create an embed message to log the audit log entry
      let embed = new EmbedBuilder()
        .setAuthor({ name: `${auditLogEntry.targetType} ${auditLogEntry.actionType}`, iconURL: guild.iconURL() })
        .setFooter({ text: `${auditLogEntry.targetType} ID: ${auditLogEntry.targetId}` })
        .setTimestamp()
        .setColor("#7289DA");

      // Build the description for the embed message
      let description =
        `**${auditLogEntry.targetType}:** ` +
        `${Object.keys(auditLogEntry.target).length > 1 ? auditLogEntry.target : auditLogEntry.targetId}` +
        `\n**Executor:** <@${auditLogEntry.executorId}>`;

      // Add the reason to the description if it exists
      if (auditLogEntry.reason) {
        description += `\n**Reason:** ${auditLogEntry.reason}`;
      }

      // Add the changes to the description if they exist
      if (auditLogEntry.changes) {
        description += "\n**Changes:\n** ";
        if (auditLogEntry.targetType === "User") {
          if (auditLogEntry.changes) {
            auditLogEntry.changes.forEach((change) => {
              // Check if roles were added
              if (change.key === "$add") {
                description += `**• Added Roles:** `;
                change.new.forEach((role) => {
                  description += `<@&${role.id}>`;
                });
                // Check if roles were removed
              } else if (change.key === "$remove") {
                description += `**• Removed Roles:** `;
                change.new.forEach((role) => {
                  description += `<@&${role.id}>`;
                });
                // Check if the user was server deafened
              } else if (change.key === "deaf") {
                if (change.new === true) {
                  description += `**• Server Deafened**`;
                } else {
                  description += `**• Server Deafen Remove**`;
                }
                // Check if the user was server muted
              } else if (change.key === "mute") {
                if (change.new === true) {
                  description += `**• Server Muted**`;
                } else {
                  description += `**• Server Mute Removed**`;
                }
                // Check if the nickname was updated or removed
              } else if (change.key === "nick") {
                if (change.new !== undefined) {
                  description += `**• Nickname Updated:** ${change?.old ? change.old + " **=>** " : ""}${change.new}`;
                } else {
                  description += `**• Nickname Removed**`;
                }
                // Check if the user was timed out
              } else if (change.key === "communication_disabled_until") {
                if (change.old === undefined) {
                  description += `**• Timed Out Until:** <t:${Math.round(new Date(change.new).getTime() / 1000)}:R>`;
                } else if (change.new === undefined) {
                  description += `**• Time Out Removed**`;
                } else {
                  description += `**• Timed Out Updated:** <t:${Math.round(new Date(change.old).getTime() / 1000)}:R> **=>** <t:${Math.round(new Date(change.new).getTime() / 1000)}:R>`;
                }
              } else {
                // Just catching any other changes that may have been missed to add them later
                console.log(change);
              }
            });
          }
        } else {
          description += `${auditLogEntry.changes.map((change) => `**• ${change.key}:** ${change.old} **=>** ${change.new}`).join("\n")}`;
        }
      }

      // Add any extra information to the description if it exists
      if (auditLogEntry.extra) {
        description += `\n**Extra:** ${auditLogEntry.extra}`;
      }

      // Set the description of the embed message
      embed.setDescription(description);

      // Send the embed message to the log channel
      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      // Log any errors that occur
      logger.log(
        "error",
        `There was an error logging ${event} - ${auditLogEntry.targetType} ${auditLogEntry.actionType} for ${guild.id}: \n${error}`
      );
      console.log(error);
    }
  }

  return;
};
