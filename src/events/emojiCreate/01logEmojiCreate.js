const path = require("path");
const { Client, GuildEmoji, EmbedBuilder } = require("discord.js");
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
 * @param {Client} client - The Discord client instance
 * @param {GuildEmoji} emoji - The emoji that was created
 */

module.exports = async (client, emoji) => {
  // Get the event name from the directory name
  const event = path.basename(__dirname);
  // Check if logging is enabled for this event
  const log = await getEventLogger(emoji.guild.id, event);

  if (log) {
    try {
      // Get the log channel for the guild
      const channel = await getLogChannel(emoji.guild.id);
      const logChannel = emoji.guild.channels.cache.get(channel.channelId);

      // Create an embed message for the emoji creation event
      let embed = new EmbedBuilder()
        .setAuthor({ name: `Emoji Created`, iconURL: emoji.guild.iconURL() })
        .setDescription(`**${emoji.name} emoji was created**`)
        .setFooter({ text: `Emoji ID: ${emoji.id}` })
        .setTimestamp()
        .setColor("#7289DA");

      // Send the embed message to the log channel
      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      // Log any errors that occur
      logger.log("error", `There was an error logging ${event} for ${emoji.guild.id}: \n${error}`);
      console.log(error);
    }
  }

  return;
};
