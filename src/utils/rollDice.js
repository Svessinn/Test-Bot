/**
 * @param {string} dice
 * @return {Array} Array of rolled dice.
 */

module.exports = (dice) => {
  dice = dice.split("d");

  if (dice.length !== 2) return null;

  for (let die of dice) {
    if (isNaN(die)) return null;
    if (!die.length) return null;
  }

  let lst = [];

  for (let i = 0; i < dice[0]; i++) {
    lst.push(1 + Math.floor(Math.random() * dice[1]));
  }

  return lst;
};
