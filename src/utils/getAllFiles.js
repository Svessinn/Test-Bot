/*
Gets all files/folders
*/

const fs = require("fs");
const path = require("path");

/**
 * @param {String} directory
 * @param {Boolean} foldersOnly
 * @return {Array} Array of files.
 */

module.exports = (directory, foldersOnly = false) => {
  let fileNames = [];

  const files = fs.readdirSync(directory, { withFileTypes: true });

  for (const file of files) {
    const filePath = path.join(directory, file.name);

    if (foldersOnly) {
      if (file.isDirectory()) {
        fileNames.push(filePath);
      }
    } else {
      if (file.isFile()) {
        fileNames.push(filePath);
      }
    }
  }

  return fileNames;
};
