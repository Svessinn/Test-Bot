const { Client, Message } = require("discord.js");
const path = require("path");
const getLevel = require("../../queries/getUserLevelData");
const createLevel = require("../../queries/addNewUserLevelData");
const updateExp = require("../../queries/updateUserExp");
const guildChannel = require("../../queries/getGuildLevelChannel");
const getLevelupRoles = require("../../queries/getGuildLevelRoles");
const { DefaultDict } = require("pycollections");
const winston = require("winston");

// Logging tool
const logger = winston.createLogger({
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: `logs/log.log` })],
  format: winston.format.printf(
    (log) =>
      `[${log.level.toUpperCase()}] - ${path.basename(__filename)} - ${log.message} ${new Date(Date.now()).toUTCString()}`
  ),
});

function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let cooldowns = new DefaultDict([].constructor);

/**
 * @param {Client} client
 * @param {Message} message
 */

module.exports = async (client, message) => {
  const memberID = message.author.id;
  const guildID = message.guild.id;

  if (!message.inGuild() || message.author.bot || cooldowns.get(guildID).includes(memberID)) return;

  let level = await getLevel(memberID, guildID);

  if (!level) {
    try {
      await createLevel(memberID, guildID);
      level = await getLevel(memberID, guildID);
    } catch (error) {
      logger.log("error", error);
      console.log(error);
    }
  }

  let L = level.level;
  let gainedExp = Math.round(((getRandom(36, 240) + L) / 5) * Math.pow((2 * L + 10) / (L + getRandom(1, 100) + 10), 2.5) + 1);

  let updated = await updateExp(memberID, guildID, gainedExp);

  if (updated.level > L) {
    const channel = await guildChannel(guildID);
    const targetChannel = message.guild.channels.cache?.get(channel ? channel.channelId : null) || message.channel;

    let outContent = `Congratulations <@${memberID}>\nYou've leveled up to level ${updated.level}`;

    const levelupRoles = await getLevelupRoles(guildID);
    // const levelupRole = levelupRoles.findIndex((u) => u.level === updated.level);

    let roles = [];
    for (let i = 0; i < levelupRoles.length; i++) {
      if (levelupRoles[i].level <= updated.level) {
        const role = message.guild.roles.cache.get(levelupRoles[i].roleId);
        roles.push(role);
        if (levelupRoles[i].level === updated.level) {
          outContent += `\nAnd been given the role \`${role.name}\``;
        }
      }
    }
    await message.member.roles.add(roles).catch((err) => {
      logger.log("error", `Error adding levelup role\n${err}`);
    });

    try {
      await targetChannel.send({ content: outContent });
    } catch (error) {
      logger.log("error", error);
      console.log(error);
    }
  }

  cooldowns.get(guildID).push(memberID);

  setTimeout(() => {
    cooldowns.get(guildID).shift();
  }, 60000);
};
