/*
 *  Still a Work in Progress
 *  Have not created all the queries yet
 *  Haven't decided on how to handle the channel quite yet
 *  Especially when there is no chosen Welcome channel
 */

const { Client } = require("discord.js");
const path = require("path");
const getWelcomeEmbed = require("../../queries/getWelcomeEmbedData");
const getWelcomeChannel = require("../../queries/getWelcomeChannelData");
const { DefaultDict } = require("pycollections");
const winston = require("winston");

// Logging tool
const logger = winston.createLogger({
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: `logs/log.log` })],
  format: winston.format.printf(
    (log) => `[${log.level.toUpperCase()}] - ${path.basename(__filename)} - ${log.message} ${new Date(Date.now()).toUTCString()}`
  ),
});

function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let cooldowns = new DefaultDict([].constructor);

/**
 * @param {Client} client
 * @param {member} member
 */

module.exports = async (client, member) => {
  if (member.bot) return;

  let embedInfo = await getWelcomeEmbed(member.guild.id);
  if (!embedInfo) return;
  let embedChannel = await getWelcomeChannel(member.guild.id);
  if (!embedChannel) {
    console.log(member.guild);
  }

  console.log(embedInfo);
  console.log(member.user.id);
};
