require("dotenv").config();
const { ShardingManager } = require("discord.js");
const TOKEN = process.env.TOKEN;
const path = require("path");

// Logging tool
const winston = require("winston");
const logger = winston.createLogger({
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: `logs/log.log` })],
  format: winston.format.printf(
    (log) =>
      `[${log.level.toUpperCase()}] - ${path.basename(__filename)} - ${log.message} ${new Date(Date.now()).toUTCString()}`
  ),
});

// Creating a ShardingManager instance
const manager = new ShardingManager("./src/index.js", {
  totalShards: "auto",
  token: TOKEN,
  respawn: true,
});

manager.on("shardCreate", async (shard) => {
  shard.on("death", async () => {
    try {
      logger.log("info", `Shard ${shard.id} died`);
    } catch (error) {
      console.log(error);
    }
  });
  shard.on("disconnect", async () => {
    try {
      logger.log("info", `Shard ${shard.id} disconnected`);
    } catch (error) {
      console.log(error);
    }
  });
  shard.on("error", async (error) => {
    try {
      logger.log("error", `Shard ${shard.id} encountered an error: ${error}`);
    } catch (error) {
      console.log(error);
    }
  });
  shard.on("ready", async () => {
    try {
      logger.log("info", `Shard ${shard.id} ready`);
    } catch (error) {
      console.log(error);
    }
  });
  shard.on("reconnecting", async () => {
    try {
      logger.log("info", `Shard ${shard.id} reconnecting`);
    } catch (error) {
      console.log(error);
    }
  });
  shard.on("resume", async () => {
    try {
      logger.log("info", `Shard ${shard.id} resumed`);
    } catch (error) {
      console.log(error);
    }
  });
  shard.on("spawn", async () => {
    try {
      logger.log("info", `Shard ${shard.id} spawned`);
    } catch (error) {
      console.log(error);
    }
  });
});

manager.spawn();
