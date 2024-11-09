const path = require("path");
const { Client, EmbedBuilder, ChannelFlagsBitField, PermissionsBitField } = require("discord.js");
const getEventLogger = require("../../queries/getGuildEventLogger");
const getLogChannel = require("../../queries/getGuildLogChannel");
const msToTime = require("../../utils/msToTime");

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
  for (i in oldObj) {
    if (oldObj[i] !== newObj[i]) {
      // Normal compatisons don't work for the flags and permissionOverwrites feilds
      // Their bitFeilds need to be resolved for comparisons
      if (i === "flags") {
        if (ChannelFlagsBitField.resolve(oldObj.flags) !== ChannelFlagsBitField.resolve(newObj.flags)) {
          diffs.push(i);
        }
      } else if (i === "permissions") {
        if (!oldObj.permissions.equals(newObj.permissions)) {
          diffs.push(i);
        }
      } else if (i === "tags") {
        const compTags = compareObjects(oldObj.tags, newObj.tags);
        if (compTags.length) {
          diffs.push(i);
        }
      } else {
        diffs.push(i);
      }
    }
  }

  // Removing duplicates if there are any
  diffs = Array.from(new Set(diffs));
  return diffs;
}

/**
 * @param {Client} client
 */

module.exports = async (client, ...args) => {
  let oldRole = args[0];
  let newRole = args[1];

  const event = path.basename(__dirname);
  const log = await getEventLogger(oldRole.guild.id, event);

  const changes = compareObjects(oldRole, newRole);

  if (!changes.length) return;

  if (log) {
    try {
      const channel = await getLogChannel(oldRole.guild.id);
      const logChannel = oldRole.guild.channels.cache.get(channel.channelId);

      let embed = new EmbedBuilder()
        .setAuthor({ name: `Role Updated`, iconURL: oldRole.guild.iconURL() })
        // .setTitle(`\`${newRole.name}\` was updated:`)
        .setDescription(`Something changed for <@&${oldRole.id}>`)
        .setFooter({ text: `Role ID: ${oldRole.id}` })
        .setTimestamp()
        .setColor("#7289DA");

      let embedDescription = ``;

      if (changes.includes("icon")) {
        embedDescription += `\n**Icon Updated**`;
      }

      if (changes.includes("unicodeEmoji")) {
        embedDescription += `\n**Emoji Updated**`;
      }

      if (changes.includes("name")) {
        embedDescription += `\Name: **#${oldRole.name}** -> **#${newRole.name}**`;
      }

      if (changes.includes("color")) {
        let oldColour = oldRole.color.toString(16);
        let newColour = newRole.color.toString(16);
        embedDescription += `\nColour: **${oldColour !== "0".toString(16) ? "#" + oldColour : "None"}** -> **${newColour !== "0".toString(16) ? "#" + newColour : "None"}**`;
      }

      if (changes.includes("hoist")) {
        embedDescription += `\nHoisted: **${newRole.hoist}**`;
      }

      if (changes.includes("permissions")) {
        embedDescription += `\nPermissions Updated`;
      }

      // If something noteworthy was changed, update the embed
      if (embedDescription.length > 0) {
        embed.setDescription(`<@&${newRole.id}>` + embedDescription);
      } else {
        return;
      }

      await logChannel.send({ embeds: [embed] });
      return;
    } catch (error) {
      logger.log("error", `There was an error logging ${event} for ${oldRole.guild.id}: \n${error}`);
      console.log(error);
    }
  }

  return;
};
