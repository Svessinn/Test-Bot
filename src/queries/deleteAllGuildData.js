require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const path = require("path");
const winston = require("winston");
const delLevelChannel = require("./deleteGuildLevelChannel");
const delLevels = require("./deleteGuildLevels");
const delLevelRoles = require("./deleteGuildLevelRoles");
const delWarnings = require("./deleteGuildWarnings");
const delWarnPunishments = require("./deleteGuildWarnPunishments");

// Logging tool
const logger = winston.createLogger({
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: `logs/log.log` })],
  format: winston.format.printf(
    (log) => `[${log.level.toUpperCase()}] - ${path.basename(__filename)} - ${log.message} ${new Date(Date.now()).toUTCString()}`
  ),
});

// Connecting to supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = async (guildID) => {
  try {
    await delLevelChannel(guildID);
    await delLevels(guildID);
    await delLevelRoles(guildID);
    await delWarnings(guildID);
    await delWarnPunishments(guildID);

    logger.log("info", `Deleted all data associated with ${guildID}`);
  } catch (error) {
    logger.log("error", `There was an error deleting all guild data\n${error}`);
    console.log(error);
  }
};
