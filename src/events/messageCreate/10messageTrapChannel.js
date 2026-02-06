const { Client, Message } = require("discord.js");
const path = require("path");
const winston = require("winston");

// Logging tool
const logger = winston.createLogger({
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: `logs/log.log` })],
  format: winston.format.printf(
    (log) => `[${log.level.toUpperCase()}] - ${path.basename(__filename)} - ${log.message} ${new Date(Date.now()).toUTCString()}`,
  ),
});

/**
 * @param {Client} client
 * @param {Message} message
 */

module.exports = async (client, message) => {
  if (message.channel.name !== "message-trap") return;
  if (message.author.bot) return;
  const memberID = message.author.id;
  const guildID = message.guild.id;
  await message.member
    .ban({ reason: "Sent a message in the message-trap channel.", deleteMessageSeconds: 86400 })
    .then(() => {
      logger.log("info", `Banned user ${memberID} in guild ${guildID} and deleted messages from last 24 hours.`);
    })
    .catch((error) => {
      logger.log("error", `Failed to ban user ${memberID} in guild ${guildID}: ${error}`);
      console.error(error);
    });
  await message.channel
    .send({ content: `<@${memberID}> has been banned for sending a message in the message-trap channel.` })
    .catch((error) => {
      logger.log("error", `Failed to send ban message in guild ${guildID}: ${error}`);
      console.error(error);
    });
};
