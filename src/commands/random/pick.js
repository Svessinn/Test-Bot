const { Client, Interaction, PermissionFlagsBits, ApplicationCommandOptionType } = require("discord.js");
const path = require("path");

// Logging tool
const winston = require("winston");
const logger = winston.createLogger({
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: `logs/log.log` })],
  format: winston.format.printf(
    (log) =>
      `[${log.level.toUpperCase()}] - ${path.basename(__filename)} - ${log.message} ${new Date(Date.now()).toUTCString()}`
  ),
});

function shuffleArray(array) {
  for (let i = array.length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

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

    let list = interaction.options.get("list").value.split(",");
    list = list.map((item) => item.trim());
    list = list.filter((item) => item !== "");

    const amount = interaction.options.get("amount")?.value || 1;
    if (amount < 1) {
      await interaction.editReply({
        content: `Amount must be a positive integer`,
      });
      return;
    } else if (amount > list.length) {
      await interaction.editReply({
        content: `Amount must be less than or equal to the number of items in the list`,
      });
      return;
    }

    shuffleArray(list);

    try {
      await interaction.editReply({
        content: `${list.slice(0, amount).join(", ")}`,
      });
    } catch (error) {
      await interaction.editReply({
        content: `Bot Error, Try again later`,
      });
      logger.log("error", `There was an error picking a random item:\n${error}`);
      console.log(error);
    }
  }, // What the bot replies with

  name: "pick", // Name of the command
  description: "Pick a random item from a list", // Description of the command
  // devOnly: true, // Is a dev only command
  // testOnly: true, // Is a test command
  usage: "/pick [list]", // How to use this command. [required], (optional)
  example: "/pick 1, two, 삼, fjórir, fünf, seks, 七", // Example of how to run this command
  options: [
    {
      name: "list",
      description: "Comma (,) separated list of items to choose from",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "amount",
      description: "Number of items to pick",
      type: ApplicationCommandOptionType.Integer,
    },
  ], // Input options
  // deleted: true, // If the command is no longer in use
  // permissionsRequired: [], // What permissions are needed to run the command
  botPermissions: [PermissionFlagsBits.SendMessages], // What permissions the bot needs to run the command
};
