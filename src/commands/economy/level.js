const { Client, Interaction, ApplicationCommandOptionType, AttachmentBuilder, PermissionFlagsBits } = require("discord.js");
const path = require("path");
const winston = require("winston");
const canvacord = require("canvacord");
const getLevel = require("../../queries/getUserLevelData");
const calcLevelExp = require("../../utils/calculateLevelExp");
const getGuildLeaderboard = require("../../queries/getGuildLeaderboard");

const background = "media/backgrounds/rankBackground.jpg";

// Logging tool
const logger = winston.createLogger({
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: `logs/log.log` })],
  format: winston.format.printf(
    (log) =>
      `[${log.level.toUpperCase()}] - ${path.basename(__filename)} - ${log.message} ${new Date(Date.now()).toUTCString()}`
  ),
});

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

    const member = interaction.options.get("user")?.value || interaction.member.id;

    const level = (await getLevel(member, interaction.guild.id)) || {
      userId: member,
      guildId: interaction.guild.id,
      level: 0,
      exp: 0,
    };

    let targetUser;
    try {
      targetUser = await interaction.guild.members.fetch(member);
    } catch (err) {
      logger.log("error", err);
    }

    if (targetUser.user.bot) {
      await interaction.editReply({
        content: `${targetUser?.displayName || targetUser.user.username} is a bot, and therefore doesn't have a level`,
      });
      return;
    }

    try {
      const lb = await getGuildLeaderboard(interaction.guild.id);
      let userRank = lb.findIndex((j) => j.userId === targetUser.user.id) + 1;

      const totalExpNeeded = await calcLevelExp(level.level);
      const previousExpNeeded = await calcLevelExp(level.level - 1);
      const levelExpNeeded = totalExpNeeded - previousExpNeeded;
      const expCurrentLevel = level.exp - previousExpNeeded;

      const rank = new canvacord.Rank()
        .setAvatar(targetUser.displayAvatarURL())
        .setRank(userRank)
        .setLevel(level.level)
        .setCurrentXP(expCurrentLevel)
        .setRequiredXP(levelExpNeeded)
        .setProgressBar("#FB4699", "COLOR", true)
        .setUsername(targetUser.user?.globalName || targetUser.user.username)
        //.setDiscriminator(targetUser.user.discriminator) // Discord removed discriminators from users
        .setCustomStatusColor("#7289DA")
        .setProgressBarTrack("#7289DA")
        .setBackground("IMAGE", background)
        .setOverlay("#000000", 0.67);

      const data = await rank.build();
      const attatchment = new AttachmentBuilder(data);

      if (level) {
        await interaction.editReply({
          //content: `${targetUser?.displayName || targetUser.user.username} is level ${level.level}`,
          files: [attatchment],
        });
        return;
      }

      await interaction.editReply({
        content: `${targetUser.user.tag} is level 0`,
      });
    } catch (error) {
      await interaction.editReply({
        content: `Bot Error, Try again later`,
      });
      logger.log("error", `There was an error when sending level:\n${error}`);
      console.log(error);
    }
  }, // What the bot replies with

  name: "level", // Name of the command
  description: "Get level of a user", // Description of the command
  // devOnly: true, // Is a dev only command
  // testOnly: true, // Is a test command
  usage: "/level (user | userID)", // How to use this command. [required], (optional)
  example: "/level", // Example of how to run this command
  options: [
    {
      name: "user",
      description: "User who's level you want",
      type: ApplicationCommandOptionType.User,
    },
  ], // Input options
  // deleted: true, // If the command is no longer in use
  // permissionsRequired: [], // What permissions are needed to run the command
  botPermissions: [PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.AttachFiles], // What permissions the bot needs to run the command
};
