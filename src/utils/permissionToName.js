const bitFields = {
  "1": "CreateInstantInvite",
  "10": "KickMembers",
  "100": "BanMembers",
  "1000": "Administrator",
  "10000": "ManageChannels",
  "100000": "ManageGuild",
  "1000000": "AddReactions",
  "10000000": "ViewAuditLog",
  "100000000": "PrioritySpeaker",
  "1000000000": "Stream",
  "10000000000": "ViewChannel",
  "100000000000": "SendMessages",
  "1000000000000": "SendTTSMessages",
  "10000000000000": "ManageMessages",
  "100000000000000": "EmbedLinks",
  "1000000000000000": "AttachFiles",
  "10000000000000000": "ReadMessageHistory",
  "100000000000000000": "MentionEveryone",
  "1000000000000000000": "UseExternalEmojis",
  "10000000000000000000": "ViewGuildInsights",
  "100000000000000000000": "Connect",
  "1000000000000000000000": "Speak",
  "10000000000000000000000": "MuteMembers",
  "100000000000000000000000": "DeafenMembers",
  "1000000000000000000000000": "MoveMembers",
  "10000000000000000000000000": "UseVAD",
  "100000000000000000000000000": "ChangeNickname",
  "1000000000000000000000000000": "ManageNicknames",
  "10000000000000000000000000000": "ManageRoles",
  "100000000000000000000000000000": "ManageWebhooks",
  "1000000000000000000000000000000": "ManageEmojisAndStickers",
  "10000000000000000000000000000000": "UseApplicationCommands",
  "100000000000000000000000000000000": "RequestToSpeak",
  "1000000000000000000000000000000000": "ManageEvents",
  "10000000000000000000000000000000000": "ManageThreads",
  "100000000000000000000000000000000000": "CreatePublicThreads",
  "1000000000000000000000000000000000000": "CreatePrivateThreads",
  "10000000000000000000000000000000000000": "UseExternalStickers",
  "100000000000000000000000000000000000000": "SendMessagesInThreads",
  "1000000000000000000000000000000000000000": "UseEmbeddedActivities",
  "10000000000000000000000000000000000000000": "ModerateMembers",
};

/**
 * @return {String} Name of the BitFeild.
 */

module.exports = (bitField) => {
  return bitFields[bitField.toString(2)]
}