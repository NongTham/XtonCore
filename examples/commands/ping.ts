/**
 * XtonCore — Ping Command Example
 * 
 * A simple slash command that replies with the bot's latency.
 * Demonstrates: SlashCommandBuilder, cooldown, EnhancedEmbedBuilder
 */

import { SlashCommandBuilder } from 'discord.js';
import { CommandRunOptions, EnhancedEmbedBuilder } from 'xtoncore';

// Command metadata — registered as a slash command
export const data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check bot latency');

// Cooldown: 5 seconds per user
export const cooldown = 5;

// Category for organization
export const category = 'utility';

// Command handler
export async function run({ interaction, client }: CommandRunOptions) {
    const start = Date.now();

    // Defer reply to measure round-trip latency
    await interaction.deferReply();

    const latency = Date.now() - start;
    const wsLatency = client.ws.ping;

    const embed = EnhancedEmbedBuilder.createSuccess('🏓 Pong!', [
        `**Bot Latency:** ${latency}ms`,
        `**WebSocket:** ${wsLatency}ms`,
    ].join('\n'));

    await interaction.editReply({ embeds: [embed] });
}
