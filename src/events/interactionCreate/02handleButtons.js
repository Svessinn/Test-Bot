const path = require("path");
const { Client, ButtonInteraction, MessageFlags } = require("discord.js");
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
 * @param {ButtonInteraction} interaction
 */

module.exports = async (client, interaction) => {
  if (!interaction.isButton()) return;

  // Catchall for any old messages that were not disabled
  if (Date.now() - interaction.message.createdTimestamp > 300000) {
    await interaction.reply({
      flags: [MessageFlags.Ephemeral],
      content: "This message is too old to be interacted with",
    });

    let buttonArray = [];
    for (let component of interaction.message.components) {
      component.components.forEach((button) => {
        button.data.disabled = true;
      });
      buttonArray.push(component);
    }

    await interaction.message.edit({ components: buttonArray });
    return;
  }

  try {
    switch (interaction.customId) {
      case "LB-0": // Go to the first page of the leaderboard
        interaction.reply({
          flags: [MessageFlags.Ephemeral],
          content: "Fetching leaderboard",
        });
        await updateLeaderboard(interaction, 1);
        await interaction.editReply({
          content: "Leaderboard has been updated",
          flags: [MessageFlags.Ephemeral],
        });
        break;
      case "LB-1": // Go back one page in the leaderboard
        await interaction.reply({
          flags: [MessageFlags.Ephemeral],
          content: "Fetching leaderboard",
        });
        await updateLeaderboard(
          interaction,
          Number(interaction.message.embeds[0].data.footer.text.split(" ")[1].split("/")[0]) - 1
        );
        await interaction.editReply({
          content: "Leaderboard has been updated",
          flags: [MessageFlags.Ephemeral],
        });
        break;
      case "LB-2": // Go forward one page in the leaderboard
        await interaction.reply({
          flags: [MessageFlags.Ephemeral],
          content: "Fetching leaderboard",
        });
        await updateLeaderboard(
          interaction,
          Number(interaction.message.embeds[0].data.footer.text.split(" ")[1].split("/")[0]) + 1
        );
        await interaction.editReply({
          content: "Leaderboard has been updated",
          flags: [MessageFlags.Ephemeral],
        });
        break;
      case "LB-3": // Go to the last page of the leaderboard
        await interaction.reply({
          flags: [MessageFlags.Ephemeral],
          content: "Fetching leaderboard",
        });
        await updateLeaderboard(interaction, Number.MAX_VALUE);
        await interaction.editReply({
          content: "Leaderboard has been updated",
          flags: [MessageFlags.Ephemeral],
        });
        break;
      default: // If the button ID is not handled
        await interaction.reply({
          flags: [MessageFlags.Ephemeral],
          content: "Unknown button pressed",
        });
        break;
    }
    // Delete the reply after 5 seconds
    setTimeout(async () => {
      await interaction.deleteReply();
    }, 5000);
  } catch (error) {
    logger.log("error", `There was an error handling the button interaction: \n${error}`);
    console.log(error);
  }
  return;
};
