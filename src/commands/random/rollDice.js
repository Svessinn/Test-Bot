const { Client, Interaction, PermissionFlagsBits, ApplicationCommandOptionType } = require("discord.js");
const path = require("path");
const roll = require("../../utils/rollDice");

// Logging tool
const winston = require("winston");
const logger = winston.createLogger({
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: `logs/log.log` })],
  format: winston.format.printf(
    (log) => `[${log.level.toUpperCase()}] - ${path.basename(__filename)} - ${log.message} ${new Date(Date.now()).toUTCString()}`
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

    await interaction.deferReply({
      ephemeral: false,
    });

    const rolled = roll(interaction.options.get("dice-to-roll").value);

    let out = `Rolled ${rolled?.length || 0} dice: `;
    let tot = 0;

    if (!rolled) {
      out = "Invalid dice";
    } else {
      for (dieRoll of rolled) {
        tot += dieRoll;
        out += `${dieRoll} `;
      }
      out += `\nTotal: ${tot}`;
    }

    try {
      await interaction.editReply({
        content: out,
        // embeds: [],
      });
    } catch (error) {
      await interaction.editReply({
        content: `Bot Error, Try again later`,
      });
      logger.log("error", `There was an error :\n${error}`);
      console.log(error);
    }
  }, // What the bot replies with

  name: "roll-dice", // Name of the command
  description: "Roll Dice", // Description of the command
  devOnly: true, // Is a dev only command
  // testOnly: true, // Is a test command
  usage: "/roll-dice [dice-to-roll]", // How to use this command. [required], (optional)
  example: "/roll-dice 2d6", // Example of how to run this command
  options: [
    {
      name: "dice-to-roll",
      description: "What to roll (1d6) = 1 6 sided die, (2d20) = 2 20 side dice",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ], // Input options
  // deleted: true, // If the command is no longer in use
  // permissionsRequired: [], // What permissions are needed to run the command
  botPermissions: [PermissionFlagsBits.SendMessages], // What permissions the bot needs to run the command
};
