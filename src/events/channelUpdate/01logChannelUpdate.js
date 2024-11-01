const path = require("path");
const { Client, EmbedBuilder, ChannelFlagsBitField, PermissionsBitField } = require("discord.js");
const getEventLogger = require("../../queries/getGuildEventLogger");
const getLogChannel = require("../../queries/getGuildLogChannel")

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
  for(i in oldObj) {
    if(oldObj[i] !== newObj[i]) {
      // Normal compatisons fon't work for the flags and permissionOverwrites feilds
      // Their bitFeilds need to be resolved for comparisons
      if (i === 'flags') {
        if (ChannelFlagsBitField.resolve(oldObj.flags) !== ChannelFlagsBitField.resolve(newObj.flags)) {
          diffs.push(i)
        }
      } else if (i === 'permissionOverwrites') {
        let oldCache = {};
        let newCache = {};

        for (let j of oldObj.permissionOverwrites.cache) {
          oldCache[j[0]] = j[1]
        }
        
        for (let j of newObj.permissionOverwrites.cache) {
          newCache[j[0]] = j[1]
        }

        for (let j in oldCache) {
          if (PermissionsBitField.resolve(oldCache[j].deny) !== PermissionsBitField.resolve(newCache[j].deny) ||
              PermissionsBitField.resolve(oldCache[j].allow) !== PermissionsBitField.resolve(newCache[j].allow)) {
            diffs.push(i)
          }
        }
      } else {
        diffs.push(i);
      }
    }
  }
  // Removing duplicates if there are any
  // This isn't necessary, at least not now
  diffs = Array.from(new Set(diffs))
  return diffs;
};

/**
 * @param {Client} client
 */

module.exports = async (client, ...args) => {
  let oldChannel = args[0];
  let newChannel = args[1];

  const changes = compareObjects(oldChannel, newChannel)

  if (!changes.length) return;

  // console.log(changes);

  const event = path.basename(__dirname);
  const log = await getEventLogger(oldChannel.guild.id, event);

  if (log) {
    try {
      const channel = await getLogChannel(oldChannel.guild.id);
      const logChannel = oldChannel.guild.channels.cache.get(channel.channelId);

      let embed = new EmbedBuilder()
        .setAuthor({ name: oldChannel.guild.name, iconURL: oldChannel.guild.iconURL() })
        .setTitle(`#${newChannel.name} was updated:`)
        .setDescription(`Something changed for <#${oldChannel.id}>`)
        .setFooter({text: `Channel ID: ${oldChannel.id}`})
        .setTimestamp();

      let embedDescription = ``

      if (changes.includes("flags")) {
        embedDescription += `\nChannel Flags were updated`
      }

      if (changes.includes("name")) {
        embedDescription += `\nName: **#${oldChannel.name}** -> **#${newChannel.name}**`
      }

      if (changes.includes("nsfw")) {
        embedDescription += `\nNSFW: **${oldChannel.nsfw}** -> **${newChannel.nsfw}**`
      }

      if (changes.includes("permissionOverwrites")) {
        embedDescription += `\nPermission Overwrites were updated`
      } 

      if (changes.includes("rateLimitPerUser")) {
        embedDescription += `\nSlowmode: **${oldChannel.rateLimitPerUser}** -> **${newChannel.rateLimitPerUser}**`
      }

      if (changes.includes("topic")) {
        embedDescription += `\nTopic: **${oldChannel.topic?.length ? oldChannel.topic : '*~~null~~*'}** -> **${newChannel.topic?.length ? newChannel.topic : '*~~null~~*'}**`
      }

      // If something noteworthy was changed, update the embed
      if (embedDescription.length > 0) {
        embed.setDescription(embedDescription)
      } else {
        return;
      }

      await logChannel.send({ embeds: [embed] });
      return;
    } catch (error) {
      logger.log("error", `There was an error logging ${event} for ${oldChannel.guild.id}: \n${error}`);
      console.log(error);
    }
  }

  return;
};
