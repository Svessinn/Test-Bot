const responses = [
  "https://media1.tenor.com/m/F6ekeSqr9OsAAAAd/renge-shrug.gif",
  "https://media1.tenor.com/m/U06tekgz-OQAAAAd/city-hunter-ryo-saeba.gif",
  "https://media1.tenor.com/m/ZaxUeXcUtDkAAAAd/shrug-smug.gif",
  "https://media1.tenor.com/m/nlSDG33ptOoAAAAC/geto-suguru.gif",
  "https://media1.tenor.com/m/0GOwPHgcUj0AAAAC/anime-shrug.gif",
  "https://media1.tenor.com/m/HtRb68DqNPwAAAAC/little-witch-academia-sucy.gif",
  "https://media1.tenor.com/m/zYK9-2LYTiYAAAAC/idk-killua.gif",
  "https://media1.tenor.com/m/e1uPTuA2toIAAAAC/kana-shrug.gif",
  "https://media1.tenor.com/m/Zw_dz8zbaWIAAAAC/koakuma-touhou.gif",
  "https://media1.tenor.com/m/SxvUPdLQfrgAAAAC/uzaki-chan-uzaki.gif",
];

module.exports = () => {
  return responses[Math.floor(Math.random() * responses.length)];
};
