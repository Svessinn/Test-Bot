const responses = [
  "https://media1.tenor.com/images/969f0f462e4b7350da543f0231ba94cb/tenor.gif?itemid=14246498",
  "https://media.giphy.com/media/od5H3PmEG5EVq/giphy.gif",
  "https://media.giphy.com/media/ZQN9jsRWp1M76/giphy.gif",
  "https://media.giphy.com/media/yziFo5qYAOgY8/giphy.gif",
  "https://media.giphy.com/media/IRUb7GTCaPU8E/giphy.gif",
  "https://media.giphy.com/media/143v0Z4767T15e/giphy.gif",
  "https://media.giphy.com/media/l2QDM9Jnim1YVILXa/giphy.gif",
  "https://media.giphy.com/media/EvYHHSntaIl5m/giphy.gif",
  "https://media.giphy.com/media/wnsgren9NtITS/giphy.gif",
];

module.exports = () => {
  return responses[Math.floor(Math.random() * responses.length)];
};
