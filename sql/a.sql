/*  SUPABASE IS A POSTGRES DATABASE */

CREATE TABLE EventLoggers (
  guildId VARCHAR(255),
  event  VARCHAR(255)
);

ALTER TABLE EventLoggers ADD PRIMARY KEY (guildId, event);

CREATE TABLE LevelChannels (
  guildId VARCHAR(255),
  channelId VARCHAR(255) NOT NULL
);

ALTER TABLE LevelChannels ADD PRIMARY KEY (guildId);

CREATE TABLE Levels (
  userId VARCHAR(255),
  guildId VARCHAR(255),
  level INT2 NOT NULL,
  exp INT8 NOT NULL
);

ALTER TABLE Levels ADD PRIMARY KEY (userId, guildId);

CREATE TABLE LevelupRoles (
  guildId VARCHAR(255),
  roleId VARCHAR(255),
  level INT2 NOT NULL
);

ALTER TABLE LevelupRoles ADD PRIMARY KEY (guildId, roleId);

CREATE TABLE LogChannels (
  guildId VARCHAR(255),
  channelId VARCHAR(255) NOT NULL
);

ALTER TABLE LogChannels ADD PRIMARY KEY (guildId);

CREATE TABLE WarnPunishments (
  guildId VARCHAR(255),
  warnings INT2,
  punishment VARCHAR(255),
  time INT8
);

ALTER TABLE WarnPunishments ADD PRIMARY KEY (guildId, warnings);

CREATE TABLE Warnings (
  id INT8,
  guildId VARCHAR(255),
  userId VARCHAR(255) NOT NULL,
  reason VARCHAR(255) NOT NULL
);

ALTER TABLE Warnings ADD PRIMARY KEY (id, guildId);

CREATE TABLE WelcomeChannels (
  guildId VARCHAR(255),
  channelId VARCHAR(255) NOT NULL
);

ALTER TABLE WelcomeChannels ADD PRIMARY KEY (guildId);

CREATE TABLE WelcomeEmbeds (
  guildId VARCHAR(255),
  colour VARCHAR(255),
  title VARCHAR(255),
  titleURL TEXT,
  authorName VARCHAR(255),
  authorIconURL TEXT,
  authorURL TEXT,
  description TEXT NOT NULL,
  thumbnail TEXT,
  image TEXT,
  timestamp BOOLEAN,
  footerText VARCHAR(255),
  footerIconURL TEXT,
  content TEXT
);

ALTER TABLE WelcomeEmbeds ADD PRIMARY KEY (guildId);
