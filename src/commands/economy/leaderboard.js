const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  EmbedBuilder,
  AttachmentBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const path = require("path");
const getGuildLeaberboard = require("../../queries/getGuildLeaderboard");
const calcLevelExp = require("../../utils/calculateLevelExp");
const Canvas = require("canvas");

// Logging tool
const winston = require("winston");
const logger = winston.createLogger({
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: `logs/log.log` })],
  format: winston.format.printf(
    (log) => `[${log.level.toUpperCase()}] - ${path.basename(__filename)} - ${log.message} ${new Date(Date.now()).toUTCString()}`
  ),
});

const applyText = (canvas, text, fontSize) => {
  const context = canvas.getContext("2d");

  do {
    context.font = `${(fontSize -= 10)}px sans-serif`;
  } while (context.measureText(text).width > canvas.width - 400);

  return context.font;
};

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
      const maxPage = Math.ceil(lb.length / 10);
      page = Math.min(page, maxPage);

      let lbEmbed = new EmbedBuilder()
        .setTitle(`${interaction.guild.name} Leaderboard`)
        .setTimestamp()
        .setFooter({ text: `Page ${page < maxPage ? page : maxPage}/${maxPage}` });

      let canvas;
      let context;
      let background;

      const bg = await Canvas.loadImage("media/images/BlackTransparentBackground.png");

      let ln = page >= maxPage ? lb.length % 10 : 10;

      canvas = Canvas.createCanvas(2048, 372 + 300 * (ln - 1));
      context = canvas.getContext("2d");
      background = await Canvas.loadImage("media/images/leaderboardBackground.jpeg");
      context.drawImage(background, 0, 0, 2048, 3072);

      for (let i = 0; i < ln; i++) {
        let start = (page - 1) * 10;
        let guildMember = await interaction.guild.members.fetch(lb[i + start].userId);

        context.drawImage(bg, 15, 40 + 300 * i, 2023, 295);

        const avatar = await Canvas.loadImage(guildMember.displayAvatarURL({ extension: "png" }));

        context.drawImage(avatar, 25, 50 + 300 * i, 275, 275);

        context.font = applyText(canvas, `#${1 + i + start} ${guildMember.user.tag}`, 200);
        context.fillStyle = "#ffffff";
        context.fillText(`#${1 + i + start} ${guildMember.user.tag}`, 350, 200 + 300 * i);

        let nextLevel = calcLevelExp(lb[i + start].level);
        context.font = applyText(canvas, `Level: ${lb[i + start].level} - Exp: ${lb[i + start].exp}/${nextLevel}`, 100);
        context.fillText(`Level: ${lb[i + start].level} - Exp: ${lb[i + start].exp}/${nextLevel}`, 350, 310 + 300 * i);
      }

      let lbAttachment = new AttachmentBuilder(canvas.toBuffer(), {
        name: "lbImage.png",
        description: `Leaderboard Page for ${interaction.guild.name}`,
      });

      lbEmbed.setImage(`attachment://${lbAttachment.name}`);

      let testButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("LB-0").setEmoji("⏪").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("LB-1").setEmoji("◀️").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("LB-2").setEmoji("▶️").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("LB-3").setEmoji("⏩").setStyle(ButtonStyle.Secondary)
      );

      await interaction.editReply({
        embeds: [lbEmbed],
        files: [lbAttachment],
        components: [testButtons],
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
  // devOnly: true, // Is a dev only command
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
  botPermissions: [PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.AttachFiles], // What permissions the bot needs to run the command
};
