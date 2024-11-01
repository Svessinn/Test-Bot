const { Client, Interaction, PermissionFlagsBits, ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const path = require("path");
const addGuildWarnPunishment = require("../../queries/addGuildWarningPunishment");
const delGuildWarnPunishment = require("../../queries/deleteGuildWarningPunishment");
const getGuildWarnPunishments = require("../../queries/getGuildWarningPunishments");
const ms = require("ms");

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
    const { default: prettyMs } = await import("pretty-ms");
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

    let punishEmbed = new EmbedBuilder().setTimestamp().setColor("Blurple").setFooter({
      text: interaction.guild.name,
      iconURL: interaction.guild.iconURL(),
    });

    let subcommand = interaction.options.getSubcommand();

    let out = "";
    if (subcommand === "get") {
      punishEmbed.setTitle("Warning Punishments");
      try {
        const guildWarnPunishments = await getGuildWarnPunishments(interaction.guild.id);

        guildWarnPunishments.forEach((gwp) => {
          out += `For __**${gwp.warnings}** warnings__ the punishment is being `;

          if (gwp.punishment === "timeout") {
            let pretty = prettyMs(gwp.time, { verbose: true });

            out += `timed out for ${pretty}\n`;
          } else {
            out += `${gwp.punishment === "kick" ? "kick" : gwp.punishment + "n"}ed from the server\n`;
          }
        });
        punishEmbed.setDescription(out);
        await interaction.editReply({
          embeds: [punishEmbed],
        });
      } catch (error) {
        await interaction.editReply({
          content: `Bot Error, Try again later`,
        });
        logger.log("error", `There was an error :\n${error}`);
        console.log(error);
      }
    } else if (subcommand === "add") {
      const type = interaction.options.get("type").value;
      const warns = await interaction.options.get("warnings").value;
      let duration = null;
      let msDuration = null;
      punishEmbed.setTitle("Added warning punishment");
      if (type === "ban") {
        punishEmbed.setDescription(`**Type: Ban**\nPunishment at __**${warns}** warnings__`);
      } else if (type === "softban") {
        punishEmbed.setDescription(`**Type: Softban**\nPunishment at __**${warns}** warnings__`);
      } else if (type === "kick") {
        punishEmbed.setDescription(`**Type: Kick**\nPunishment at __**${warns}** warnings__`);
      } else if (type === "timeout") {
        duration = interaction.options.get("timeout-duration")?.value || "300000";
        msDuration = ms(duration);
        let pretty = prettyMs(msDuration, { verbose: true });
        punishEmbed.setDescription(`**Type: Timeout for ${pretty}**\nPunishment at __**${warns}** warnings__`);
      }
      try {
        await addGuildWarnPunishment(interaction.guild.id, warns, type, msDuration);
        await interaction.editReply({
          embeds: [punishEmbed],
        });
      } catch (error) {
        await interaction.editReply({
          content: `Bot Error, Try again later`,
        });
        logger.log("error", `There was an error :\n${error}`);
        console.log(error);
      }
    } else if (subcommand === "delete") {
      const warns = interaction.options.get("warnings").value;
      const guildWarnPunishments = await getGuildWarnPunishments(interaction.guild.id);
      const del = guildWarnPunishments.find((w) => (w.warnings = warns));
      punishEmbed.setTitle("Deleted warning punishment").setDescription(`For __**${del.warnings}** warnings__`);

      try {
        await delGuildWarnPunishment(interaction.guild.id, warns);
        await interaction.editReply({
          embeds: [punishEmbed],
        });
      } catch (error) {
        await interaction.editReply({
          content: `Bot Error, Try again later`,
        });
        logger.log("error", `There was an error :\n${error}`);
        console.log(error);
      }
    }
  }, // What the bot replies with

  name: "warn-punishment", // Name of the command
  description: "Manage warning punishments", // Description of the command
  devOnly: true, // Is a dev only command
  // testOnly: true, // Is a test command
  usage: "/warn-punishment get\n/warn-punishment add [type] [warnings] (timeout-duration)\n/warn-punishment delete [warnings]", // How to use this command. [required], (optional)
  example: "/warn-punishment get\n/warn-punishment add [type] [warnings] (timeout-duration)\n/warn-punishment delete [warnings]", // Example of how to run this command
  options: [
    {
      name: "get",
      description: "Get a list of all warning punishments",
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "add",
      description: "Add a warning punishment",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "type",
          description: "Select a type of warning",
          type: ApplicationCommandOptionType.String,
          required: true,
          choices: [
            {
              name: "Ban",
              value: "ban",
            },
            {
              name: "Softban",
              value: "softban",
            },
            {
              name: "Kick",
              value: "kick",
            },
            {
              name: "Timeout",
              value: "timeout",
            },
          ],
        },
        {
          name: "warnings",
          description: "How many warnings for this punishment to take place",
          type: ApplicationCommandOptionType.Integer,
          required: true,
        },
        {
          name: "timeout-duration",
          description: "How long to timeout the user (default 5 minutes)",
          type: ApplicationCommandOptionType.String,
        },
      ],
    },
    {
      name: "delete",
      description: "Delete a warning punishment",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "warnings",
          description: "Delete the punishment for this amount of warnings",
          type: ApplicationCommandOptionType.Integer,
          required: true,
        },
      ],
    },
  ], // Input options
  // deleted: true, // If the command is no longer in use
  permissionsRequired: [PermissionFlagsBits.Administrator], // What permissions are needed to run the command
  botPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks], // What permissions the bot needs to run the command
};
