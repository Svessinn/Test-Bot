const { EmbedBuilder, AttachmentBuilder, Interaction } = require("discord.js");
const path = require("path");
const Canvas = require("canvas");
const getGuildLeaberboard = require("../queries/getGuildLeaderboard");
const calcLevelExp = require("../utils/calculateLevelExp");
const deleteGuildUserLevel = require("../queries/deleteGuildUserLevel");
const applyText = require("./applyText");

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
 *
 * @param {Interaction} interaction
 * @param {Number} page
 * @returns
 */
module.exports = async (interaction, page) => {
  let lb = await getGuildLeaberboard(interaction.guild.id);
  page = page || 1;
  const maxPage = Math.ceil(lb.length / 10);
  page = Math.min(page, maxPage);

  let lbEmbed = new EmbedBuilder()
    .setTitle(`${interaction.guild.name} Leaderboard`)
    .setTimestamp()
    .setFooter({ text: `Page ${page < maxPage ? page : maxPage}/${maxPage}` });
  let canvas;
  let context;
  let background;

  const bg = await Canvas.loadImage("media/backgrounds/BlackTransparentBackground.png");

  let ln = page >= maxPage ? lb.length % 10 : 10;

  canvas = Canvas.createCanvas(2048, 372 + 300 * (ln - 1));
  context = canvas.getContext("2d");
  background = await Canvas.loadImage("media/backgrounds/leaderboardBackground.jpeg");
  context.drawImage(background, 0, 0, 2048, 3072);

  for (let i = 0; i < ln; i++) {
    let start = (page - 1) * 10;
    let guildMember = 0;
    let tries = 3;

    while (!guildMember && tries) {
      try {
        guildMember = await interaction.guild.members.fetch(lb[i + start].userId);
      } catch (error) {
        await deleteGuildUserLevel(interaction.guild.id, lb[i + start].userId);
        logger.log(
          "error",
          `User (${lb[i + start].userId}) no longer in Guild (${interaction.guild.id}). Removing them from the database.\n${error}`
        );
        console.log(error);
        lb = await getGuildLeaberboard(interaction.guild.id);
      }
      tries -= 1;
    }

    if (!guildMember) {
      interaction.editReply(`Failed to get members.\nToo many members not in cache.`);
      return;
    }

    context.drawImage(bg, 15, 40 + 300 * i, 2023, 295);

    const avatar = await Canvas.loadImage(guildMember.displayAvatarURL({ extension: "png" }));

    context.drawImage(avatar, 25, 50 + 300 * i, 275, 275);

    context.font = applyText(canvas, `#${1 + i + start} ${guildMember.user.username}`, 200);
    context.fillStyle = "#ffffff";
    context.fillText(`#${1 + i + start} ${guildMember.user.username}`, 350, 200 + 300 * i);

    const totalExpNeeded = await calcLevelExp(lb[i + start].level);
    const previousExpNeeded = await calcLevelExp(lb[i + start].level - 1);
    const levelExpNeeded = Math.floor(totalExpNeeded - previousExpNeeded);
    const expCurrentLevel = Math.floor(lb[i + start].exp - previousExpNeeded);

    context.font = applyText(canvas, `Level: ${lb[i + start].level} - Exp: ${expCurrentLevel}/${levelExpNeeded}`, 100);
    context.fillText(`Level: ${lb[i + start].level} - Exp: ${expCurrentLevel}/${levelExpNeeded}`, 350, 310 + 300 * i);
  }

  let lbAttachment = new AttachmentBuilder(canvas.toBuffer(), {
    name: "lbImage.png",
    description: `Leaderboard Page for ${interaction.guild.name}`,
  });

  lbEmbed.setImage(`attachment://${lbAttachment.name}`);

  await interaction.message.edit({ embeds: [lbEmbed], files: [lbAttachment] });
};
