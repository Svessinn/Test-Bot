require("dotenv").config();
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
const winston = require("winston");
const getLevel = require("./getUserLevelData");
const calcLevelExp = require("../utils/calculateLevelExp");
const updateUserLevel = require("./updateUserLevel");

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

module.exports = async (userID, guildID, expToGive) => {
  const level = await getLevel(userID, guildID);

  let { data, error } = await supabase
    .from("Levels")
    .update({
      exp: level.exp + expToGive,
    })
    .match({
      userId: userID,
      guildId: guildID,
    })
    .select();

  if (data[0]) {
    const expForNext = calcLevelExp(data[0].level);
    if (data[0].exp >= expForNext) {
      const newData = await updateUserLevel(data[0].userId, data[0].guildId);
      return newData;
    } else {
      return data[0];
    }
  }

  if (error) {
    logger.log("error", error);
    console.log(userID, guildID);
    console.log(error);
  }
  return;
};
