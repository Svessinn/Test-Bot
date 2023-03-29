const responses = [
  // "Response 1"
  // "Response 2"
  // ...
];

module.exports = () => {
  return responses[Math.floor(Math.random() * responses.length)];
};
