/**
 * XtonCore v2.1 — Basic Bot Example
 * 
 * This example shows how to set up a Discord bot using XtonCore
 * with all the key features: commands, events, components,
 * lazy loading, hot reload, and rate limiting.
 */

import { Client, GatewayIntentBits } from 'discord.js';
import { ClientHandler } from 'xtoncore';
import 'dotenv/config';

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

        // 📁 Paths to your bot's modules
        commandsPath: './commands',
        eventsPath: './events',
        componentsPath: './components',

        // 👑 Bot owner user IDs (can use owner-only commands)
        ownerIds: [process.env.OWNER_ID || ''],

        // ⚡ Performance — Lazy loading is enabled by default
        lazyLoading: true,
        preloadCommands: ['ping', 'help'], // Preload frequently used commands

        // 🔥 Hot Reload — Auto-reload files on change (dev only)
        enableHotReload: process.env.NODE_ENV === 'development',

        // 🛡️ Rate Limiting — Prevent command spam
        rateLimiting: {
            enabled: true,
            defaultLimit: 5,      // 5 uses
            defaultWindow: 60,    // per 60 seconds
        },
    });

    // 📊 Log lazy loading stats
    const stats = handler.getLazyLoadingStats();
    console.log(`📦 Commands registered: ${stats.total} (${stats.loaded} preloaded)`);

    // 🔑 Login to Discord
    await client.login(process.env.BOT_TOKEN);
}

main().catch(console.error);
