const path = require("path");
const {
  Client,
  Guild,
  GuildAuditLogsEntry,
  EmbedBuilder,
  ChannelFlagsBitField,
  PermissionOverwrites,
  PermissionFlagsBits,
  PermissionsBitField,
} = require("discord.js");
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

function compareObjects(oldObj, newObj) {
  let diffs = [];
  for (let i in oldObj) {
    if (oldObj[i] !== newObj[i]) {
      diffs.push(i);
    }
  }
  // Removing duplicates if there are any
  diffs = Array.from(new Set(diffs));
  return diffs;
}

function countOccurrences(string, substring) {
  const regex = new RegExp(substring, "g");
  const matches = string.match(regex);
  return matches ? matches.length : 0;
}

let diffs = [];

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
      let description = `**Executor:** <@${auditLogEntry.executorId}>` + `\n**${auditLogEntry.targetType}:** `;

      // Add the reason to the description if it exists
      if (auditLogEntry.reason) {
        description += `\n**Reason:** ${auditLogEntry.reason}`;
      }

      // Add the changes to the description if they exist
      if (auditLogEntry.changes) {
        if (auditLogEntry.targetType === "User") {
          description += `${Object.keys(auditLogEntry.target).length > 1 ? auditLogEntry.target : auditLogEntry.targetId}`;
          auditLogEntry.changes.forEach((change) => {
            switch (change.key) {
              case "$add":
                description += `\n**• Added Roles:** `;
                description += change.new.map((role) => `<@&${role.id}>`).join(", ");
                break;
              case "$remove":
                description += `\n**• Removed Roles:** `;
                description += change.new.map((role) => `<@&${role.id}>`).join(", ");
                break;
              case "deaf":
                description += change.new === true ? `\n**• Server Deafened**` : `\n**• Server Deafen Removed**`;
                break;
              case "mute":
                description += change.new === true ? `\n**• Server Muted**` : `\n**• Server Mute Removed**`;
                break;
              case "nick":
                if (change.new !== undefined) {
                  description += `\n**• Nickname Updated:** ${change?.old ? change.old + " **->** " : ""}${change.new}`;
                } else {
                  description += `\n**• Nickname Removed**`;
                }
                break;
              case "communication_disabled_until":
                if (change.old === undefined) {
                  description += `\n**• Timed Out Until:** <t:${Math.round(new Date(change.new).getTime() / 1000)}:R>`;
                } else if (change.new === undefined) {
                  description += `\n**• Time Out Removed**`;
                } else {
                  description += `\n**• Timed Out Updated:** <t:${Math.round(new Date(change.old).getTime() / 1000)}:R> **->** <t:${Math.round(new Date(change.new).getTime() / 1000)}:R>`;
                }
                break;
              default:
                // Just catching any other changes that may have been missed to add them later
                console.log(change);
                break;
            }
          });
        } else if (auditLogEntry.targetType === "Channel") {
          auditLogEntry.actionType === "Delete"
            ? (description += `#${auditLogEntry.target.name}`)
            : (description += `${Object.keys(auditLogEntry.target).length > 1 ? auditLogEntry.target : auditLogEntry.targetId}`);
          auditLogEntry.changes.forEach((change) => {
            switch (auditLogEntry.actionType) {
              case "Update":
                switch (change.key) {
                  case "name":
                    description += `\n**• Name Updated:** ${change.old} **->** ${change.new}`;
                    break;
                  case "topic":
                    description += `\n**• Topic Updated:** ${change.old ? change.old : "*None*"} **->** ${change.new ? change.new : "*None*"}`;
                    break;
                  case "bitrate":
                    description += `\n**• Bitrate Updated:** ${change.old / 1000}kbps **->** ${change.new / 1000}kbps`;
                    break;
                  case "user_limit":
                    description += `\n**• User Limit Updated:** ${change.old} **->** ${change.new}`;
                    break;
                  case "rate_limit_per_user":
                    description += `\n**• Slowmode Updated:** ${change.old} **->** ${change.new}`;
                    break;
                  case "nsfw":
                    description += change.new === true ? `\n**• NSFW Enabled**` : `\n**• NSFW Disabled**`;
                    break;
                  case "permission_overwrites":
                    description += `\n**• Permission Overwrites Updated:** ${change.old} **->** ${change.new}`;
                    break;
                  case "type":
                    description += change.new === "text" ? `\n**• Type Updated:** Voice **->** Text` : `\n**• Type Updated:** Text **->** Voice`;
                    break;
                  case "allow":
                    let newAllows = "";
                    const oldAllow = new PermissionsBitField(String(change.old)).serialize();
                    const newAllow = new PermissionsBitField(String(change.new)).serialize();
                    diffs = compareObjects(oldAllow, newAllow);
                    diffs.forEach((diff) => {
                      if (newAllow[diff]) {
                        newAllows += `${diff}, `;
                      }
                    });
                    description += newAllows.length ? `\n**• Permissions Allowed:** ${newAllows.slice(0, -2)}` : "";
                    break;
                  case "deny":
                    let newDenies = "";
                    const oldDeny = new PermissionsBitField(String(change.old)).serialize();
                    const newDeny = new PermissionsBitField(String(change.new)).serialize();
                    diffs = compareObjects(oldDeny, newDeny);
                    diffs.forEach((diff) => {
                      if (newDeny[diff]) {
                        newDenies += `${diff}, `;
                      }
                    });
                    description += newDenies.length ? `\n**• Permissions Denied:** ${newDenies.slice(0, -2)}` : "";
                    break;
                  default:
                    break;
                }
                break;
              case "Create":
                switch (change.key) {
                  case "name":
                    description += `\n**• Name:** ${change.new}`;
                    break;
                }
                break;
              case "Delete":
                // No additional information needed for channel deletion
                break;
              default:
                // In case there are any other channel actions that need to be handled
                console.log("Channel " + auditLogEntry.actionType + " not handled");
                console.log(change);
                break;
            }
          });
        } else {
          console.log(auditLogEntry.changes);
          description += `\n${auditLogEntry.changes.map((change) => `**• ${change.key}:** ${change.old} **->** ${change.new}`).join("\n")}`;
        }
      }

      // Add any extra information to the description if it exists
      if (auditLogEntry.extra) {
        // console.log("Extra:");
        // console.log(auditLogEntry.extra);

        // Channel Permissions Overwrite Changes
        if (countOccurrences(description, "\n") > 1 && !auditLogEntry.extra.count) {
          description += `\n**Extra:** ${auditLogEntry.extra?.type ? `<@${auditLogEntry.extra.id}>` : auditLogEntry.extra}`;
        }
        // Bulk Deletion
        else if (auditLogEntry.extra.count) {
          description = `**Executor:** <@${auditLogEntry.executorId}>`;
          description += `\n**Bulk Delete:** ${auditLogEntry.extra.count} messages in <#${auditLogEntry.targetId}>`;
          embed.setAuthor({ name: `Bulk Delete`, iconURL: guild.iconURL() });
        }
        // More info needed to handle the extra information
        else {
          console.log(auditLogEntry);
          return;
        }
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
