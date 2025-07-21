const responses = [
  "https://c.tenor.com/lmA7VALYIAsAAAAC/tenor.gif", // Sad Pikachu
  "https://c.tenor.com/jotyiHEoUGUAAAAC/anime.gif", // Umaru Doma crying
  "https://c.tenor.com/0qj0aqZ0nucAAAAC/anya-spy-x-family-anime-anya-crying.gif", // Anya crying
  "https://c.tenor.com/35S_M89zT3sAAAAC/horimiya-anime.gif", // Remi crying
  "https://c.tenor.com/Vs9QNG3lQZUAAAAC/luffy-one-piece.gif", // Luffy crying
  "https://c.tenor.com/PhUSf6rVeyAAAAAd/bocchi-the-rock-crying.gif", // Bocchi crying
  "https://c.tenor.com/obRT1_mObv4AAAAC/hugging-while-crying-funny.gif", // Sawade hugging Hori while crying
  "https://c.tenor.com/c1PMAiegtCkAAAAd/violet-evergarden-violet.gif", // Violet Evergarden crying
  "https://c.tenor.com/A0g9Rrx4aNsAAAAC/sad-angry.gif", // Taiga Aisaka crying
  "https://c.tenor.com/vEcyUvOTLI4AAAAC/adeus-volte-sempre.gif",
  "https://media.tenor.com/lLhOcgJ4X-wAAAAi/kh%C3%B3c.gif", // Crying blue animal
  "https://c.tenor.com/ihCWOrPTJ9oAAAAC/crying-nozo.gif",
  "https://c.tenor.com/tMyM-A8PGRQAAAAC/aqua-konosuba.gif", // Aqua crying
  "https://c.tenor.com/FM6cAbvsrbEAAAAC/jujutsu-kaisen-shibuya-arc-choso-shibuya-arc.gif", // Choso crying
  "https://c.tenor.com/uJtAGe-mwP4AAAAd/oshi-no-ko-akane-kurokawa.gif", // Akane crying
  "https://c.tenor.com/FXq5be_Q7oUAAAAC/anime-anime-cry.gif",
  "https://c.tenor.com/XBWh-szFwDQAAAAC/crying-naruto-crying.gif", // Naruto crying
  "https://c.tenor.com/yP1BPY4fMdYAAAAd/mob-psycho100-mob-psycho.gif", // Mob crying
  "https://c.tenor.com/AEiv3Qk2ZhgAAAAC/kawaii-sad.gif", // Umaru Doma crying
];

/**
 * @return {String}
 */

module.exports = () => {
  return responses[Math.floor(Math.random() * responses.length)];
};
