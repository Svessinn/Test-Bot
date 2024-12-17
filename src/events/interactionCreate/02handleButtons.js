const { devs, testServer } = require("../../../config.json");
const path = require("path");
const { Client, Interaction } = require("discord.js");
const updateLeaderboard = require("../../utils/updateLeaderboard");

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
 * @param {Client} client
 * @param {Interaction} interaction
 */

module.exports = async (client, interaction) => {
  if (!interaction.isButton()) return;

  try {
    switch (interaction.customId) {
      case "LB-0":
        interaction.reply({
          ephemeral: true,
          content: "You pressed Button 1",
        });
        await updateLeaderboard(interaction, 1);
        break;
      case "LB-1":
        await interaction.reply({
          ephemeral: true,
          content: "You pressed Button 2",
        });
        await updateLeaderboard(
          interaction,
          Number(interaction.message.embeds[0].data.footer.text.split(" ")[1].split("/")[0]) - 1
        );
        break;
      case "LB-2":
        await interaction.reply({
          ephemeral: true,
          content: "You pressed Button 3",
        });
        await updateLeaderboard(
          interaction,
          Number(interaction.message.embeds[0].data.footer.text.split(" ")[1].split("/")[0]) + 1
        );
        break;
      case "LB-3":
        await interaction.reply({
          ephemeral: true,
          content: "You pressed Button 4",
        });
        await updateLeaderboard(interaction, Number.MAX_VALUE);
        break;
      default:
        await interaction.reply({
          ephemeral: true,
          content: "Unknown button pressed",
        });
        break;
    }
  } catch (error) {
    logger.log("error", `There was an error handling the button interaction: \n${error}`);
    console.log(error);
  }
  return;
};
