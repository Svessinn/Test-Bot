const { Client, Interaction, ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");
const path = require("path");
const getLogChannel = require("../../queries/getGuildLogChannel");
const upsertLogChannel = require("../../queries/upsertGuildLogChannel");
const addEventLogger = require("../../queries/addGuildEventLogger");
const deleteEventLogger = require("../../queries/deleteGuildEventLogger");

// Logging tool
const winston = require("winston");
const logger = winston.createLogger({
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: `logs/log.log` })],
  format: winston.format.printf(
    (log) =>
      `[${log.level.toUpperCase()}] - ${path.basename(__filename)} - ${log.message} ${new Date(Date.now()).toUTCString()}`
  ),
});

// If it's commented out it means that the logger for it isn't ready
// Only 25 options are allowed for each choice
// Create a new subcommand and a new Array if you need more logs
const logEvents = [
  { name: "Audit Log", value: "guildAuditLogEntryCreate" },
  { name: "Channel Create", value: "channelCreate" },
  { name: "Channel Delete", value: "channelDelete" },
  { name: "Channel Update", value: "channelUpdate" },
  // { name: 'Emoji Create', value: 'emojiCreate' },
  // { name: 'Emoji Delete', value: 'emojiDelete' },
  // { name: 'Event Create',value: 'guildScheduledEventCreate' },
  // { name: 'Event Delete',value: 'guildScheduledEventDelete' },
  // { name: 'Event Update',value: 'guildScheduledEventUpdate' },
  { name: "Invite Create", value: "inviteCreate" },
  { name: "Message Bulk Delete", value: "messageDeleteBulk" },
  { name: "Message Delete", value: "messageDelete" },
  { name: "Message Edit", value: "messageUpdate" },
  { name: "Role Create", value: "roleCreate" },
  { name: "Role Delete", value: "roleDelete" },
  { name: "Role Update", value: "roleUpdate" },
  // { name: 'Sticker Create', value: 'stickerCreate' },
  // { name: 'Sticker Delete', value: 'stickerDelete' },
  // { name: 'Thread Create', value: 'threadCreate' },
  // { name: 'Thread Delete', value: 'threadDelete' },
  { name: "User Ban", value: "guildBanAdd" },
  { name: "User Join", value: "guildMemberAdd" },
  { name: "User Leave", value: "guildMemberRemove" },
  { name: "User Unban", value: "guildBanRemove" },
  { name: "User Update", value: "guildMemberUpdate" },
];

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

    let subcommand = interaction.options.getSubcommand();

    if (subcommand === "channel") {
      try {
        const channelId = interaction.options.get("channel").value;
        await upsertLogChannel(interaction.guild.id, channelId);
        await interaction.editReply({ content: `Successfully set <#${channelId}> as log channel` });
      } catch (error) {
        await interaction.editReply({
          content: `Bot Error, Try again later`,
        });
        logger.log("error", `There was an error upserting Log Channel:\n${error}`);
        console.log(error);
      }
      return;
    }

    const logChannel = await getLogChannel(interaction.guild.id);
    if (!logChannel) {
      interaction.editReply(
        "Please set up a log channel before enabling logs\nUse the `/event-logger channel` command to do so"
      );
      return;
    }

    const event = interaction.options.get("event").value;
    const eventName = (event.charAt(0).toUpperCase() + event.slice(1)).match(/[A-Z][a-z]+/g).join(" ");

    if (subcommand === "enable") {
      try {
        let eventLogger = await addEventLogger(interaction.guild.id, event);
        if (eventLogger) {
          await interaction.editReply({ content: `Successfully enabled event logger for ${eventName}` });
        } else {
          await interaction.editReply({ content: `${eventName} is already enabled` });
        }
      } catch (error) {
        await interaction.editReply({
          content: `Bot Error, Try again later`,
        });
        logger.log("error", `There was an error enabling event logger:\n${error}`);
        console.log(error);
      }
      return;
    }

    if (subcommand === "disable") {
      try {
        await deleteEventLogger(interaction.guild.id, event);
        await interaction.editReply({ content: `Successfully disabled event logger for ${eventName}` });
      } catch (error) {
        await interaction.editReply({
          content: `Bot Error, Try again later`,
        });
        logger.log("error", `There was an error disabling event logger:\n${error}`);
        console.log(error);
      }
      return;
    }

    await interaction.editReply({
      content: `How'd you get here??\nLEAVE! NOW!`,
    });
    return;
  }, // What the bot replies with

  name: "event-logger", // Name of the command
  description: "Log events", // Description of the command
  // devOnly: true, // Is a dev only command
  // testOnly: true, // Is a test command
  usage: "/event-logger channel [channel]\n/event-logger enable [event]\n/event-logger disable [event]", // How to use this command. [required], (optional)
  example: `/event-logger channel 1137315708406091776\n/event-logger enable Role Create\n/event-logger disable User Join`, // Example of how to run this command
  options: [
    {
      name: "channel",
      description: "Select a log channel",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "channel",
          description: "Set a log channel",
          type: ApplicationCommandOptionType.Channel,
          required: true,
        },
      ],
    },
    {
      name: "enable",
      description: "Enable an event logger",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "event",
          description: "Select an event to enable logging",
          type: ApplicationCommandOptionType.String,
          required: true,
          choices: logEvents,
        },
      ],
    },
    {
      name: "disable",
      description: "Disable an event logger",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "event",
          description: "Select an event to disable logging",
          type: ApplicationCommandOptionType.String,
          required: true,
          choices: logEvents,
        },
      ],
    },
  ], // Input options
  // deleted: true, // If the command is no longer in use
  permissionsRequired: [PermissionFlagsBits.Administrator], // What permissions are needed to run the command
  botPermissions: [PermissionFlagsBits.SendMessages], // What permissions the bot needs to run the command
};
