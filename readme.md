# Test Bot

This is a Discord bot built using the `discord.js` library. The bot includes various commands and event handlers to manage and interact with a Discord server.

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Commands](#commands)
- [Event Logging](#event-logging)
- [Sharding](#sharding)
- [Contributing](#contributing)
- [License](#license)

## Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/Svessinn/test-bot.git
   cd test-bot
   ```

2. Install the dependencies:

   ```sh
   npm install
   ```

3. Create a `.env` file based on the `.env.example` file and fill in your credentials:
   ```sh
   cp .env.example .env
   ```

## Configuration

- **TOKEN**: Your bot token from the Discord Developer Portal.
- **GUILD_ID**: Your test server ID.
- **CLIENT_ID**: Your bot user ID.
- **SUPABASE_URL**: Your Supabase URL.
- **SUPABASE_KEY**: Your Supabase Key/Token.

## Usage

To run the bot, use the following command:

```sh
node src/index.js
```

If your bot is in many servers, you should use sharding:

```sh
node src/sharding.js
```

## Commands

The bot includes various commands categorized into different folders under `src/commands/`. Some of the categories include:

- actions
- admin
- bot info
- channel moderation
- user moderation
- recipes
- economy

Each command file exports a module with the following structure:

```js
module.exports = {
  name: "command-name",
  description: "Command description",
  usage: "How to use the command",
  example: "Example of how to run the command",
  options: [
    /* command options */
  ],
  callback: async (client, interaction) => {
    // Command logic
  },
};
```

## Event Logging

The bot logs various events such as `guildMemberAdd`, `guildMemberRemove`, `messageCreate`, etc. Event handlers are located in the `src/events/` directory.

## Sharding

If your bot is in many servers, you should use sharding to distribute the load. The sharding manager is already coded for the bot. To run the bot in sharding mode, use the following command:

```sh
node src/sharding.js
```

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.

## License

This project is licensed under the MIT License.

Feel free to customize this [README.md](https://github.com/Svessinn/Test-Bot/blob/master/readme.md) to better fit your project's specifics.
