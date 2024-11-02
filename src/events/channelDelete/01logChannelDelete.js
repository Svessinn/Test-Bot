const path = require("path");
const { Client, Interaction, EmbedBuilder } = require("discord.js");
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

/**
 * @param {Client} client
 * @param {Interaction} interaction
 */

module.exports = async (client, interaction) => {
  const event = path.basename(__dirname);
  const log = await getEventLogger(interaction.guild.id, event);

  if (log) {
    try {
      const channel = await getLogChannel(interaction.guild.id);
      const logChannel = interaction.guild.channels.cache.get(channel.channelId);

      let embed = new EmbedBuilder()
        .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL() })
        .setDescription(`**Channel Deleted: #${interaction.name}**`)
        .setFooter({text: `Channel ID: ${interaction.id}`})
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      logger.log("error", `There was an error logging ${event} for ${interaction.guild.id}: \n${error}`);
      console.log(error);
    }
  }
  
  return;
};