const { ActivityType, Client } = require("discord.js");
const path = require("path");

let status = [
  {
    name: "Development", // Activity name
    type: ActivityType.Streaming,
    url: "https://twitch.tv/TheSvess",
  },
];

/**
 *
 * @param {Client} client
 */

module.exports = (client) => {
  setInterval(() => {
    let random = Math.floor(Math.random() * status.length);
    client.user.setActivity(status[random]);
  }, 60000);
};
