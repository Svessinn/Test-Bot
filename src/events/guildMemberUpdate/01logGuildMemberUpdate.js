const path = require("path");
const { Client, EmbedBuilder, PermissionsBitField } = require("discord.js");
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
      // Normal compatisons don't work for the flags feild
      // Their bitFeilds need to be resolved for comparisons
      if (i === "flags") {
        if (PermissionsBitField.resolve(oldObj.flags) !== PermissionsBitField.resolve(newObj.flags)) {
          diffs.push(i);
        }
      } else {
        diffs.push(i);
      }
    }
  }
  // Removing duplicates if there are any
  // This isn't necessary, at least not now
  diffs = Array.from(new Set(diffs));
  return diffs;
}

/**
 * @param {Client} client
 */

module.exports = async (client, ...args) => {
  const oldUser = args[0];
  const newUser = args[1];

  const changes = compareObjects(oldUser, newUser);
  if (!changes.length) return;

  const event = path.basename(__dirname);
  const log = await getEventLogger(oldUser.guild.id, event);

  if (log) {
    try {
      const channel = await getLogChannel(oldUser.guild.id);
      const logChannel = oldUser.guild.channels.cache.get(channel.channelId);

      let embed = new EmbedBuilder()
        .setAuthor({ name: `User Updated`, iconURL: oldUser.guild.iconURL() })
        .setDescription(`Something changed for <@${oldUser.id}>`)
        .setFooter({ text: `User ID: ${oldUser.id}` })
        .setTimestamp()
        .setColor("#7289DA");

      let embedDescription = ``;

      if (changes.includes("communicationDisabledUntilTimestamp")) {
        if (newUser.communicationDisabledUntilTimestamp === null) {
          embedDescription += `\n**Timeout Removed**`;
        } else {
          embedDescription += `\n**Timed out for:** ${msToTime(Math.ceil((newUser.communicationDisabledUntilTimestamp - Date.now()) / 1000) * 1000)}`;
        }
      }

      if (changes.includes("nickname")) {
        embedDescription += `\n**Nickname ${newUser?.nickname ? "updated:** " + newUser.nickname : "removed**"}`;
      }

      if (changes.includes("_roles")) {
        const removedRoles = oldUser._roles.filter((r) => !newUser._roles.includes(r));
        const addedRoles = newUser._roles.filter((r) => !oldUser._roles.includes(r));

        if (removedRoles.length) {
          embedDescription += `\n**Removed from role(s):** \``;
          for (let role of removedRoles) {
            const roleName = await oldUser.guild.roles.cache.get(role).name;
            embedDescription += `${roleName}, `;
          }
          embedDescription = embedDescription.substring(0, embedDescription.length - 2) + `\``;
        }

        if (addedRoles.length) {
          embedDescription += `\n**Added to role(s):** \``;

          for (let role of addedRoles) {
            const roleName = await newUser.guild.roles.cache.get(role).name;
            embedDescription += `${roleName}, `;
          }
          embedDescription = embedDescription.substring(0, embedDescription.length - 2) + `\``;
        }
      }

      if (changes.includes("avatar")) {
        embedDescription += `\n**Server Avatar updated**`;
        if (newUser.avatar) {
          embed.setThumbnail(
            `https://cdn.discordapp.com/guilds/${newUser.guild.id}/users/${newUser.user.id}/avatars/${newUser.avatar}.webp?size=1024`
          );
        } else {
          embed.setThumbnail(`https://cdn.discordapp.com/avatars/${newUser.user.id}/${newUser.user.avatar}.webp?size=1024`);
        }
      }

      if (embedDescription.length > 0) {
        embed.setDescription(`<@${oldUser.id}>` + embedDescription);
      } else {
        return;
      }

      await logChannel.send({ embeds: [embed] });
      return;
    } catch (error) {
      logger.log("error", `There was an error logging ${event} for ${oldUser.guild.id}: \n${error}`);
      console.log(error);
    }
  }

  return;
};
