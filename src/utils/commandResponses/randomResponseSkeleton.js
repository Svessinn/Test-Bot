const responses = [
  // "Response 1"
  // "Response 2"
  // ...
];
/**
 * @return {String}
 */
module.exports = () => {
  return responses[Math.floor(Math.random() * responses.length)];
};
