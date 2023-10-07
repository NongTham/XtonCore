XtonCore is an easy-to-use JavaScript library. This makes creating your own Handler in Discord.js easier.

This library only supports discord.js `v14`

## Credit

Thank you for the source code for this project. [UnderCtrl](https://github.com/notunderctrl/djs-commander)

## Installation

To install XtonCore, simply run the following command:

For npm:

```bash
npm install xtoncore
```

For yarn:

```yarn
yarn add xtoncore
```

## Usage
Insert this code into your index.js.
```js
// index.js
const { ClientHandler } = require('xtoncore');
const path = require('path');

new ClientHandler({
  client, // Discord.js client 
  commandsPath: path.join(__dirname, 'commands'),
  //Enter the name of your command folder.
  eventsPath: path.join(__dirname, 'events'),
  //Enter the name of your events folder.
  validationsPath: path.join(__dirname, 'validations'),
  //Only works if commandsPath is provided
  guild: 'SERVER_ID',
  //To register guild-based commands (if not provided commands will be registered globally)
});
```

## File Structure

### Commands

XtonCore allows a very flexible file structure for your commands directory. Here's an example of what your file structure could look like:

```shell
commands/
├── ping.js
├── botinfo.js
└── mod/
	├── ban.js
	└── kick.js
```

Any file inside the commands directory will be considered a command file, so make sure it properly exports an object. Like this:

```js
// commands/ping.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Pong!'),

  run: ({ interaction, client, handler }) => {
    interaction.reply(`Pong! ${client.ws.ping}ms`);
  },

  // deleted: true, // Deletes the command from Discord (if you passed in a "testServer" property it'll delete from the guild and not globally)
};
```

- `interaction`
- `client` is the discord.js Client instance.
- `handler` is the ClientHandler instance. You can use this to get access to properties such as `commands`.

---

### Events

XtonCore assumes a specific file structure for your events. Here's an example of what your file structure could look like:

```shell
events/
├── ready/
|	├── console-log.js
|	└── webhook.js
|
└── messageCreate/
	├── auto-mod/
	|	├── delete-swear-words.js
	|	└── anti-raid.js
	|
	└── chat-bot.js
```

Make sure each file exports a default function. Like this:

```js
// events/ready/console-log.js
module.exports = (argument, client, handler) => {
  console.log(`${client.user.tag} is online.`);
};
```

- `argument` is the argument you receive from the event being triggered (you can name this whatever you want). For example, the `messageCreate` event will give you an argument of the message object.
- `client` is the discord.js Client instance.
- `handler` is the CommandHandler instance. You can use this to get access to properties such as `commands`.

---

### Validations

XtonCore allows you to organize your validation files however you want to. Functions inside these files are executed in ascending order so you can prioritize your validations however you see fit. Here’s an example of what your file structure could look like:

```shell
validations/
└── dev-only.js
```

Make sure each file exports a default function. Like this:

```js
// validations/dev-only.js
module.exports = (interaction, commandObj, handler, client) => {
  if (commandObj.devOnly) {
    if (interaction.member.id !== 'DEVELOPER_ID') {
      interaction.reply('This command is for the developer only');
      return true; // This must be added to stop the command from being executed.
    }
  }
};
```

- `interaction` is the interaction object.
- `commandObj` is the command object exported from the command file itself. Properties such as `name`, `description` and `options` are all available within.
- `handler` is the CommandHandler instance. You can use this to get access to properties such as `commands`.
- `client` is the Client instance. (defined in your main entry point)

It's important to return `true` (or any truthy value) if you don't want the command to be executed (this also ensures the next validation that was queued up is not executed).