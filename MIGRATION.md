# Migration Guide: XtonCore v1.x to v2.0

This guide will help you migrate from XtonCore v1.x to the enhanced v2.0.

## 🚀 What's New in v2.0

- **Performance Monitoring** - Track command execution times and statistics
- **Hot Reload** - Development-friendly file watching
- **Component Management** - Handle buttons, select menus, and modals
- **Advanced Permissions** - Enhanced permission system with caching
- **Rate Limiting** - Built-in rate limiting protection
- **Input Sanitization** - Security-focused input validation
- **Enhanced Logging** - Multi-level logging with file rotation
- **Utility Classes** - Helper classes for embeds and components

## 📋 Breaking Changes

### 1. ClientHandler Initialization

**v1.x:**
```typescript
const handler = new ClientHandler({
  client,
  commandsPath: './commands',
  eventsPath: './events'
});
```

**v2.0:**
```typescript
const handler = await ClientHandler.create({
  client,
  commandsPath: './commands',
  eventsPath: './events',
  componentsPath: './components', // New
  ownerIds: ['YOUR_USER_ID'], // New
  enableHotReload: true, // New
  rateLimiting: { enabled: true }, // New
  performance: { enabled: true } // New
});
```

### 2. Command Structure

**v1.x:**
```typescript
export const data = new SlashCommandBuilder()...
export async function run({ interaction, client, handler }) {
  // Command logic
}
```

**v2.0 (Enhanced):**
```typescript
export const data = new SlashCommandBuilder()...
export const cooldown = 5; // New: Cooldown in seconds
export const category = 'utility'; // New: Command category
export const permissions = []; // New: Required permissions
export const ownerOnly = false; // New: Owner-only flag
export const guildOnly = false; // New: Guild-only flag
export const nsfw = false; // New: NSFW flag

export async function run({ interaction, client, handler }) {
  // Command logic - handler now has enhanced features
}

// New: Optional autocomplete function
export async function autocomplete(interaction) {
  // Autocomplete logic
}
```

## 🔄 Step-by-Step Migration

### Step 1: Update Dependencies

```bash
npm install xtoncore@2.0.0
# or
yarn add xtoncore@2.0.0
```

### Step 2: Update Your Bot File

```typescript
// Old way
const handler = new ClientHandler(options);

// New way
const handler = await ClientHandler.create(options);
```

### Step 3: Add Enhanced Features to Commands

Add optional properties to your existing commands:

```typescript
// Add to your command files
export const cooldown = 10; // 10 second cooldown
export const category = 'moderation';
export const permissions = [PermissionFlagsBits.ManageMessages];
export const guildOnly = true;
```

### Step 4: Create Components Directory (Optional)

If you want to use the new component system:

```
your-bot/
├── components/
│   ├── buttons/
│   │   └── confirm-button.ts
│   ├── modals/
│   │   └── feedback-modal.ts
│   └── select-menus/
│       └── role-select.ts
```

### Step 5: Update Validation Functions

**v1.x:**
```typescript
export default async function(interaction, command, handler, client) {
  // Validation logic
  return shouldBlock; // boolean
}
```

**v2.0 (Same, but with enhanced handler):**
```typescript
export default async function(interaction, command, handler, client) {
  // Now handler has access to new managers
  if (handler.permissionManager.isUserBlacklisted(interaction.user.id)) {
    return true; // Block
  }
  return false; // Allow
}
```

## 🆕 New Features Usage

### Performance Monitoring

```typescript
// Access performance data
const stats = handler.performanceManager.getCommandStats('ping');
const topCommands = handler.performanceManager.getTopCommands(10);
const report = handler.generateReport();
```

### Cooldown Management

```typescript
// Cooldowns are automatic based on command properties
// But you can also manage them manually
handler.cooldownManager.setCooldown('userId', 'commandName', 30);
const remaining = handler.cooldownManager.getRemainingTime('userId', 'commandName');
```

### Permission Management

```typescript
// Add owners
handler.permissionManager.addOwner('userId');

// Blacklist users/guilds
handler.permissionManager.blacklistUser('userId');
handler.permissionManager.blacklistGuild('guildId');
```

### Component Handling

```typescript
// components/buttons/example-button.ts
export const customId = 'example_button';
export const type = 'button';

export async function run(interaction, client, handler) {
  await interaction.reply('Button clicked!');
}
```

### Enhanced Utilities

```typescript
import { EnhancedEmbedBuilder, ComponentHelpers } from 'xtoncore/utils';

// Create embeds easily
const embed = EnhancedEmbedBuilder.createSuccess('Success!', 'Operation completed');

// Create components easily
const buttons = ComponentHelpers.createConfirmButtons();
```

## ⚠️ Important Notes

1. **Async Initialization**: ClientHandler now requires `await ClientHandler.create()` instead of `new ClientHandler()`

2. **Enhanced Logging**: The logging system has been improved. Update any direct logger imports:
   ```typescript
   // Old
   import { Clientlogger } from 'xtoncore';
   
   // New (recommended)
   import { Logger } from 'xtoncore';
   ```

3. **TypeScript Support**: Enhanced TypeScript definitions are available. Update your imports if needed.

4. **Performance**: The new version includes performance monitoring by default. This may use slightly more memory but provides valuable insights.

## 🔧 Configuration Options

All new features are optional and can be disabled:

```typescript
const handler = await ClientHandler.create({
  client,
  commandsPath: './commands',
  // Disable new features if needed
  enableHotReload: false,
  rateLimiting: { enabled: false },
  performance: { enabled: false }
});
```

## 🆘 Need Help?

If you encounter issues during migration:

1. Check the [README.md](./README.md) for detailed documentation
2. Look at the [examples](./examples/) directory for reference implementations
3. Open an issue on GitHub if you need assistance

## 📈 Benefits of Upgrading

- **Better Performance**: Monitor and optimize your bot's performance
- **Enhanced Security**: Built-in rate limiting and input sanitization
- **Developer Experience**: Hot reload and better error handling
- **Scalability**: Advanced permission and cooldown systems
- **Maintainability**: Better code organization with component system

Happy coding with XtonCore Enhanced v2.0! 🚀