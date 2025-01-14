const { PermissionsBitField } = require("discord.js");

/**
 * @param {BigInt} bitField
 * @return {String} Name of the BitFeild.
 */

module.exports = (bitField) => {
  for (const permission of Object.keys(PermissionsBitField.Flags)) {
    if (PermissionsBitField.Flags[permission] === bitField) {
      return permission;
    }
  }
  return "UnknownPermission";
};
