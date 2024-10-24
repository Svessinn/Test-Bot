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
  format: winston.format.printf(
    (log) => `[${log.level.toUpperCase()}] - ${path.basename(__filename)} - ${log.message} ${new Date(Date.now()).toUTCString()}`
  ),
});

function getRandomExp(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let cooldowns = new DefaultDict([].constructor);

/**
 * @param {Client} client
 * @param {Message} message
 */

module.exports = async (client, message) => {
  const memberID = message.author.id;
  const memberUser = message.member.user;
  const guildID = message.guild.id;

  if (!message.inGuild() || message.author.bot || cooldowns.get(guildID).includes(memberID)) return;

  let level = await getLevel(memberID, guildID);
  let updated;

  if (level) {
    updated = await updateExp(memberID, guildID, getRandomExp(1, 5));
  } else {
    await createLevel(memberID, guildID);
    level = await getLevel(memberID, guildID);
    updated = await updateExp(memberID, guildID, getRandomExp(1, 5));
  }

  if (updated.level > level.level) {
    const channel = await guildChannel(guildID);

    const targetChannel = message.guild.channels.cache?.get(channel.channelId) || message.channel;

    const levelupRoles = await getLevelupRoles(guildID);
    const levelupRole = levelupRoles.findIndex((u) => u.level === updated.level);

    if (levelupRole === -1) {
      await targetChannel.send({
        content: `Congratulations ${memberUser}\nYou've leveled up to level ${updated.level}`,
      });
    } else {
      const role = message.guild.roles.cache.get(levelupRoles[levelupRole].roleId);
      await message.member.roles.add(role).catch((err) => {
        logger.log("error", `Error adding levelup role\n${err}`);
      });

      await targetChannel.send({
        content: `Congratulations ${memberUser}\nYou've leveled up to level ${updated.level}\nAnd been given the role \`${role.name}\``,
      });
    }
  }

  cooldowns.get(guildID).push(memberID);

  setTimeout(() => {
    cooldowns.get(guildID).shift();
  }, 60000);
};
