require("dotenv").config();
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
const winston = require("winston");
const getLevel = require("./getUserLevelData");
const calcLevelExp = require("../utils/calculateLevelExp");

// Logging tool
const logger = winston.createLogger({
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: `logs/log.log` })],
  format: winston.format.printf(
    (log) =>
      `[${log.level.toUpperCase()}] - ${path.basename(__filename)} - ${log.message} ${new Date(Date.now()).toUTCString()}`
  ),
});

// Connecting to supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Fetches all levels from the "Levels" table in the Supabase database.
 *
 * @returns {Promise<Array|undefined>} A promise that resolves to an array of levels if successful, or undefined if an error occurs.
 */
module.exports = async () => {
  let { data, error } = await supabase.from("Levels").select();

  if (data) {
    return data;
  }

  if (error) {
    logger.log("error", error);
    console.log(error);
  }
  return;
};
