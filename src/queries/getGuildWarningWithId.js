require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const path = require("path");
const winston = require("winston");

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

module.exports = async (guildID, ID) => {
  let { data, error } = await supabase
    .from("Warnings")
    .select()
    .match({
      guildId: guildID,
      id: ID,
    })
    .order("id");

  if (data) {
    return data[0];
  }

  if (error) {
    logger.log("error", error);
  }
  return;
};
