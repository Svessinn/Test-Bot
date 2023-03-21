/*
Gets all local commands
*/

const path = require("path");
const getAllFiles = require("./getAllFiles");

module.exports = (subCategory, exceptions = []) => {
  let localCommands = [];
  const folder = path.join(__dirname, "..", "commands");

  let commandCategories = getAllFiles(folder, true);

  if (subCategory) {
    let categories = [];
    commandCategories.forEach((cat) => {
      if (cat.endsWith(subCategory)) {
        categories.push(cat);
      }
    });
    commandCategories = categories;
  }
  for (const commandCategory of commandCategories) {
    const commandFiles = getAllFiles(commandCategory);

    for (const commandFile of commandFiles) {
      const commandObject = require(commandFile);

      if (exceptions.includes(commandObject.name)) {
        continue;
      }
      localCommands.push(commandObject);
    }
  }

  return localCommands;
};
