/*
Checks to see if commands are different
*/

const { ApplicationCommandOptionType } = require("discord.js");

function areChoicesDifferent(existingChoices, localChoices) {
  if (existingChoices.length !== localChoices.length) return true;
  for (const localChoice of localChoices) {
    const existingChoice = existingChoices?.find((choice) => choice.name === localChoice.name);
    if (!existingChoice) return true;

    if (localChoice.value !== existingChoice.value) return true;
  }
  return false;
}

function areOptionsDifferent(existingOptions, localOptions) {
  for (const localOption of localOptions) {
    const existingOption = existingOptions?.find((option) => option.name === localOption.name);

    if (!existingOption) return true;

    if (
      localOption.description !== existingOption.description ||
      localOption.type !== existingOption.type ||
      (localOption?.required || false) !== (existingOption?.required || false) ||
      (localOption.choices?.length || 0) !== (existingOption.choices?.length || 0) ||
      areChoicesDifferent(existingOption.choices || [], localOption.choices || [])
    )
      return true;

    if (localOption.type === ApplicationCommandOptionType.Subcommand) {
      if ((localOption?.options || []).length !== (existingOption?.options || []).length) return true;

      for (const localSubOption of localOption?.options || []) {
        const existingSubOption = existingOption?.options?.find((option) => option.name === localSubOption.name);

        if (!existingSubOption) return true;

        if (
          localSubOption.description !== existingSubOption.description ||
          localSubOption.type !== existingSubOption.type ||
          (localSubOption?.required || false) !== (existingSubOption?.required || false) ||
          (localSubOption.choices?.length || 0) !== (existingSubOption.choices?.length || 0) ||
          areChoicesDifferent(existingSubOption.choices || [], localSubOption.choices || [])
        )
          return true;
      }

      if (areOptionsDifferent(existingOption?.options || [], localOption?.options || [])) return true;
    }
  }
  return false;
}

/**
 *
 * @param {Object} existingCommand
 * @param {Object} localCommand
 * @return {Boolean}
 */

module.exports = (existingCommand, localCommand) => {
  if (
    existingCommand.description !== localCommand.description ||
    (existingCommand.options?.length || 0) !== (localCommand.options?.length || 0) ||
    areOptionsDifferent(existingCommand.options || [], localCommand.options || [])
  )
    return true;
  return false;
};
