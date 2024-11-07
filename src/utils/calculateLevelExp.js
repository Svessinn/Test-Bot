/*
Calculates the amount of Exp needed to go up a level
*/

/**
 * @param {Number} level
 * @return {Number} EXP needed to level up to input level.
 */

module.exports = (level) => {
  if (level < 15) return Math.ceil((Math.pow(level, 3) * (Math.floor((level + 1) / 3) + 24)) / 40);
  if (level < 36) return Math.ceil((Math.pow(level, 3) * (level + 14)) / 40);
  return Math.ceil((Math.pow(level, 3) * (Math.floor(level / 2) + 32)) / 40);
};
