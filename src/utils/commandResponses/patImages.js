const responses = [
  "https://media1.tenor.com/m/x36w4wZx1JcAAAAC/pikachu-sadness.gif",
  "https://media1.tenor.com/m/VkGmDfmt-tQAAAAC/izuna-blue-archive.gif",
  "https://media1.tenor.com/m/8DaE6qzF0DwAAAAC/neet-anime.gif",
  "https://media1.tenor.com/m/fro6pl7src0AAAAC/hugtrip.gif",
  "https://media1.tenor.com/m/Dbg-7wAaiJwAAAAC/aharen-aharen-san.gif",
  "https://media1.tenor.com/m/pvF8xcytu1YAAAAC/pat.gif",
  "https://media1.tenor.com/m/E6fMkQRZBdIAAAAC/kanna-kamui-pat.gif",
  "https://media1.tenor.com/m/oGbO8vW_eqgAAAAC/spy-x-family-anya.gif",
  "https://media1.tenor.com/m/7xrOS-GaGAIAAAAC/anime-pat-anime.gif",
  "https://media1.tenor.com/m/7xrOS-GaGAIAAAAC/anime-pat-anime.gif",
  "https://media1.tenor.com/m/V1Txxwwe0d8AAAAC/anime-head-pat-anime.gif",
  "https://media1.tenor.com/m/2ruC-b5vX68AAAAC/anime-pat.gif",
];

https: module.exports = () => {
  return responses[Math.floor(Math.random() * responses.length)];
};
