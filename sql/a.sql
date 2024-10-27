CREATE TABLE LevelChannels (
  guildId VARCHAR(255),
  channelId VARCHAR(255)
);

CREATE TABLE Levels (
  userId VARCHAR(255),
  guildId VARCHAR(255),
  level INT2,
  exp INT8
);

CREATE TABLE LevelupRoles (
  guildId VARCHAR(255),
  roleId VARCHAR(255),
  level INT2
);

CREATE TABLE WarnPunishments (
  guildId VARCHAR(255),
  warnings INT2,
  punishment VARCHAR(255),
  time INT8
);

CREATE TABLE Warnings (
  id INT8,
  guildId VARCHAR(255),
  userId VARCHAR(255),
  reason VARCHAR(255)
);

CREATE TABLE WelcomeChannels (
  guildId VARCHAR(255),
  channelId VARCHAR(255)
);

CREATE TABLE WelcomeEmbeds (
  guildId VARCHAR(255),
  colour VARCHAR(255),
  title VARCHAR(255),
  titleURL TEXT,
  authorName VARCHAR(255),
  authorIconURL TEXT,
  authorURL TEXT,
  description TEXT,
  thumbnail TEXT,
  image TEXT,
  timestamp BOOLEAN,
  footerText VARCHAR(255),
  footerIconURL TEXT,
  content TEXT
);