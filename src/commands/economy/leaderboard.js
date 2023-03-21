const { Client, Interaction, ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const path = require("path");
const getGuildLeaberboard = require("../../queries/getGuildLeaderboard");
const calcLevelExp = require("../../utils/calculateLevelExp");

// Logging tool
const winston = require("winston");
const logger = winston.createLogger({
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: `logs/log.log` })],
  format: winston.format.printf((log) => `[${log.level.toUpperCase()}] - ${path.basename(__filename)} - ${log.message} ${new Date(Date.now()).toUTCString()}`),
});

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */

  callback: async (client, interaction) => {
    if (!interaction.inGuild()) {
      interaction.reply("This command can only be ran in a guild");
      return;
    }
    if (interaction.member.user.bot) {
      interaction.reply("Bots can't user this command");
      return;
    }

    await interaction.deferReply({
      ephemeral: false,
    });

    try {
      let lb = await getGuildLeaberboard(interaction.guild.id);

      let page = (await interaction.options.get("page")?.value) || 1;
      let maxPage = Math.ceil(lb.length / 10);

      let lbEmbed = new EmbedBuilder()
        .setTitle(`${interaction.guild.name} Leaderboard`)
        .setTimestamp()
        .setFooter({ text: `Page ${page < maxPage ? page : maxPage}/${maxPage}` });

      let out = "";

      if (page >= maxPage) {
        for (let i = 0 + 10 * (maxPage - 1); i < lb.length; i++) {
          let guildMember = await interaction.guild.members.fetch(lb[i].userId);
          let nextLevel = calcLevelExp(lb[i].level);
          out += `**#${i + 1} ${guildMember.user.tag}**\nLevel: ${lb[i].level} - Exp: ${lb[i].exp}/${nextLevel}\n`;

          /*
          lbEmbed.addFields({
            name: `${guildMember.user.username}`,
            value: `Level ${lb[i].level}`,
          });
          */
        }
      } else {
        for (let i = 0 + 10 * (page - 1); i < 10 * page; i++) {
          let guildMember = await interaction.guild.members.fetch(lb[i].userId);
          let nextLevel = calcLevelExp(lb[i].level);
          out += `**#${i + 1} ${guildMember.user.tag}**\nLevel: ${lb[i].level} - Exp: ${lb[i].exp}/${nextLevel}\n`;
          /*
          lbEmbed.addFields({
            name: `${guildMember.user.username}`,
            value: `Level: ${lb[i].level} - Exp: ${lb[i].exp}`,
          });
          */
        }
      }
      lbEmbed.setDescription(out);
      await interaction.editReply({
        content: "Under Development",
        embeds: [lbEmbed],
      });
    } catch (error) {
      await interaction.editReply({
        content: `Bot Error, Try again later`,
      });
      logger.log("error", `There was an error getting leaderboard:\n${error}`);
      console.log(error);
    }
  }, // What the bot replies with

  name: "leaderboard", // Name of the command
  description: "Get server leaderboard", // Description of the command
  devOnly: true, // Is a dev only command
  // testOnly: true, // Is a test command
  usage: "/leaderboard (page)", // How to use this command. [required], (optional)
  example: "/leaderboard", // Example of how to run this command
  options: [
    {
      name: "page",
      description: "Get page x",
      type: ApplicationCommandOptionType.Integer,
    },
  ], // Input options
  // deleted: true, // If the command is no longer in use
  // permissionsRequired: [], // What permissions are needed to run the command
  // botPermissions: [], // What permissions the bot needs to run the command
};
