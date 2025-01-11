const { Client, Interaction, PermissionFlagsBits, ChannelType, EmbedBuilder } = require("discord.js");
const path = require("path");
const moment = require("moment");

// Logging tool
const winston = require("winston");
const logger = winston.createLogger({
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: `logs/log.log` })],
  format: winston.format.printf(
    (log) =>
      `[${log.level.toUpperCase()}] - ${path.basename(__filename)} - ${log.message} ${new Date(Date.now()).toUTCString()}`
  ),
});

const verificationLevels = {
  0: "None",
  1: "Low",
  2: "Medium",
  3: "High",
  4: "Very High",
};

const boostLevels = {
  0: "None",
  1: "Level 1",
  2: "Level 2",
  3: "Level 3",
};

module.exports = {
  /**
   * @param {Client} client
   * @param {Interaction} interaction
   */

  callback: async (client, interaction) => {
    if (!interaction.inGuild()) {
      interaction.reply("This command is only for use in a guild");
      return;
    }
    if (interaction.member.user.bot) {
      interaction.reply("Bots can't use this command");
      return;
    }

    await interaction.deferReply({});

    const guild = interaction.guild;

    const dict = {
      "Guild Owner": `<@${(await guild.fetchOwner()).user.id}>`,
      "Category Channels": guild.channels.cache.filter((channel) => channel.type === ChannelType.GuildCategory).size,
      "Text Channels": guild.channels.cache.filter((channel) => channel.type === ChannelType.GuildText).size,
      "Voice Channels": guild.channels.cache.filter((channel) => channel.type === ChannelType.GuildVoice).size,
      "Stage Channels": guild.channels.cache.filter((channel) => channel.type === ChannelType.GuildStageVoice).size,
      "Total members": guild.memberCount,
      "Human mebers": guild.members.cache.filter((member) => !member.user.bot).size,
      "Bot members": guild.members.cache.filter((member) => member.user.bot).size,
      "Role Count": guild.roles.cache.size,
      "Verification Level": verificationLevels[guild.verificationLevel],
      "Boost Level": boostLevels[guild.premiumTier],
    };

    try {
      let embed = new EmbedBuilder()
        .setFooter({
          text: `ID: ${guild.id} | Created at: ${moment(guild.createdTimestamp).format("DD. MMM 'YY")}`,
        })
        .setColor("#7289DA")
        .setAuthor({ name: `${guild.name} Info`, iconURL: guild.iconURL() })
        .setThumbnail(guild.iconURL());

      for (let row in dict) {
        if (dict[row]) {
          embed.addFields({ name: row, value: String(dict[row]), inline: true });
        }
      }

      await interaction.editReply({
        // content: "Under Development",
        embeds: [embed],
      });
    } catch (error) {
      await interaction.editReply({
        content: `Bot Error, Try again later`,
      });
      logger.log("error", `There was an error :\n${error}`);
      console.log(error);
    }
  }, // What the bot replies with

  name: "serverinfo", // Name of the command
  description: "Get server information", // Description of the command
  devOnly: true, // Is a dev only command
  // testOnly: true, // Is a test command
  usage: "/serverinfo", // How to use this command. [required], (optional)
  example: "/serverinfo", // Example of how to run this command
  // options: [], // Input options
  // deleted: true, // If the command is no longer in use
  // permissionsRequired: [], // What permissions are needed to run the command
  botPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks], // What permissions the bot needs to run the command
};
