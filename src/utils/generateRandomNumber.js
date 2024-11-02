/**
 * @param {Number} min
 * @param {Number} max
 * @return {Number} Random number min to max (both inclusive).
 */

module.exports = (min = 0, max = 100) => {
  return Math.round(Math.random() * (max - min) + min);
};
