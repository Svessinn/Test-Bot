const { ActivityType, Client } = require("discord.js");

let status = [
  {
    name: "Development", // Activity name
    type: ActivityType.Streaming,
    url: "https://twitch.tv/TheSvess",
  },
];

/**
 * @param {Client} client
 */

module.exports = (client) => {
  /*
   * if there are multiple activities in the status it'll cycle through them at random
   */
  setInterval(() => {
    let random = Math.floor(Math.random() * status.length);
    client.user.setActivity(status[random]);
  }, 60000);
};
