/**
 * @param {number} min
 * @param {number} max
 */

module.exports = (min = 0, max = 100) => {
  return Math.round(Math.random() * (max - min) + min);
};
