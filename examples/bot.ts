// Example bot implementation using XtonCore Enhanced v2.0
import { Client, GatewayIntentBits } from 'discord.js';
import { ClientHandler } from '../src/index';
import { Logger } from '../src/logger';

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

async function main() {
  try {
    // Initialize XtonCore Enhanced Handler
    const handler = await ClientHandler.create({
      client,
      commandsPath: './examples/commands',
      eventsPath: './examples/events',
      componentsPath: './examples/components',
      validationsPath: './examples/validations',
      ownerIds: ['YOUR_USER_ID'], // Replace with your Discord user ID
      enableHotReload: process.env.NODE_ENV === 'development',
      rateLimiting: {
        enabled: true,
        defaultLimit: 5, // 5 commands per minute
        defaultWindow: 60
      },
      performance: {
        enabled: true,
        trackMemory: true
      }
    });

    // Set up graceful shutdown
    process.on('SIGINT', () => {
      Logger.info('Received SIGINT, shutting down gracefully...');
      handler.destroy();
      client.destroy();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      Logger.info('Received SIGTERM, shutting down gracefully...');
      handler.destroy();
      client.destroy();
      process.exit(0);
    });

    // Login to Discord
    await client.login(process.env.DISCORD_TOKEN);

    Logger.info('Bot started successfully!');

    // Optional: Log performance stats every 5 minutes
    setInterval(() => {
      const report = handler.generateReport();
      Logger.info('Performance Report:\n' + report);
    }, 300000); // 5 minutes

  } catch (error) {
    Logger.error('Failed to start bot:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  Logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  Logger.error('Uncaught Exception:', error);
  process.exit(1);
});

main();