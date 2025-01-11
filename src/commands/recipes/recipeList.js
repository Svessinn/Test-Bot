/*
 * If this command isn't working for you or you just don't understnad it
 * Look at the `recipe.js` file and read the header
 * Once followed this command will work
 */
const { Client, Interaction, PermissionFlagsBits, ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const path = require("path");
const getAllFiles = require("../../utils/getAllFiles");

// Logging tool
const winston = require("winston");
const logger = winston.createLogger({
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: `logs/log.log` })],
  format: winston.format.printf(
    (log) =>
      `[${log.level.toUpperCase()}] - ${path.basename(__filename)} - ${log.message} ${new Date(Date.now()).toUTCString()}`
  ),
});

const allCuisines = getAllFiles(path.join(__dirname, "../../recipes"), true);
let recipes = {};
let availableCuisines = [];
let cuisines = [];

for (const cuisine of allCuisines) {
  let recipeList = [];

  for (const recipe of getAllFiles(cuisine)) {
    recipeList.push(recipe.split("\\").splice(-1).join().split(".")[0]);
  }

  if (recipeList.length) {
    const Cuisine = cuisine.split("\\").splice(-1).join();
    availableCuisines.push({
      name: Cuisine,
      description: `View a list of ${Cuisine.charAt(0).toUpperCase() + Cuisine.slice(1)} recipes`,
      type: ApplicationCommandOptionType.Subcommand,
    });
    cuisines.push(Cuisine);
    recipes[Cuisine] = recipeList;
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

    try {
      let subcommand = interaction.options.getSubcommand();
      let outEmbed = new EmbedBuilder();

      for (const cuisine of cuisines) {
        if (subcommand === cuisine) {
          outEmbed.setTitle(`${cuisine.charAt(0).toUpperCase() + cuisine.slice(1)} Recipes`);
          let outDescription = ``;

          for (const recipe of recipes[cuisine]) {
            const Recipe = require(`../../recipes/${cuisine}/${recipe}`);
            outDescription += `\n${Recipe.name}`;
          }

          outEmbed.setDescription(outDescription);

          await interaction.editReply({
            embeds: [outEmbed],
          });
          return;
        }
      }

      await interaction.editReply({
        content: `WIP\nNo recipes yet`,
      });
      return;
    } catch (error) {
      await interaction.editReply({
        content: `Bot Error, Try again later`,
      });
      logger.log("error", `There was an error getting recipes:\n${error}`);
      console.log(error);
      return;
    }
  }, // What the bot replies with

  name: "recipe-list", // Name of the command
  description: "View the list of recipes", // Description of the command
  // devOnly: true, // Is a dev only command
  // testOnly: true, // Is a test command
  usage: "/recipe-list [cuisine]", // How to use this command. [required], (optional)
  example: "/recipe-list indian", // Example of how to run this command
  options: availableCuisines, // Input options
  // deleted: true, // If the command is no longer in use
  // permissionsRequired: [], // What permissions are needed to run the command
  botPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks], // What permissions the bot needs to run the command
};
