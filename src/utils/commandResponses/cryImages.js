const responses = [
  "https://media1.tenor.com/m/lmA7VALYIAsAAAAC/sad-pikachu.gif", // Sad Pikachu
  "https://media1.tenor.com/m/jotyiHEoUGUAAAAC/anime.gif", // Umaru Doma crying
  "https://media1.tenor.com/m/0qj0aqZ0nucAAAAC/anya-spy-x-family-anime-anya-crying.gif", // Anya crying
  "https://media1.tenor.com/m/35S_M89zT3sAAAAC/horimiya-anime.gif", // Remi crying
  "https://media1.tenor.com/m/Vs9QNG3lQZUAAAAC/luffy-one-piece.gif", // Luffy crying
  "https://media1.tenor.com/m/PhUSf6rVeyAAAAAd/bocchi-the-rock-crying.gif", // Bocchi crying
  "https://media1.tenor.com/m/obRT1_mObv4AAAAC/hugging-while-crying-funny.gif", // Sawade hugging Hori while crying
  "https://media1.tenor.com/m/c1PMAiegtCkAAAAd/violet-evergarden-violet.gif", // Violæet Evergarden crying
  "https://media1.tenor.com/m/A0g9Rrx4aNsAAAAC/sad-angry.gif", // Taiga Aisaka crying
  "https://media1.tenor.com/m/vEcyUvOTLI4AAAAC/adeus-volte-sempre.gif",
  "https://media.tenor.com/lLhOcgJ4X-wAAAAi/kh%C3%B3c.gif", // Crying blue animal
  "https://media1.tenor.com/m/ihCWOrPTJ9oAAAAC/crying-nozo.gif",
  "https://media1.tenor.com/m/tMyM-A8PGRQAAAAC/aqua-konosuba.gif", // Aqua crying
  "https://media1.tenor.com/m/FM6cAbvsrbEAAAAC/jujutsu-kaisen-shibuya-arc-choso-shibuya-arc.gif", // Choso crying
  "https://media1.tenor.com/m/uJtAGe-mwP4AAAAd/oshi-no-ko-akane-kurokawa.gif", // Akane crying
  "https://media1.tenor.com/m/FXq5be_Q7oUAAAAC/anime-anime-cry.gif",
  "https://media1.tenor.com/m/XBWh-szFwDQAAAAC/crying-naruto-crying.gif", // Naruto crying
  "https://media1.tenor.com/m/yP1BPY4fMdYAAAAd/mob-psycho100-mob-psycho.gif", // Mob crying
  "https://media1.tenor.com/m/AEiv3Qk2ZhgAAAAC/kawaii-sad.gif", // Umaru Doma crying
];

module.exports = () => {
  return responses[Math.floor(Math.random() * responses.length)];
};
