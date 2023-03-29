const responses = [
  "https://i.pinimg.com/originals/bc/ee/bf/bceebfa72d3a5933cb0e9cf319bb67ae.gif",
  "https://media.tenor.com/-JKgXtlAQo8AAAAC/slap-anime.gif",
  "https://media1.tenor.com/images/5ab22ca640af20cd3b479694bde9e25c/tenor.gif?itemid=4961067",
  "https://media.tenor.com/Ws6Dm1ZW_vMAAAAC/girl-slap.gif",
  "https://media.tenor.com/jSXQXglLPJIAAAAC/boobs-anime.gif",
  "https://media1.tenor.com/images/0f458cf28fc7ee25fa48d7d730fddf6d/tenor.gif?itemid=12812324",
  "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExY2JmZGI0NDIxZjhmYTQ4YjBlNjkyNGNkZWRkZGI3ZDllZGJjMWY5NiZjdD1n/9U5J7JpaYBr68/giphy.gif",
  "https://media.tenor.com/images/a6c2f17d9209f8f536b6b4bfbfb84686/tenor.gif",
];

module.exports = () => {
  return responses[Math.floor(Math.random() * responses.length)];
};
