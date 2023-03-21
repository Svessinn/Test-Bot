/*
Calculates the amount of Exp needed to go up a level
*/

module.exports = (level) => {
  return Math.ceil((Math.pow(level, 3) * (level / 2 + 32)) / 5);
};
