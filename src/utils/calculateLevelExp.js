/*
Calculates the amount of Exp needed to go up a level
*/

/**
 * @param {number} level
 */

module.exports = (level) => {
  let expNeeded = 0;

  if (level < 15) {
    expNeeded = Math.ceil((Math.pow(level, 3) * ((level + 1) / 3 + 24)) / 50);
  } else if (level >= 15 && level < 36) {
    expNeeded = Math.ceil((Math.pow(level, 3) * (level + 14)) / 50);
  } else {
    expNeeded = Math.ceil((Math.pow(level, 3) * (level / 2 + 32)) / 50);
  }
  return expNeeded;
};
