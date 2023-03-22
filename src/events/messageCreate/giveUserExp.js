const { Client, Message } = require("discord.js");
const path = require("path");
const getLevel = require("../../queries/getUserLevelData");
const createLevel = require("../../queries/createNewUserLevelData");
const updateExp = require("../../queries/updateUserExp");
const guildChannel = require("../../queries/getGuildLevelChannel");
const getLevelupRoles = require("../../queries/getGuildLevelRoles");
const { DefaultDict } = require("pycollections");
const winston = require("winston");

// Logging tool
const logger = winston.createLogger({
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: `logs/log.log` })],
  format: winston.format.printf((log) => `[${log.level.toUpperCase()}] - ${path.basename(__filename)} - ${log.message} ${new Date(Date.now()).toUTCString()}`),
});

function getRandomExp(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let cooldowns = new DefaultDict([].constructor);

/**
 *
 * @param {Client} client
 * @param {Message} message
 */
module.exports = async (client, message) => {
  if (!message.inGuild() || message.author.bot || cooldowns.get(message.guild.id).includes(message.member.id)) return;

  let level = await getLevel(message.author.id, message.guild.id);
  let updated;

  if (level) {
    updated = await updateExp(message.author.id, message.guild.id, getRandomExp(1, 5));
  } else {
    await createLevel(message.author.id, message.guild.id);
    level = await getLevel(message.author.id, message.guild.id);
    updated = await updateExp(message.author.id, message.guild.id, getRandomExp(1, 5));
  }

  if (updated.level > level.level) {
    const channel = await guildChannel(message.guild.id);

    let targetChannel;
    try {
      targetChannel = await message.guild.channels.cache.get(channel.channelId);
    } catch (err) {
      logger.log("error", err);
    }

    const levelupRoles = await getLevelupRoles(message.guild.id);
    let levelup = levelupRoles.findIndex((u) => u.level === updated.level);

    if (levelup === -1) {
      if (targetChannel) {
        await targetChannel.send({
          content: `Congratulations ${message.member.user}\nYou've leveled up to level ${updated.level}`,
        });
      } else {
        await message.channel.send({
          content: `Congratulations ${message.member.user}\nYou've leveled up to level ${updated.level}`,
        });
      }
    } else {
      let role = message.guild.roles.cache.get(levelupRoles[levelup].roleId);
      await message.member.roles.add(role);

      if (targetChannel) {
        await targetChannel.send({
          content: `Congratulations ${message.member.user}\nYou've leveled up to level ${updated.level}\nAnd been given the role \`${role.name}\``,
        });
      } else {
        await message.channel.send({
          content: `Congratulations ${message.member.user}\nYou've leveled up to level ${updated.level}\nAnd been given the role \`${role.name}\``,
        });
      }
    }
  }

  cooldowns.get(message.guild.id).push(message.member.id);
  setTimeout(() => {
    let idx = cooldowns.get(message.guild.id).indexOf(message.member.id);
    cooldowns.get(message.guild.id).splice(idx, 1);
  }, 60000);
};
