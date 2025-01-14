const {
  Client,
  Interaction,
  EmbedBuilder,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");
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

    const deletionAmount = Math.min(Math.abs(interaction.options.get("amount").value), 100);

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    // Bulk Delete Messages
    try {
      await interaction.channel.bulkDelete(deletionAmount);

      let outContent =
        deletionAmount > 1
          ? `${deletionAmount} messages successfully deleted`
          : `${deletionAmount} message successfully deleted`;

      interaction.editReply({
        content: outContent,
        embeds: [new EmbedBuilder().setDescription(outContent)],
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      await interaction.editReply({
        content: `Bot Error, Try again later`,
        flags: MessageFlags.Ephemeral,
      });
      logger.log("error", `There was an error while purging messages:\n${error}`);
      console.log(error);
    }
  }, // What the bot replies with

  name: "purge", // Name of the command
  description: "Purges messages from this channel", // Description of the command
  // devOnly: true, // Is a dev only command
  // testOnly: true, // Is a test command
  usage: "/purge [amount]",
  example: "/purge 100",
  options: [
    {
      name: "amount",
      description: "Amount of messages to delete, 1-100",
      required: true,
      type: ApplicationCommandOptionType.Number,
    } /* 
    {
      name: "bots",
      description: "Only delete messages sent by bots",
      required: false,
      type: ApplicationCommandOptionType.Boolean,
    },
    {
      name: "contains",
      description: "Only delete messages containing specified input",
      required: false,
      type: ApplicationCommandOptionType.String,
    },
    {
      name: "embeds",
      description: "Only delete messages containing embeds",
      required: false,
      type: ApplicationCommandOptionType.Boolean,
    },
    {
      name: "user",
      description: "Only delete messages from a specific user",
      required: false,
      type: ApplicationCommandOptionType.User,
    }, */,
  ], // Input options
  // deleted: true, // If the command is no longer in use
  permissionsRequired: [PermissionFlagsBits.ManageMessages], // What permissions are needed to run the command
  botPermissions: [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.SendMessages], // What permissions the bot needs to run the command
};
