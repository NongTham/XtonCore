# XtonCore Enhanced v2.0 🚀

Enhanced Discord.js handler library with advanced features including performance monitoring, hot reload, component management, and more.

## ✨ Features

### 🎯 Core Features

- **Command Handler** - Advanced slash command management with autocomplete support
- **Event Handler** - Automatic event loading and management
- **Component Handler** - Button, select menu, and modal interaction handling
- **Validation System** - Flexible command validation pipeline

### 🚀 Enhanced Features

- **Performance Monitoring** - Real-time command execution tracking and statistics
- **Hot Reload** - Development-friendly file watching and reloading
- **Cooldown Management** - Per-user, per-command cooldown system
- **Permission System** - Advanced permission checking with caching
- **Rate Limiting** - Built-in rate limiting to prevent abuse
- **Input Sanitization** - Security-focused input validation
- **Component Helpers** - Easy-to-use builders for Discord components
- **Enhanced Logging** - Multi-level logging with file rotation

## 📦 Installation

```bash
npm install xtoncore
# or
yarn add xtoncore
```

## 🚀 Quick Start

```typescript
import { Client, GatewayIntentBits } from "discord.js";
import { ClientHandler } from "xtoncore";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

async function main() {
  const handler = await ClientHandler.create({
    client,
    commandsPath: "./commands",
    eventsPath: "./events",
    componentsPath: "./components",
    ownerIds: ["YOUR_USER_ID"],
    enableHotReload: true,
    rateLimiting: {
      enabled: true,
      defaultLimit: 5,
      defaultWindow: 60,
    },
    performance: {
      enabled: true,
      trackMemory: true,
    },
  });

  await client.login("YOUR_BOT_TOKEN");
}

main().catch(console.error);
```

## 📁 Project Structure

```
your-bot/
├── commands/
│   ├── utility/
│   │   ├── ping.ts
│   │   └── help.ts
│   └── admin/
│       └── stats.ts
├── events/
│   ├── ready/
│   │   └── 00-startup.ts
│   └── interactionCreate/
│       └── 01-logging.ts
├── components/
│   ├── buttons/
│   │   └── confirm-button.ts
│   └── modals/
│       └── feedback-modal.ts
└── validations/
    ├── 01-blacklist.ts
    └── 02-maintenance.ts
```

## 🎯 Command Example

```typescript
// commands/utility/ping.ts
import { SlashCommandBuilder } from "discord.js";
import { CommandRunOptions } from "xtoncore";
import { EnhancedEmbedBuilder } from "xtoncore/utils";

export const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Check bot latency");

export const cooldown = 5; // 5 seconds
export const category = "utility";
export const permissions = []; // Optional Discord permissions
export const ownerOnly = false; // Owner-only command
export const guildOnly = false; // Guild-only command
export const nsfw = false; // NSFW command

export async function run({ interaction, client, handler }: CommandRunOptions) {
  const embed = EnhancedEmbedBuilder.createInfo(
    "🏓 Pong!",
    `Latency: ${client.ws.ping}ms`
  );
  await interaction.reply({ embeds: [embed] });
}

// Optional autocomplete function
export async function autocomplete(interaction: AutocompleteInteraction) {
  // Handle autocomplete
}
```

## 🎛️ Component Example

```typescript
// components/buttons/confirm-button.ts
import { ButtonInteraction } from "discord.js";
import { ComponentHandler } from "xtoncore";

export const customId = "confirm_action";
export const type = "button";

export async function run(
  interaction: ButtonInteraction,
  client: any,
  handler: any
) {
  await interaction.reply({ content: "Action confirmed!", ephemeral: true });
}

export default { customId, type, run } as ComponentHandler;
```

## 🔧 Utility Classes

### EnhancedEmbedBuilder

```typescript
import { EnhancedEmbedBuilder } from "xtoncore/utils";

// Create different types of embeds
const successEmbed = EnhancedEmbedBuilder.createSuccess(
  "Success!",
  "Operation completed"
);
const errorEmbed = EnhancedEmbedBuilder.createError(
  "Error!",
  "Something went wrong"
);
const infoEmbed = EnhancedEmbedBuilder.createInfo(
  "Info",
  "Here is some information"
);

// Create pagination
const paginatedEmbed = EnhancedEmbedBuilder.createPagination(
  items,
  1,
  10,
  "Results"
);

// Create progress bar
const progressEmbed = EnhancedEmbedBuilder.createProgressBar(
  75,
  100,
  20,
  "Loading"
);
```

### ComponentHelpers

```typescript
import { ComponentHelpers } from "xtoncore/utils";

// Create buttons
const confirmButtons = ComponentHelpers.createConfirmButtons();
const paginationButtons = ComponentHelpers.createPaginationButtons(1, 5);

// Create select menus
const selectMenu = ComponentHelpers.createSelectMenu(
  "menu_id",
  "Choose option...",
  [
    { label: "Option 1", value: "opt1", description: "First option" },
    { label: "Option 2", value: "opt2", description: "Second option" },
  ]
);

// Create modals
const modal = ComponentHelpers.createModal("modal_id", "Feedback Form", [
  {
    customId: "feedback_input",
    label: "Your Feedback",
    style: TextInputStyle.Paragraph,
    placeholder: "Enter your feedback here...",
    required: true,
  },
]);
```

### InputSanitizer

```typescript
import { InputSanitizer } from "xtoncore/utils";

// Sanitize user input
const cleanInput = InputSanitizer.sanitizeString(userInput, {
  maxLength: 1000,
  allowHtml: false,
  allowSql: false,
});

// Sanitize Discord content
const cleanContent = InputSanitizer.sanitizeDiscordContent(message);

// Validate IDs
const isValidUser = InputSanitizer.validateUserId(userId);
const isValidGuild = InputSanitizer.validateGuildId(guildId);
```

## 📊 Performance Monitoring

```typescript
// Access performance manager
const perfManager = handler.performanceManager;

// Get command statistics
const stats = perfManager.getCommandStats("ping");
const topCommands = perfManager.getTopCommands(10);

// Get memory usage
const memory = perfManager.getMemoryUsage();

// Generate performance report
const report = perfManager.generateReport();
console.log(report);
```

## 🔒 Permission Management

```typescript
// Access permission manager
const permManager = handler.permissionManager;

// Add/remove owners
permManager.addOwner("USER_ID");
permManager.removeOwner("USER_ID");

// Blacklist users/guilds
permManager.blacklistUser("USER_ID");
permManager.blacklistGuild("GUILD_ID");

// Check permissions
const result = await permManager.checkPermissions(interaction, command);
if (!result.allowed) {
  console.log(result.reason);
}
```

## ⏱️ Cooldown Management

```typescript
// Access cooldown manager
const cooldownManager = handler.cooldownManager;

// Set cooldown
cooldownManager.setCooldown("USER_ID", "command_name", 30); // 30 seconds

// Check cooldown
const isOnCooldown = cooldownManager.isOnCooldown("USER_ID", "command_name");
const remainingTime = cooldownManager.getRemainingTime(
  "USER_ID",
  "command_name"
);

// Remove cooldown
cooldownManager.removeCooldown("USER_ID", "command_name");
```

## 🚦 Rate Limiting

```typescript
// Access rate limiter
const rateLimiter = handler.rateLimiter;

// Check rate limit
const result = rateLimiter.checkLimit("USER_ID", "action", 5, 60); // 5 per minute
if (!result.allowed) {
  console.log(`Rate limited! Reset in ${result.resetTime - Date.now()}ms`);
}

// Check if blocked
const isBlocked = rateLimiter.isBlocked("USER_ID", "action");
```

## 🔥 Hot Reload

```typescript
// Access hot reload manager
const hotReload = handler.hotReloadManager;

// Check if enabled
console.log(hotReload.isEnabled());

// Get watched directories
console.log(hotReload.getWatchedDirectories());

// Manual reload
await handler.reloadCommands();
await handler.reloadComponents();
```

## 📈 Statistics

```typescript
// Get comprehensive stats
const stats = handler.getStats();
console.log(stats);

// Generate full report
const report = handler.generateReport();
console.log(report);
```

## 🎛️ Configuration Options

```typescript
interface ClientHandlerOptions {
  client: Client; // Discord.js client instance
  commandsPath?: string; // Path to commands directory
  eventsPath?: string; // Path to events directory
  validationsPath?: string; // Path to validations directory
  componentsPath?: string; // Path to components directory
  guild?: string; // Guild ID for guild-specific commands
  ownerIds?: string[]; // Array of owner user IDs
  enableHotReload?: boolean; // Enable hot reload (default: dev mode)
  rateLimiting?: {
    // Rate limiting configuration
    enabled: boolean;
    defaultLimit?: number; // Default requests per window
    defaultWindow?: number; // Default window in seconds
  };
  performance?: {
    // Performance monitoring configuration
    enabled: boolean;
    trackMemory?: boolean; // Track memory usage
  };
}
```

## 🔧 Development

```bash
# Clone the repository
git clone https://github.com/your-username/xtoncore.git
cd xtoncore

# Install dependencies
yarn install

# Build the project
yarn build

# Watch for changes (development)
yarn dev
```

## 📝 Changelog

### v2.0.0

- ✨ Added performance monitoring system
- ✨ Added hot reload functionality
- ✨ Added component management system
- ✨ Added advanced permission system
- ✨ Added rate limiting
- ✨ Added input sanitization
- ✨ Added utility classes for embeds and components
- ✨ Enhanced logging system
- 🔧 Improved TypeScript support
- 🔧 Better error handling
- 🔧 Code organization improvements

### v1.3.1

- 🐛 Bug fixes and improvements
- 📚 Documentation updates

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.

## 🙏 Credits

Created by Narabordee Wirakkamo

---

**XtonCore Enhanced** - Making Discord.js development easier and more powerful! 🚀
