const responses = [
  "https://c.tenor.com/F6ekeSqr9OsAAAAd/renge-shrug.gif",
  "https://c.tenor.com/U06tekgz-OQAAAAd/city-hunter-ryo-saeba.gif",
  "https://c.tenor.com/ZaxUeXcUtDkAAAAd/shrug-smug.gif",
  "https://c.tenor.com/nlSDG33ptOoAAAAC/geto-suguru.gif",
  "https://c.tenor.com/0GOwPHgcUj0AAAAC/anime-shrug.gif",
  "https://c.tenor.com/HtRb68DqNPwAAAAC/little-witch-academia-sucy.gif",
  "https://c.tenor.com/zYK9-2LYTiYAAAAC/idk-killua.gif",
  "https://c.tenor.com/e1uPTuA2toIAAAAC/kana-shrug.gif",
  "https://c.tenor.com/Zw_dz8zbaWIAAAAC/koakuma-touhou.gif",
  "https://c.tenor.com/SxvUPdLQfrgAAAAC/uzaki-chan-uzaki.gif",
];

/**
 * @return {String}
 */

module.exports = () => {
  return responses[Math.floor(Math.random() * responses.length)];
};
