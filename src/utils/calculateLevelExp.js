/*
Calculates the amount of Exp needed to go up a level
*/

/**
 * @param {Number} level
 * @return {Number} EXP neede to level up to input level.
 */

module.exports = (level) => {
  let expNeeded = 0;

  if (level < 15) {
    expNeeded = (Math.pow(level, 3) * (Math.floor((level + 1) / 3) + 24)) / 50;
  } else if (level >= 15 && level < 36) {
    expNeeded = (Math.pow(level, 3) * (level + 14)) / 50;
  } else {
    expNeeded = (Math.pow(level, 3) * Math.floor(level / 2 + 32)) / 50;
  }
  return expNeeded;
};
