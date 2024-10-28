require("dotenv").config();
const path = require("path");
const winston = require("winston");
const delLevelChannel = require("./deleteGuildLevelChannel");
const delLevelRoles = require("./deleteGuildLevelRoles");
const delLevels = require("./deleteGuildLevels");
const delWarnPunishments = require("./deleteGuildWarnPunishments");
const delWarnings = require("./deleteGuildWarnings");
const delWelcomeChannel = require("./deleteGuildWelcomeChannel");
const delWelcomeEmbed = require("./deleteGuildWelcomeEmbed");

// Logging tool
const logger = winston.createLogger({
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: `logs/log.log` })],
  format: winston.format.printf(
    (log) => `[${log.level.toUpperCase()}] - ${path.basename(__filename)} - ${log.message} ${new Date(Date.now()).toUTCString()}`
  ),
});

module.exports = async (guildID) => {
  try {
    await delLevelChannel(guildID);
    await delLevels(guildID);
    await delLevelRoles(guildID);
    await delWarnPunishments(guildID);
    await delWarnings(guildID);
    await delWelcomeChannel(guildID);
    await delWelcomeEmbed(guildID);

    logger.log("info", `Deleted all data associated with ${guildID}`);
  } catch (error) {
    logger.log("error", `There was an error deleting all guild data\n${error}`);
    console.log(error);
  }
};
