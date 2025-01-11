const { Client, Interaction, PermissionFlagsBits, ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const path = require("path");
const colourNameToHex = require("../../utils/colourToHex");

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

    await interaction.deferReply({});

    let subcommand = interaction.options.getSubcommand();
    let role = interaction.guild.roles.cache.get(interaction.options.get("role").value);

    let outEmbed = new EmbedBuilder()
      .setColor("#7289DA")
      .setTimestamp()
      .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
      .setTitle(`Edited role ${role.name}`);

    if (subcommand === "colour") {
      let colour = interaction.options.get("colour")?.value || null;

      if (colour && !/^#[0-9A-F]{6}$/i.test(colour)) {
        colour = await colourNameToHex(colour);
      }

      await role.setColor(colour);

      outEmbed.setDescription(`Set ${role}'s colour to **${colour?.toUpperCase() || "default"}**`);
    }

    if (subcommand === "name") {
      await role.setName(interaction.options.get("new-name").value);

      outEmbed.setDescription(`Set role name to **${role.name}**`);
    }

    if (subcommand === "icon") {
      let temp = interaction.options.get("new-icon-attachment")?.value || null;

      if (!temp) {
        temp = interaction.options.get("new-icon-emoji")?.value || null;
        if (temp) {
          temp = temp.split(":");

          if (temp[0] === "<a") {
            await interaction.editReply("Icon cannot be animated");

            return;
          } else {
            if (temp[0] !== "<" || temp.length !== 3) {
              try {
                await role.setUnicodeEmoji(temp[0]);

                outEmbed.setDescription(`Set ${role}'s icon to ${temp}`);

                try {
                  await interaction.editReply({
                    embeds: [outEmbed],
                  });

                  return;
                } catch (error) {
                  await interaction.editReply({
                    content: `Bot Error, Try again later`,
                  });

                  logger.log("error", `There was an error creating a new role:\n${error}`);

                  console.log(error);

                  return;
                }
              } catch (error) {
                await interaction.editReply("Icon needs to be an Emote from this guild or an Image");

                return;
              }
            }
          }
          temp = temp[temp.length - 1].slice(0, -1);
          temp = interaction.guild.emojis.cache.get(temp) || null;
        }

        await role.setIcon(temp);

        if (temp) {
          outEmbed.setDescription(`Set ${role}'s icon to ${temp}`);
        } else {
          outEmbed.setDescription(`Reset role icon for ${role}`);
        }
      } else {
        await role.setIcon(temp);

        outEmbed.setDescription(`Set ${role}'s icon to this image`).setImage(temp);
      }
    }

    if (subcommand === "hoist") {
      await role.setHoist(interaction.options.get("hoist").value);

      outEmbed.setDescription(`${interaction.options.get("hoist").value ? "Enabled" : "Disabled"} hoist for ${role}`);
    }

    if (subcommand === "mentionable") {
      await role.setMentionable(interaction.options.get("mentionable").value);

      outEmbed.setDescription(
        `${interaction.options.get("mentionable").value ? "Enabled" : "Disabled"} role mentions for ${role}`
      );
    }

    try {
      await interaction.editReply({
        // content: `Edited a role: ${role.name}`,
        embeds: [outEmbed],
      });
    } catch (error) {
      await interaction.editReply({
        content: `Bot Error, Try again later`,
      });
      logger.log("error", `There was an error creating a new role:\n${error}`);
      console.log(error);
    }
  }, // What the bot replies with

  name: "edit-role", // Name of the command
  description: "Edit a server role", // Description of the command
  devOnly: true, // Is a dev only command
  // testOnly: true, // Is a test command
  usage: "/edit-role [Role Name]", // How to use this command. [required], (optional)
  example: "/edit-role Moderator", // Example of how to run this command
  options: [
    {
      name: "colour",
      description: "Sets a new colour for the role (leave blank to remove colour)",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "role",
          description: "The role you want to edit",
          type: ApplicationCommandOptionType.Role,
          required: true,
        },
        {
          name: "colour",
          description: "Color for the role",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
      ],
    },
    {
      name: "name",
      description: "Sets a new name for the role",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "role",
          description: "The role you want to edit",
          type: ApplicationCommandOptionType.Role,
          required: true,
        },
        {
          name: "new-name",
          description: "The new name for the role",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
    {
      name: "icon",
      description: "Sets a new icon for the role (leave blank to remove the icon)",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "role",
          description: "The role you want to edit",
          type: ApplicationCommandOptionType.Role,
          required: true,
        },
        {
          name: "new-icon-attachment",
          description: "The new role icon (attachment)",
          type: ApplicationCommandOptionType.Attachment,
          required: false,
        },
        {
          name: "new-icon-emoji",
          description: "The new role icon (emoji)",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
      ],
    },
    {
      name: "hoist",
      description: "Sets whether or not the role should be hoisted (show separately in sidebar)",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "role",
          description: "The role you want to edit",
          type: ApplicationCommandOptionType.Role,
          required: true,
        },
        {
          name: "hoist",
          description: "Hoist or not?",
          type: ApplicationCommandOptionType.Boolean,
          required: true,
        },
      ],
    },
    {
      name: "mentionable",
      description: "Sets whether this role is mentionable",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "role",
          description: "The role you want to edit",
          type: ApplicationCommandOptionType.Role,
          required: true,
        },
        {
          name: "mentionable",
          description: "Metnionable or not?",
          type: ApplicationCommandOptionType.Boolean,
          required: true,
        },
      ],
    },
  ], // Input options
  // deleted: true, // If the command is no longer in use
  permissionsRequired: [PermissionFlagsBits.ManageRoles], // What permissions are needed to run the command
  botPermissions: [PermissionFlagsBits.ManageRoles, PermissionFlagsBits.EmbedLinks], // What permissions the bot needs to run the command
};
