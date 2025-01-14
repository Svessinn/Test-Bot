/*  SUPABASE IS A POSTGRES DATABASE */

create table
  public."EventLoggers" (
    "guildId" character varying not null,
    event character varying not null,
    constraint EventLoggers_pkey primary key ("guildId", event)
  ) tablespace pg_default;

create table
  public."LevelChannels" (
    "guildId" character varying not null,
    "channelId" character varying not null,
    constraint LevelChannels_pkey primary key ("guildId")
  ) tablespace pg_default;

create table
  public."Levels" (
    "userId" character varying not null,
    "guildId" character varying not null,
    exp bigint not null default '0'::bigint,
    level smallint not null default '0'::smallint,
    constraint Levels_pkey primary key ("userId", "guildId")
  ) tablespace pg_default;

create table
  public."LevelupRoles" (
    "guildId" character varying not null,
    "roleId" character varying not null,
    level smallint not null,
    constraint LevelupRoles_pkey primary key ("guildId", "roleId")
  ) tablespace pg_default;

create table
  public."LogChannels" (
    "guildId" character varying not null,
    "channelId" character varying null,
    constraint LogChannels_pkey primary key ("guildId")
  ) tablespace pg_default;

create table
  public."WarnPunishments" (
    "guildId" character varying not null,
    warnings smallint not null,
    punishment character varying null,
    time bigint null,
    constraint WarnPunishments_pkey primary key ("guildId", warnings)
  ) tablespace pg_default;

create table
  public."Warnings" (
    id bigint not null,
    "guildId" character varying not null,
    "userId" character varying not null,
    reason character varying not null,
    constraint Warnings_pkey primary key (id, "guildId")
  ) tablespace pg_default;

create table
  public."WelcomeChannels" (
    "guildId" character varying not null,
    "channelId" character varying null,
    constraint WelcomeChannels_pkey primary key ("guildId")
  ) tablespace pg_default;

create table
  public."WelcomeEmbeds" (
    "guildId" character varying not null,
    colour character varying null,
    title character varying null,
    "titleURL" text null,
    "authorName" character varying null,
    "authorIconURL" text null,
    "authorURL" text null,
    description text not null,
    thumbnail text null,
    image text null,
    timestamp boolean null default false,
    "footerText" character varying null,
    "footerIconURL" text null,
    content text null,
    constraint WelcomeEmbeds2_pkey primary key ("guildId")
  ) tablespace pg_default;