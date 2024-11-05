require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const path = require("path");
const winston = require("winston");
const levels = require("../queries/getGuildLevelRoles");

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

module.exports = async (guildID, Event) => {
  const roles = await levels(guildID);

  if (roles.length <= 25) {
    let { data, error } = await supabase
      .from("EventLoggers")
      .insert({
        guildId: guildID,
        event: Event,
      })
      .select();

    if (data) {
      return data[0];
    }

    if (error) {
      if (error.code === "23505") return; // duplicate key, there was already an event logger for the event
      logger.log("error", error);
    }
  }
  return;
};
