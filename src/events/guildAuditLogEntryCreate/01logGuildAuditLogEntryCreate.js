const path = require("path");
const { Client, EmbedBuilder, Guild, GuildAuditLogsEntry, PermissionsBitField } = require("discord.js");
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
 *
 * @param {Object} oldObj
 * @param {Object} newObj
 * @returns {Array}
 */
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

/**
 *
 * @param {String} string
 * @param {String} substring
 * @returns {Number}
 */
function countOccurrences(string, substring) {
  const regex = new RegExp(substring, "g");
  const matches = string.match(regex);
  return matches ? matches.length : 0;
}

/**
 *
 * @param {Number} number
 * @returns {String}
 */
function numberToChannelType(number) {
  let channelType;
  switch (number) {
    case 0:
      channelType = "Text";
      break;
    case 1:
      channelType = "DM";
      break;
    case 2:
      channelType = "Voice";
      break;
    case 3:
      channelType = "Group DM";
      break;
    case 4:
      channelType = "Category";
      break;
    case 5:
      channelType = "Announcement";
      break;
    case 10:
      channelType = "Announcement Thread";
      break;
    case 11:
      channelType = "Public Thread";
      break;
    case 12:
      channelType = "Private Thread";
      break;
    case 13:
      channelType = "Stage";
      break;
    case 14:
      channelType = "Directory";
      break;
    case 15:
      channelType = "Forum";
      break;
    case 16:
      channelType = "Media";
      break;
    default:
      channelType = `${change.new}`;
      break;
  }
  return channelType;
}

/**
 *
 * @param {Number} number
 * @returns {String}
 */
function numberToWebhookType(number) {
  let webhookType;
  switch (number) {
    case 1:
      webhookType = "Incoming";
      break;
    case 2:
      webhookType = "Channel Follower";
      break;
    case 3:
      webhookType = "Application";
      break;
    default:
      webhookType = `${number}`;
      break;
  }
  return webhookType;
}

let diffs = [],
  allowDiffs = [],
  denyDiffs = [],
  out = "",
  oldAllow,
  newAllow,
  oldDeny,
  newDeny,
  nullDiffs;

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

  if (!log) return;
  try {
    // Get the log channel for the guild
    const channel = await getLogChannel(guild.id);
    const logChannel = guild.channels.cache.get(channel.channelId);

    // Create an embed message to log the audit log entry
    let embed = new EmbedBuilder()
      .setFooter({ text: `${auditLogEntry.targetType} ID: ${auditLogEntry.targetId}` })
      .setTimestamp()
      .setColor("#7289DA");

    // Build the description for the embed message
    let description = `**Executor:** ${auditLogEntry.executor ? auditLogEntry.executor : `<@${auditLogEntry.executorId}>`}`;

    // This is here to indicate the type of action that was taken in the audit log entry
    // Not needed unless you are working on things and need to know what action was taken
    console.log(`${auditLogEntry.targetType} ${auditLogEntry.actionType}: ${auditLogEntry.action}`);

    switch (auditLogEntry.action) {
      case 1: // Guild Update
        auditLogEntry.changes.forEach((change) => {
          switch (change.key) {
            case "name":
              description += `\n**⦁ Name:** ${change.old} **➜** ${change.new}`;
              break;
            case "icon":
              description += `\n**⦁ Icon:** ${change.new ? "Changed" : "Removed"}`;
              break;
            case "splash":
              description += `\n**⦁ Splash:** ${change.new ? "Changed" : "Removed"}`;
              break;
            case "discovery_splash":
              description += `\n**⦁ Discovery Splash:** ${change.new ? "Changed" : "Removed"}`;
              break;
            case "banner":
              description += `\n**⦁ Banner:** ${change.new ? "Changed" : "Removed"}`;
              break;
            case "description":
              description += `\n**⦁ Description:** ${change.old ? change.old : "*None*"} **➜** ${change.new ? change.new : "*None*"}`;
              break;
            case "region":
              description += `\n**⦁ Region:** ${change.old} **➜** ${change.new}`;
              break;
            case "preferred_locale":
              description += `\n**⦁ Preferred Locale:** ${change.old} **➜** ${change.new}`;
              break;
            case "verification_level":
              description += `\n**⦁ Verification Level:** ${change.old} **➜** ${change.new}`;
              break;
            case "explicit_content_filter":
              description += `\n**⦁ Explicit Content Filter:** ${change.old} **➜** ${change.new}`;
              break;
            case "default_message_notifications":
              description += `\n**⦁ Default Message Notifications:** ${change.old} **➜** ${change.new}`;
              break;
            case "system_channel_id":
              description += `\n**⦁ System Channel:** ${change.old ? `<#${change.old}>` : "*None*"} **➜** ${change.new ? `<#${change.new}>` : "*None*"}`;
              break;
            case "rules_channel_id":
              description += `\n**⦁ Rules Channel:** ${change.old ? `<#${change.old}>` : "*None*"} **➜** ${change.new ? `<#${change.new}>` : "*None*"}`;
              break;
            case "public_updates_channel_id":
              description += `\n**⦁ Public Updates Channel:** ${change.old ? `<#${change.old}>` : "*None*"} **➜** ${change.new ? `<#${change.new}>` : "*None*"}`;
              break;
            case "afk_channel_id":
              description += `\n**⦁ AFK Channel:** ${change.old ? `<#${change.old}>` : "*None*"} **➜** ${change.new ? `<#${change.new}>` : "*None*"}`;
              break;
            case "afk_timeout":
              description += `\n**⦁ AFK Timeout:** ${change.old / 60} Minutes **➜** ${change.new / 60} Minutes`;
              break;
            case "icon_hash":
              description += `\n**⦁ Icon Hash:** ${change.old} **➜** ${change.new}`;
              break;
            case "owner_id":
              description += `\n**⦁ Owner:** <@${change.old}> **➜** <@${change.new}>`;
              break;
            case "system_channel_flags":
              description += `\n**⦁ System Channel Flags:** ${change.old} **➜** ${change.new}`;
              break;
            case "vanity_url_code":
              description += `\n**⦁ Vanity URL:** ${change.old ? `discord.gg/${change.old}` : "*None*"} **➜** ${change.new ? `discord.gg/${change.new}` : "*None*"}`;
              break;
            case "premium_tier":
              description += `\n**⦁ Premium Tier:** ${change.old} **➜** ${change.new}`;
              break;
            case "premium_subscription_count":
              description += `\n**⦁ Premium Subscriptions:** ${change.old} **➜** ${change.new}`;
              break;
            case "premium_progress_bar_enabled":
              description += `\n**⦁ Premium Progress Bar:** ${change.new ? "Enabled" : "Disabled"}`;
              break;
            case "preferred_guild_language":
              description += `\n**⦁ Preferred Guild Language:** ${change.old} **➜** ${change.new}`;
              break;
            case "max_video_channel_users":
              description += `\n**⦁ Max Video Channel Users:** ${change.old} **➜** ${change.new}`;
              break;
            case "max_presences":
              description += `\n**⦁ Max Presences:** ${change.old} **➜** ${change.new}`;
              break;
            case "max_members":
              description += `\n**⦁ Max Members:** ${change.old} **➜** ${change.new}`;
              break;
            case "max_description_length":
              description += `\n**⦁ Max Description Length:** ${change.old} **➜** ${change.new}`;
              break;
            case "max_voice_channel_users":
              description += `\n**⦁ Max Voice Channel Users:** ${change.old} **➜** ${change.new}`;
              break;
            case "max_stream_video_duration":
              description += `\n**⦁ Max Stream Video Duration:** ${change.old} **➜** ${change.new}`;
              break;
            case "discovery_splash_hash":
              description += `\n**⦁ Discovery Splash Hash:** ${change.old} **➜** ${change.new}`;
              break;
            case "approximate_member_count":
              description += `\n**⦁ Approximate Member Count:** ${change.old} **➜** ${change.new}`;
              break;
            case "approximate_presence_count":
              description += `\n**⦁ Approximate Presence Count:** ${change.old} **➜** ${change.new}`;
              break;
            default:
              logger.log("warn", `Guild Update ${change.key} not handled`);
              console.log(change);
              break;
          }
        });
        embed.setAuthor({ name: `Guild Updated`, iconURL: guild.iconURL() });
        break;
      case 10: // Channel Create
        description +=
          `\n**Channel:** ${auditLogEntry.target}` +
          `\n**⦁ Name:** ${auditLogEntry.target.name}` +
          `\n**⦁ Type:** ${numberToChannelType(auditLogEntry.target.type)} Channel`;
        auditLogEntry.changes.forEach((change) => {
          switch (change.key) {
            case "permission_overwrites":
              description += `\n**Permission Overwrites:** `;
              change.new.forEach((overwrite) => {
                description += `\n**⦁** ${!overwrite.type ? `<@&${overwrite.id}>` : `<@${overwrite.id}>`}`;
                let allowedPermissions = new PermissionsBitField(String(overwrite.allow)).serialize();
                let allowedPermissionsArray = [];
                for (let i in allowedPermissions) {
                  if (allowedPermissions[i]) {
                    allowedPermissionsArray.push(i);
                  }
                }
                let deniedPermissions = new PermissionsBitField(String(overwrite.deny)).serialize();
                let deniedPermissionsArray = [];
                for (let i in deniedPermissions) {
                  if (deniedPermissions[i]) {
                    deniedPermissionsArray.push(i);
                  }
                }
                description += allowedPermissionsArray.length ? `\n**⚬ Allow:** ${allowedPermissionsArray.join(", ")}` : "";
                description += deniedPermissionsArray.length ? `\n**⚬ Deny:** ${deniedPermissionsArray.join(", ")}` : "";
              });
              break;
          }
        });
        embed.setAuthor({ name: `Channel Created`, iconURL: guild.iconURL() });
        break;
      case 11: // Channel Update
        description += `\n**Channel:** ${auditLogEntry.target}`;
        auditLogEntry.changes.forEach((change) => {
          switch (change.key) {
            case "name":
              description += `\n**⦁ Name:** ${change.old} **➜** ${change.new}`;
              break;
            case "topic":
              description += `\n**⦁ Topic:** ${change.old ? change.old : "*None*"} **➜** ${change.new ? change.new : "*None*"}`;
              break;
            case "bitrate":
              description += `\n**⦁ Bitrate:** ${change.old / 1000}kbps **➜** ${change.new / 1000}kbps`;
              break;
            case "user_limit":
              description += `\n**⦁ User Limit:** ${change.old} **➜** ${change.new}`;
              break;
            case "rate_limit_per_user":
              description += `\n**⦁ Slowmode:** ${change.old} **➜** ${change.new}`;
              break;
            case "nsfw":
              description += `\n**⦁ NSFW:** ` + change.new ? `Enabled` : `Disabled`;
              break;
            default:
              logger.log("warn", `Channel Update ${change.key} not handled`);
              console.log(change);
              break;
          }
        });
        embed.setAuthor({ name: `Channel Updated`, iconURL: guild.iconURL() });
        break;
      case 12: // Channel Delete
        description += "\n**Channel: **" + `#${auditLogEntry.target.name}`;
        embed.setAuthor({ name: `Channel Deleted`, iconURL: guild.iconURL() });
        break;
      case 13: // Channel Permission Overwrite Create
        description += `\n**Channel:** ${auditLogEntry.target}`;
        out = "";
        auditLogEntry.changes.forEach((change) => {
          switch (change.key) {
            case "id":
              out += `${change.new}>`;
              break;
            case "type":
              out = (!change.new ? `\n**⦁ Role:** <@&` : `\n**⦁ User:** <@`) + out;
              break;
            case "allow":
              let newAllows = "";
              const newAllow = new PermissionsBitField(String(change.new)).serialize();
              for (let overwrite in newAllow) {
                if (newAllow[overwrite]) {
                  newAllows += `${overwrite}, `;
                }
              }
              out += newAllows.length ? `\n**⦁ Allowed:** ${newAllows.slice(0, -2)}` : "";
              break;
            case "deny":
              let newDenies = "";
              const newDeny = new PermissionsBitField(String(change.new)).serialize();
              for (let overwrite in newDeny) {
                if (newDeny[overwrite]) {
                  newDenies += `${overwrite}, `;
                }
              }
              out += newDenies.length ? `\n**⦁ Denied:** ${newDenies.slice(0, -2)}` : "";
              break;
            default:
              logger.log("warn", `Channel Permission Overwrite Create ${change.key} not handled`);
              console.log(change);
              break;
          }
        });
        description += out;
        embed.setAuthor({ name: `Channel Permission Overwrite Created`, iconURL: guild.iconURL() });
        break;
      case 14: // Channel Permission Overwrite Update
        description +=
          `\n**Channel:** ${auditLogEntry.target}` +
          (!Number(auditLogEntry.extra.type) ? `\n**⦁ Role:** <@&` : `\n**⦁ User:** <@`) +
          `${auditLogEntry.extra.id}>`;
        out = "";
        auditLogEntry.changes.forEach((change) => {
          diffs = [];
          switch (change.key) {
            case "allow":
              oldAllow = new PermissionsBitField(String(change.old)).serialize();
              newAllow = new PermissionsBitField(String(change.new)).serialize();
              allowDiffs = compareObjects(oldAllow, newAllow);
              allowDiffs.forEach((diff) => {
                if (newAllow[diff]) {
                  diffs.push(diff);
                }
              });
              out += diffs.length ? `\n**⦁ Allowed:** ${diffs.join(", ")}` : "";
              break;
            case "deny":
              oldDeny = new PermissionsBitField(String(change.old)).serialize();
              newDeny = new PermissionsBitField(String(change.new)).serialize();

              denyDiffs = compareObjects(oldDeny, newDeny);
              denyDiffs.forEach((diff) => {
                if (newDeny[diff]) {
                  diffs.push(diff);
                }
              });
              out += diffs.length ? `\n**⦁ Denied:** ${diffs.join(", ")}` : "";
              break;
            default:
              logger.log("warn", `Channel Permission Overwrite Updated ${change.key} not handled`);
              console.log(change);
              break;
          }
        });
        if (out.length === 0) {
          nullDiffs = Array.from(new Set(allowDiffs.concat(denyDiffs)));
          out = nullDiffs.length ? `\n**⦁ Default:** ${nullDiffs.join(", ")}` : "";
        }
        description += out;
        embed.setAuthor({ name: `Channel Permission Overwrite Updated`, iconURL: guild.iconURL() });
        break;
      case 15: // Channel Permission Overwrite Delete
        description += `\n**Channel:** ${auditLogEntry.target}`;
        out = "";
        auditLogEntry.changes.forEach((change) => {
          switch (change.key) {
            case "id":
              out += `${change.old}>`;
              break;
            case "type":
              out = (!change.old ? `\n**⦁ Role:** <@&` : `\n**⦁ User:** <@`) + out;
              break;
            case "allow":
              let newAllows = "";
              const newAllow = new PermissionsBitField(String(change.old)).serialize();
              for (let overwrite in newAllow) {
                if (newAllow[overwrite]) {
                  newAllows += `${overwrite}, `;
                }
              }
              out += newAllows.length ? `\n**⦁ Previously Allowed:** ${newAllows.slice(0, -2)}` : "";
              break;
            case "deny":
              let newDenies = "";
              const newDeny = new PermissionsBitField(String(change.old)).serialize();
              for (let overwrite in newDeny) {
                if (newDeny[overwrite]) {
                  newDenies += `${overwrite}, `;
                }
              }
              out += newDenies.length ? `\n**⦁ Previously Denied:** ${newDenies.slice(0, -2)}` : "";
              break;
            default:
              logger.log("warn", `Channel Permission Overwrite Deleted ${change.key} not handled`);
              console.log(change);
              break;
          }
        });
        description += out;
        embed.setAuthor({ name: `Channel Permission Overwrite Deleted`, iconURL: guild.iconURL() });
        break;
      case 20: // Kick
        description += `\n**User:** ` + ` <@${auditLogEntry.targetId}>`;
        description += auditLogEntry.reason ? `\n**⦁ Reason:** ${auditLogEntry.reason}` : "";
        embed.setAuthor({ name: `User Kicked`, iconURL: guild.iconURL() });
        break;
      case 21: // Prune
        description += `\n**⦁ ${auditLogEntry.extra.removed > 1 ? `${auditLogEntry.extra.removed} Users` : "1 User"} Pruned**`;
        embed.setAuthor({ name: `Users Pruned`, iconURL: guild.iconURL() });
        break;
      case 22: // Ban
        description += `\n**User:** ` + `${auditLogEntry.target.username} (${auditLogEntry.target})`;
        description += auditLogEntry.reason ? `\n**⦁ Reason:** ${auditLogEntry.reason}` : "";
        embed.setAuthor({ name: `User Banned`, iconURL: guild.iconURL() });
        break;
      case 23: // Unban
        description += `\n**User:** ` + `${auditLogEntry.target.username} (${auditLogEntry.target})`;
        description += auditLogEntry.reason ? `\n**⦁ Reason:** ${auditLogEntry.reason}` : "";
        embed.setAuthor({ name: `User Unbanned`, iconURL: guild.iconURL() });
        break;
      case 24: // Member Update
        description += `\n**Member:** ${auditLogEntry.target}`;
        auditLogEntry.changes.forEach((change) => {
          switch (change.key) {
            case "nick":
              description += `\n**⦁ Nickname`;
              description += change.new ? `:** ${change.old ? change.old : "*None*"} **➜** ${change.new}` : ` Removed**`;
              break;
            case "deaf":
              description += change.new ? `\n**⦁ Server Deafened**` : `\n**⦁ Server Deafen Removed**`;
              break;
            case "mute":
              description += change.new ? `\n**⦁ Server Muted**` : `\n**⦁ Server Mute Removed**`;
              break;
            case "communication_disabled_until":
              description += !change.old
                ? `\n**⦁ Timed Out Until:** <t:${Math.round(new Date(change.new).getTime() / 1000)}:f>`
                : `\n**⦁ Time Out Removed**`;
              break;
            default:
              logger.log("warn", `Member Update ${change.key} not handled`);
              console.log(change);
              break;
          }
        });
        embed.setAuthor({ name: `Member Updated`, iconURL: guild.iconURL() });
        break;
      case 25: // Member Role Update
        description += `\n**Member:** ${auditLogEntry.target}`;
        auditLogEntry.changes.forEach((change) => {
          switch (change.key) {
            case "$add":
              description += `\n**⦁ Added Roles:** `;
              description += change.new.map((role) => `<@&${role.id}>`).join(", ");
              break;
            case "$remove":
              description += `\n**⦁ Removed Roles:** `;
              description += change.new.map((role) => `<@&${role.id}>`).join(", ");
              break;
            default:
              logger.log("warn", `Member Role Update ${change.key} not handled`);
              console.log(change);
              break;
          }
        });
        embed.setAuthor({ name: `Member Role Updated`, iconURL: guild.iconURL() });
        break;
      case 26: // Member Move
        // Target is not given for this event
        // description += `\n**Member:** ${auditLogEntry.target}`;
        description += `\n**⦁ To:** ${auditLogEntry.extra.channel}`;
        embed.setAuthor({ name: `Member Moved`, iconURL: guild.iconURL() });
        // console.log(auditLogEntry);
        break;
      case 27: // Member Disconnect
        // There is legit no additional info given in the audit log entry for this event
        embed.setAuthor({ name: `Member Disconnected`, iconURL: guild.iconURL() });
        // console.log(auditLogEntry);
        break;
      case 28: // Bot Add
        description += `\n**Bot:** ${auditLogEntry.target}`;
        embed.setAuthor({ name: `Bot Added`, iconURL: guild.iconURL() });
        // console.log(auditLogEntry);
        break;
      case 30: // Role Create
        description += `\n**Role:** ${auditLogEntry.target}`;
        description += `\n**⦁ Name:** ${auditLogEntry.target.name}`;
        description +=
          `\n**⦁ Colour:** ` +
          (auditLogEntry.target.color !== 0 ? `#${auditLogEntry.target.color.toString(16).padStart(6, "0")}` : `None`);
        description += auditLogEntry.target.hoist ? `\n**⦁ Hoisted**` : `\n**⦁ Not Hoisted**`;
        description += auditLogEntry.target.mentionable ? `\n**⦁ Mentionable**` : `\n**⦁ Not Mentionable**`;
        embed.setAuthor({ name: `Role Created`, iconURL: guild.iconURL() });
        break;
      case 31: // Role Update
        description += `\n**Role:** ${auditLogEntry.target}`;
        auditLogEntry.changes.forEach((change) => {
          switch (change.key) {
            case "name":
              description += `\n**⦁ Name:** ${change.old} **➜** ${change.new}`;
              break;
            case "color":
              description +=
                `\n**⦁ Colour:** ` +
                (change.old !== 0 ? `#${change.old.toString(16).padStart(6, "0")}` : `None`) +
                ` **➜** ` +
                (change.new !== 0 ? `#${change.new.toString(16).padStart(6, "0")}` : `None`);
              break;
            case "hoist":
              description += change.new ? `\n**⦁ Hoisted**` : `\n**⦁ Not Hoisted**`;
              break;
            case "mentionable":
              description += change.new ? `\n**⦁ Mentionable**` : `\n**⦁ Not Mentionable**`;
              break;
            case "permissions":
              const oldPermissions = new PermissionsBitField(String(change.old)).serialize();
              const newPermissions = new PermissionsBitField(String(change.new)).serialize();
              let newAllows = [];
              let newDenies = [];
              compareObjects(oldPermissions, newPermissions).forEach((permission) => {
                if (newPermissions[permission] && !oldPermissions[permission]) {
                  newAllows.push(permission);
                } else if (!newPermissions[permission] && oldPermissions[permission]) {
                  newDenies.push(permission);
                }
              });
              description += newAllows.length ? `\n**⦁ Permissions Allowed:** ${newAllows.join(", ")}` : "";
              description += newDenies.length ? `\n**⦁ Permissions Denied:** ${newDenies.join(", ")}` : "";
              break;
            default:
              logger.log("warn", `Role Update ${change.key} not handled`);
              console.log(change);
              break;
          }
        });
        embed.setAuthor({ name: `Role Updated`, iconURL: guild.iconURL() });
        break;
      case 32: // Role Delete
        const roleNameIndex = auditLogEntry.changes.findIndex((i) => i.key === "name");
        description += `\n**Role:** ${auditLogEntry.changes[roleNameIndex].old}`;
        embed.setAuthor({ name: `Role Deleted`, iconURL: guild.iconURL() });
        break;
      case 40: // Invite Create
        description += `\n**⦁ Invite Created:** https://discord.gg/${auditLogEntry.target.code}`;
        description += `\n**⦁ Inviter:** <@${auditLogEntry.target.inviterId}>`;
        auditLogEntry.reason ? (description += `\n**⦁ Reason:** ${auditLogEntry.reason}`) : "";
        auditLogEntry.target.maxUses > 0 ? (description += `\n**⦁ Max uses:** ${auditLogEntry.target.maxUses}`) : "";
        auditLogEntry._expiresTimestamp
          ? (description += `\n**⦁ Expires:** <t:${Math.round(auditLogEntry._expiresTimestamp / 1000)}:R>`)
          : "";
        embed.setAuthor({ name: `Invite Created`, iconURL: guild.iconURL() });
        break;
      case 41: // Invite Update
        // This has never triggered for me so I don't know what it actually does
        description += `\n**⦁ Invite Updated:** https://discord.gg/${auditLogEntry.target.code}`;
        description += `\n**⦁ Inviter:** <@${auditLogEntry.target.inviterId}>`;
        auditLogEntry.reason ? (description += `\n**⦁ Reason:** ${auditLogEntry.reason}`) : "";
        auditLogEntry.target.maxUses > 0 ? (description += `\n**⦁ Max uses:** ${auditLogEntry.target.maxUses}`) : "";
        auditLogEntry._expiresTimestamp
          ? (description += `\n**⦁ Expires:** <t:${Math.round(auditLogEntry._expiresTimestamp / 1000)}:R>`)
          : "";
        embed.setAuthor({ name: `Invite Updated`, iconURL: guild.iconURL() });
        console.log(auditLogEntry);
        break;
      case 42: // Invite Delete
        description += `\n**⦁ Invite Deleted:** https://discord.gg/${auditLogEntry.target.code}`;
        description += `\n**⦁ Inviter:** <@${auditLogEntry.target.inviterId}>`;
        auditLogEntry.reason ? (description += `\n**⦁ Reason:** ${auditLogEntry.reason}`) : "";
        auditLogEntry.target.uses > 0 ? (description += `\n**⦁ Used:** ${auditLogEntry.target.uses} times`) : "";
        embed.setAuthor({ name: `Invite Deleted`, iconURL: guild.iconURL() });
        break;
      case 50: // Webhook Create
        description += `\n**Webhook:** ${auditLogEntry.target.name}`;
        description += `\n**⦁ Channel:** <#${auditLogEntry.target.channelId}>`;
        description += `\n**⦁ Type:** ${numberToWebhookType(auditLogEntry.target.type)}`;
        embed.setAuthor({ name: `Webhook Created`, iconURL: guild.iconURL() });
        break;
      case 51: // Webhook Update
        description += `\n**Webhook:** ${auditLogEntry.target?.name || auditLogEntry.targetId}`;
        auditLogEntry.changes.forEach((change) => {
          switch (change.key) {
            case "name":
              description += `\n**⦁ Name:** ${change.old} **➜** ${change.new}`;
              break;
            case "channel_id":
              description += `\n**⦁ Channel:** <#${change.old}> **➜** <#${change.new}>`;
              break;
            case "avatar_hash":
              description += `\n**⦁ Avatar ${change.new ? `Changed` : `Removed`}**`;
            default:
              logger.log("warn", `Webhook Update ${change.key} not handled`);
              console.log(change);
              break;
          }
        });
        embed.setAuthor({ name: `Webhook Updated`, iconURL: guild.iconURL() });
        break;
      case 52: // Webhook Delete
        description += `\n**Webhook:** ${auditLogEntry.target.name}`;
        embed.setAuthor({ name: `Webhook Deleted`, iconURL: guild.iconURL() });
        break;
      case 60: // Emoji Create
        description +=
          `\n**Emoji:** <${auditLogEntry.target.animated ? "a" : ""}:` +
          `${auditLogEntry.target.name}:${auditLogEntry.target.id}>`;
        description += `\n**⦁ Name:** ${auditLogEntry.target.name}`;
        description += auditLogEntry.target.animated ? `\n**⦁ Animated**` : "";
        embed.setAuthor({ name: `Emoji Created`, iconURL: guild.iconURL() });
        break;
      case 61: // Emoji Update
        description += `\n**Emoji:** <${auditLogEntry.target.animated ? "a" : ""}:${auditLogEntry.target.name}:${auditLogEntry.target.id}>`;
        auditLogEntry.changes.forEach((change) => {
          switch (change.key) {
            case "name":
              description += `\n**⦁ Name:** ${change.old} **➜** ${change.new}`;
              break;
            default:
              logger.log("warn", `Emoji Update ${change.key} not handled`);
              console.log(change);
              break;
          }
        });
        embed.setAuthor({ name: `Emoji Updated`, iconURL: guild.iconURL() });
        break;
      case 62: // Emoji Delete
        description += `\n**Emoji:** ${auditLogEntry.changes[0].old}`;
        embed.setAuthor({ name: `Emoji Deleted`, iconURL: guild.iconURL() });
        break;
      case 72: // Message Delete
        let target = await auditLogEntry.extra.channel.guild.members.fetch(auditLogEntry.targetId);
        if (target.user.bot) return;

        description += `\n**Sender:** <@${auditLogEntry.targetId}>`;
        description += `\n**Channel:** <#${auditLogEntry.extra.channel.id}>`;
        embed
          .setAuthor({ name: `Message Deleted`, iconURL: guild.iconURL() })
          .setFooter({ text: `User ID: ${auditLogEntry.targetId}` });
        break;
      case 73: // Message Bulk Delete
        description += `\n**⦁ ${auditLogEntry.extra.count} messages deleted in <#${auditLogEntry.targetId}>**`;
        embed
          .setAuthor({ name: `Message Bulk Delete`, iconURL: guild.iconURL() })
          .setFooter({ text: `Channel ID: ${auditLogEntry.targetId}` });
        break;
      case 74: // Message Pin
        description += `\n**Sender:** <@${auditLogEntry.targetId}>`;
        description += `\n**Channel:** <#${auditLogEntry.extra.channel.id}>`;
        description +=
          `\n**Message:** https://discord.com/channels/` +
          `${guild.id}/` +
          `${auditLogEntry.extra.channel.id}/` +
          `${auditLogEntry.extra.messageId}`;
        embed.setAuthor({ name: `Message Pinned`, iconURL: guild.iconURL() });
        break;
      case 75: // Message Unpin
        description += `\n**Sender:** <@${auditLogEntry.targetId}>`;
        description += `\n**Channel:** <#${auditLogEntry.extra.channel.id}>`;
        description +=
          `\n**Message:** https://discord.com/channels/` +
          `${guild.id}/` +
          `${auditLogEntry.extra.channel.id}/` +
          `${auditLogEntry.extra.messageId}`;
        embed.setAuthor({ name: `Message Unpinned`, iconURL: guild.iconURL() });
        break;
      case 80: // Integration Create
        description += `\n**Integration:** ${auditLogEntry.target.name}`;
        description += `\n**⦁ Type:** ${auditLogEntry.target.type}`;
        embed.setAuthor({ name: `Integration Created`, iconURL: guild.iconURL() });
        break;
      case 81: // Integration Update
        // I have no idea when this triggers
        description += `\n**Integration:** ${auditLogEntry.target.name}`;
        auditLogEntry.changes.forEach((change) => {
          switch (change.key) {
            case "expire_behavior":
              description += `\n**⦁ Expire Behaviour:** ${change.old} **➜** ${change.new}`;
              break;
            case "expire_grace_period":
              description += `\n**⦁ Expire Grace Period:** ${change.old} **➜** ${change.new}`;
              break;
            case "enable_emoticons":
              description += change.new ? `\n**⦁ Emoticons Enabled**` : `\n**⦁ Emoticons Disabled**`;
              break;
            default:
              logger.log("warn", `Integration Update ${change.key} not handled`);
              console.log(change);
              break;
          }
        });
        embed.setAuthor({ name: `Integration Updated`, iconURL: guild.iconURL() });
        console.log(auditLogEntry);
        break;
      case 82: // Integration Delete
        description += `\n**Integration:** ${auditLogEntry.target.name}`;
        embed.setAuthor({ name: `Integration Deleted`, iconURL: guild.iconURL() });
        break;
      case 83: // Stage Instance Create
        description += `\n**Stage:** <#${auditLogEntry.extra.channel.id}>`;
        description += `\n**⦁ Topic:** ${auditLogEntry.target.topic}`;
        description += `\n**⦁ Privacy Level:** ${auditLogEntry.target.privacyLevel}`;
        description += auditLogEntry.target.discoverableDisabled ? "\n**⦁ Discoverable**" : "\n**⦁ Undiscoverable**";
        embed.setAuthor({ name: `Stage Instance Created`, iconURL: guild.iconURL() });
        console.log(auditLogEntry);
        break;
      case 84: // Stage Instance Update
        description += `\n**Stage:** <#${auditLogEntry.extra.channel.id}>`;
        auditLogEntry.changes.forEach((change) => {
          switch (change.key) {
            case "topic":
              description += `\n**⦁ Topic:** ${change.old} **➜** ${change.new}`;
              break;
            default:
              logger.log("warn", `Stage Instance Update ${change.key} not handled`);
              console.log(change);
              break;
          }
        });
        embed.setAuthor({ name: `Stage Instance Updated`, iconURL: guild.iconURL() });
        console.log(auditLogEntry);
        break;
      case 85: // Stage Instance Delete
        description += `\n**Stage:** <#${auditLogEntry.extra.channel.id}>`;
        description += `\n**⦁ Topic:** ${auditLogEntry.target.topic}`;
        embed.setAuthor({ name: `Stage Instance Deleted`, iconURL: guild.iconURL() });
        console.log(auditLogEntry);
        break;
      case 90: // Sticker Create
        description += `\n**Sticker:** ${auditLogEntry.target.name}`;
        description += `\n**⦁ Description:** ${auditLogEntry.target.description || "*None*"}`;
        description += `\n**⦁ Tags:** ${auditLogEntry.target.tags}`;
        embed.setAuthor({ name: `Sticker Created`, iconURL: guild.iconURL() });
        break;
      case 91: // Sticker Update
        description += `\n**Sticker:** ${auditLogEntry.target.name}`;
        auditLogEntry.changes.forEach((change) => {
          switch (change.key) {
            case "name":
              description += `\n**⦁ Name:** ${change.old} **➜** ${change.new}`;
              break;
            case "description":
              description += `\n**⦁ Description:** ${change.old || "*None*"} **➜** ${change.new || "*None*"}`;
              break;
            case "tags":
              description += `\n**⦁ Tags:** ${change.old} **➜** ${change.new}`;
              break;
            default:
              logger.log("warn", `Sticker Update ${change.key} not handled`);
              console.log(change);
              break;
          }
        });
        embed.setAuthor({ name: `Sticker Updated`, iconURL: guild.iconURL() });
        break;
      case 92: // Sticker Delete
        description += `\n**Sticker:** ${auditLogEntry.target.name}`;
        description += `\n**⦁ Description:** ${auditLogEntry.target.description || "*None*"}`;
        description += `\n**⦁ Tags:** ${auditLogEntry.target.tags}`;
        embed.setAuthor({ name: `Sticker Deleted`, iconURL: guild.iconURL() });
        break;
      case 100: // Event Create
        auditLogEntry.changes.forEach((change) => {
          switch (change.key) {
            case "name":
              description += `\n**⦁ Name:** ${change.new}`;
              break;
            case "description":
              description += `\n**⦁ Description:** ${change.new}`;
              break;
            case "location":
              description += `\n**⦁ Location:** ${change.new}`;
              break;
            default:
              // Don't care about the rest of the changes
              break;
          }
        });
        auditLogEntry.target.scheduledStartTimestamp
          ? (description += `\n**⦁ Starts:** <t:${Math.round(auditLogEntry.target.scheduledStartTimestamp / 1000)}:f>`)
          : "";
        auditLogEntry.target.scheduledEndTimestamp
          ? (description += `\n**⦁ Ends:** <t:${Math.round(auditLogEntry.target.scheduledEndTimestamp / 1000)}:f>`)
          : "";
        embed.setAuthor({ name: `Event Created`, iconURL: guild.iconURL() });
        break;
      case 101: // Event Update
        auditLogEntry.changes.forEach((change) => {
          switch (change.key) {
            case "name":
              description += `\n**⦁ Name:** ${change.old} **➜** ${change.new}`;
              break;
            case "description":
              description += `\n**⦁ Description:** ${change.old} **➜** ${change.new}`;
              break;
            case "location":
              description += `\n**⦁ Location:** ${change.old} **➜** ${change.new}`;
              break;
            default:
              // Don't care about the rest of the changes
              break;
          }
        });
        embed.setAuthor({ name: `Event Updated`, iconURL: guild.iconURL() });
        break;
      case 102: // Event Delete
        auditLogEntry.changes.forEach((change) => {
          switch (change.key) {
            case "name":
              description += `\n**⦁ Name:** ${change.old}`;
              break;
            case "description":
              description += `\n**⦁ Description:** ${change.old}`;
              break;
            default:
              // Don't care about the rest of the changes
              break;
          }
        });
        embed.setAuthor({ name: `Event Deleted`, iconURL: guild.iconURL() });
        break;
      case 110: // Thread Create
        description +=
          `\n**Thread:** ${auditLogEntry.target}` +
          `\n**⦁ Name:** ${auditLogEntry.target.name}` +
          `\n**⦁ Type:** ${numberToChannelType(auditLogEntry.target.type)}`;
        embed.setAuthor({ name: `Thread Created`, iconURL: guild.iconURL() });
        break;
      case 111: // Thread Update
        description += `\n**Thread:** ${auditLogEntry.target.name}`;
        auditLogEntry.changes.forEach((change) => {
          switch (change.key) {
            case "name":
              description += `\n**⦁ Name:** ${change.old} **➜** ${change.new}`;
              break;
            case "invitable":
              description += change.new ? `\n**⦁ Invitable**` : `\n**⦁ Not Invitable**`;
              break;
            case "rate_limit_per_user":
              description += `\n**⦁ Slowmode:** ${change.old} **➜** ${change.new}`;
              break;
            case "locked":
              description += change.new ? `\n**⦁ Thread Locked**` : `\n**⦁ Thread Unlocked**`;
              break;
            case "auto_archive_duration":
              description +=
                `\n**⦁ Auto Archive Duration:** ` +
                `${change.old / 60 > 24 ? `${change.old / 60 / 24} Days` : `${change.old / 60} Hours`} **➜** ` +
                `${change.new / 60 > 24 ? `${change.new / 60 / 24} Days` : `${change.new / 60} Hours`}`;
              break;
            case "archived":
              description += change.new ? `\n**⦁ Thread Archived**` : `\n**⦁ Thread Unarchived**`;
              break;
            default:
              logger.log("warn", `Thread Update ${change.key} not handled`);
              console.log(change);
              break;
          }
        });
        embed.setAuthor({ name: `Thread Updated`, iconURL: guild.iconURL() });
        break;
      case 112: // Thread Delete
        description += `\n**Thread:** ${auditLogEntry.target.name}`;
        embed.setAuthor({ name: `Thread Deleted`, iconURL: guild.iconURL() });
        break;
      case 121: // Application Command Permission Update
        return; // Returning so that the embed is not sent
        // Need to figure out how to handle this
        // description += `\n**Application:** <@${auditLogEntry.targetId}>`;
        // for (i in auditLogEntry.changes) {
        //   if (auditLogEntry.changes[i].new) {
        //     if (auditLogEntry.changes[i].key === guild.id) {
        //       description += `\n**⦁ @everyone:** ${auditLogEntry.changes[i].new.permission}`;
        //     }
        //     description += `\n**⦁ ${auditLogEntry.changes[i].key}:** ${auditLogEntry.changes[i].new.permission}`;
        //     console.log(auditLogEntry.changes[i].new);
        //   } else {
        //     description += `\n**⦁ ${auditLogEntry.changes[i].key}:** ${auditLogEntry.changes[i].old.permission}`;
        //     console.log(auditLogEntry.changes[i].old);
        //   }
        // }
        embed.setAuthor({ name: `Application Command Permission Updated`, iconURL: guild.iconURL() });
        break;
      case 130: // Soundboard Sound Create
        description += `\n**Sound:** ${auditLogEntry.target.name}`;
        const emoji = auditLogEntry.target.emoji_id
          ? client.guilds.cache.get(guild.id).emojis.cache.get(auditLogEntry.target.emoji_id)
          : auditLogEntry.target.emoji_name;
        description += `\n**⦁ Emoji:** ${emoji}`;
        embed
          .setAuthor({ name: `Soundboard Sound Created`, iconURL: guild.iconURL() })
          .setFooter({ text: `Sound ID: ${auditLogEntry.target.sound_id}` });
        console.log(auditLogEntry);
        break;
      case 131: // Soundboard Sound Update
        return; // Returning so that the embed is not sent
        // Need to figure out how to handle this
        // Can't get the sound name from the audit log entry
        // The id is not the sound id but the id of the audit log entry

        // description += auditLogEntry.target.name ? `\n**Sound:** ${auditLogEntry.target.name}` : "";
        // auditLogEntry.changes.forEach((change) => {
        //   switch (change.key) {
        //     case "name":
        //       description += `\n**⦁ Name:** ${change.old} **➜** ${change.new}`;
        //       break;
        //     case "emoji_id":
        //       description +=
        //         `\n**⦁ Emoji:**` +
        //         `${change.old ? ` ${client.guilds.cache.get(guild.id).emojis.cache.get(change.old)} **➜**` : ""}` +
        //         ` ${client.guilds.cache.get(guild.id).emojis.cache.get(change.new)}`;
        //       break;
        //     case "emoji_name":
        //       description += `\n**⦁ Emoji:**${change.old ? ` ${change.old} **➜**` : ""} ${change.new}`;
        //       break;
        //     default:
        //       // Don't care about the rest of the changes
        //       break;
        //   }
        // });
        // embed
        //   .setAuthor({ name: `Soundboard Sound Updated`, iconURL: guild.iconURL() })
        //   .setFooter({ text: `Sound ID: ${auditLogEntry.target.sound_id}` });
        console.log(auditLogEntry);
        break;
      case 132: // Soundboard Sound Delete
        description += `\n**Sound:** ${auditLogEntry.target.name}`;
        embed
          .setAuthor({ name: `Soundboard Sound Deleted`, iconURL: guild.iconURL() })
          .setFooter({ text: `Sound ID: ${auditLogEntry.target.sound_id}` });
        console.log(auditLogEntry);
        break;
      case 140: // Auto Mod Rule Create
        return; // Returning so that the embed is not sent
        // Need to figure out how to handle this
        embed.setAuthor({ name: `Auto Mod Rule Created`, iconURL: guild.iconURL() });
        console.log(auditLogEntry);
        break;
      case 141: // Auto Mod Rule Update
        return; // Returning so that the embed is not sent
        // Need to figure out how to handle this
        embed.setAuthor({ name: `Auto Mod Rule Updated`, iconURL: guild.iconURL() });
        console.log(auditLogEntry);
        break;
      case 142: // Auto Mod Rule Delete
        return; // Returning so that the embed is not sent
        // Need to figure out how to handle this
        embed.setAuthor({ name: `Auto Mod Rule Deleted`, iconURL: guild.iconURL() });
        console.log(auditLogEntry);
        break;
      case 143: // Auto Mod Block Message
        description += `\n**Triggered Rule:** ${auditLogEntry.extra.autoModerationRuleName}`;
        embed
          .setAuthor({ name: `Auto Mod Blocked Message`, iconURL: guild.iconURL() })
          .setFooter({ text: `User ID: ${auditLogEntry.targetId}` });
        console.log(auditLogEntry);
        break;
      case 144: // Auto Mod Flagged Message
        description += `\n**Triggered Rule:** ${auditLogEntry.extra.autoModerationRuleName}`;
        embed
          .setAuthor({ name: `Auto Mod Flagged Message`, iconURL: guild.iconURL() })
          .setFooter({ text: `User ID: ${auditLogEntry.targetId}` });
        console.log(auditLogEntry);
        break;
      case 145: // Auto Mod User Timed Out
        return; // Returning so that the embed is not sent
        // Need to figure out how to handle this
        embed.setAuthor({ name: `Auto Mod User Timed Out`, iconURL: guild.iconURL() });
        console.log(auditLogEntry);
        break;
      case 150: // Creator Monetization Request Create
        return; // Returning so that the embed is not sent
        // Need to figure out how to handle this
        embed.setAuthor({ name: `Creator Monetization Request Created`, iconURL: guild.iconURL() });
        console.log(auditLogEntry);
        break;
      case 151: // Creator Monetization Terms Accepted
        return; // Returning so that the embed is not sent
        // Need to figure out how to handle this
        embed.setAuthor({ name: `Creator Monetization Terms Accepted`, iconURL: guild.iconURL() });
        console.log(auditLogEntry);
        break;
      case 163: // Onboarding Prompt Create
        return; // Returning so that the embed is not sent
        // Need to figure out how to handle this
        embed.setAuthor({ name: `Onboarding Prompt Created`, iconURL: guild.iconURL() });
        console.log(auditLogEntry);
        break;
      case 164: // Onboarding Prompt Update
        return; // Returning so that the embed is not sent
        // Need to figure out how to handle this
        embed.setAuthor({ name: `Onboarding Prompt Updated`, iconURL: guild.iconURL() });
        console.log(auditLogEntry);
        break;
      case 165: // Onboarding Prompt Delete
        return; // Returning so that the embed is not sent
        // Need to figure out how to handle this
        embed.setAuthor({ name: `Onboarding Prompt Deleted`, iconURL: guild.iconURL() });
        console.log(auditLogEntry);
        break;
      case 166: // Onboarding Create
        return; // Returning so that the embed is not sent
        // Need to figure out how to handle this
        embed.setAuthor({ name: `Onboarding Created`, iconURL: guild.iconURL() });
        console.log(auditLogEntry);
        break;
      case 167: // Onboarding Update
        return; // Returning so that the embed is not sent
        // Need to figure out how to handle this
        embed.setAuthor({ name: `Onboarding Updated`, iconURL: guild.iconURL() });
        console.log(auditLogEntry);
        break;
      case 190: // Guild Server Guide Create
        return; // Returning so that the embed is not sent
        // Need to figure out how to handle this
        embed.setAuthor({ name: `Guild Server Guide Created`, iconURL: guild.iconURL() });
        console.log(auditLogEntry);
        break;
      case 191: // Guild Server Guide Update
        return; // Returning so that the embed is not sent
        // Need to figure out how to handle this
        embed.setAuthor({ name: `Guild Server Guide Updated`, iconURL: guild.iconURL() });
        console.log(auditLogEntry);
        break;
      default:
        // In case there are any other actions that need to be handled
        logger.log("warn", `Action ${auditLogEntry.action} not handled`);
        console.log(auditLogEntry);
        return; // Returning so that the embed is not sent
    }

    // Set the description of the embed message
    if (!description) return;
    if (description.length > 4096) {
      description = description.slice(0, 4090) + "...";
    }
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
};
