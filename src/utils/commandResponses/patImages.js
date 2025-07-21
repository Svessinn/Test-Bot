const responses = [
  "https://c.tenor.com/x36w4wZx1JcAAAAC/pikachu-sadness.gif",
  "https://c.tenor.com/VkGmDfmt-tQAAAAC/izuna-blue-archive.gif",
  "https://c.tenor.com/8DaE6qzF0DwAAAAC/neet-anime.gif",
  "https://c.tenor.com/fro6pl7src0AAAAC/hugtrip.gif",
  "https://c.tenor.com/Dbg-7wAaiJwAAAAC/aharen-aharen-san.gif",
  "https://c.tenor.com/pvF8xcytu1YAAAAC/pat.gif",
  "https://c.tenor.com/E6fMkQRZBdIAAAAC/kanna-kamui-pat.gif",
  "https://c.tenor.com/oGbO8vW_eqgAAAAC/spy-x-family-anya.gif",
  "https://c.tenor.com/7xrOS-GaGAIAAAAC/anime-pat-anime.gif",
  "https://c.tenor.com/7xrOS-GaGAIAAAAC/anime-pat-anime.gif",
  "https://c.tenor.com/V1Txxwwe0d8AAAAC/anime-head-pat-anime.gif",
  "https://c.tenor.com/2ruC-b5vX68AAAAC/anime-pat.gif",
];

/**
 * @return {String}
 */

https: module.exports = () => {
  return responses[Math.floor(Math.random() * responses.length)];
};
