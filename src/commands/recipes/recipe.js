/*
 * This command is for displaying recipes
 * There are a few things that you NEED to do to be able to use this
 *
 * 1. Create a recipes floder in the src folder
 * 2. In that folder you should make folders for each of your cuisines, example: indian, chinese, french
 * 3. In each of those folders you should ONLY have .json files with your recipes
 *    The .json skeleton is:
 *    {
 *      "name":"",
 *      "ingredients":[""],
 *      "directions":[""],
 *      "serving_suggestions": [""],
 *      "equipment": [""],
 *      "serves":""
 *    }
 * 4. In the media folder you need to create a similar tree, except using .png instead of .json
 *
 * I am not sharing my recipes or images
 * If you don't intend on using this feature, just remove it at your leisure
 * Or toggle the `deleted` option at the botton of the command
 */

const {
  Client,
  Interaction,
  PermissionFlagsBits,
  ApplicationCommandOptionType,
  EmbedBuilder,
  AttachmentBuilder,
} = require("discord.js");
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
    let availableRecipes = [];
    const Cuisine = cuisine.split("\\").splice(-1).join();

    for (const recipe of getAllFiles(cuisine)) {
      const Recipe = require(recipe);

      availableRecipes.push({
        name: Recipe.name,
        value: recipe.split("\\").splice(-1).join().split(".")[0],
      });
    }

    availableCuisines.push({
      name: Cuisine,
      description: `View a list of ${Cuisine.charAt(0).toUpperCase() + Cuisine.slice(1)} recipes`,
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "recipe",
          description: "Select a recipe to view",
          type: ApplicationCommandOptionType.String,
          required: true,
          choices: availableRecipes,
        },
      ],
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
      let outEmbed = new EmbedBuilder().setColor("#7289DA");

      for (const cuisine of cuisines) {
        if (subcommand === cuisine) {
          const recipe = interaction.options.get("recipe").value;
          const Recipe = require(`../../recipes/${cuisine}/${recipe}`);

          let ingredients = `\u200b`;
          for (const ingredient of Recipe.ingredients) {
            ingredients += ingredient.length ? `• ${ingredient}\n` : "";
          }

          let equipment = `\u200b`;
          for (const equip of Recipe.equipment) {
            equipment += equip.length ? `• ${equip}\n` : "";
          }

          let servingSuggestions = `\u200b`;
          for (const suggestion of Recipe?.serving_suggestions || []) {
            servingSuggestions += suggestion.length ? `• ${suggestion}\n` : "";
          }

          outEmbed
            .setTitle(Recipe.name)
            .addFields(
              { name: "Ingredients:", value: ingredients },
              { name: "Serves", value: Recipe?.serves || "\u200b", inline: true },
              { name: "Equipment Needed:", value: equipment, inline: true },
              { name: "Serving Suggestions", value: servingSuggestions, inline: true }
            );

          let directions = `\u200b`;
          let idx = 1;
          let first = true;
          for (const direction of Recipe.directions) {
            directions += `**${idx}\\.** ${direction}\n\n`;
            idx += 1;
            if (directions.length >= 800) {
              outEmbed.addFields({ name: first ? "Directions" : "\u200b", value: directions });
              first = false;
              directions = `\u200b`;
            }
          }
          outEmbed.addFields({ name: first ? "Directions" : "\u200b", value: directions });

          const imageFileLocation = path.join(__dirname, `../../../media/recipes/${cuisine}/${recipe}.png`);
          let recipeImage;

          try {
            fs.access(imageFileLocation);
            recipeImage = new AttachmentBuilder(imageFileLocation, { name: `${recipe}.png` });
          } catch (error) {
            recipeImage = null;
            // console.log(`No image for ${cuisine}/${recipe}`);
          }

          if (recipeImage) {
            outEmbed.setThumbnail(`attachment://${recipeImage.name}`);
            await interaction.editReply({
              embeds: [outEmbed],
              files: [recipeImage],
            });
          } else {
            await interaction.editReply({
              embeds: [outEmbed],
            });
          }
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

  name: "recipe", // Name of the command
  description: "View recipe", // Description of the command
  // devOnly: true, // Is a dev only command
  // testOnly: true, // Is a test command
  usage: "/recipe [cuisine] [recipe]", // How to use this command. [required], (optional)
  example: "/recipe indian Chicken Tikka", // Example of how to run this command
  options: availableCuisines, // Input options
  // deleted: true, // If the command is no longer in use
  // permissionsRequired: [], // What permissions are needed to run the command
  botPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks], // What permissions the bot needs to run the command
};
