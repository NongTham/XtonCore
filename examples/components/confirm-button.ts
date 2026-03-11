/**
 * XtonCore — Confirm Button Component Example
 * 
 * Handles a "confirm" button interaction.
 * Demonstrates: ComponentHandler interface, customId matching, ephemeral replies
 * 
 * Place this file in: components/buttons/confirm-button.ts
 */

import { ButtonInteraction, Client } from 'discord.js';
import { EnhancedEmbedBuilder } from 'xtoncore';

// The customId to match — must match the button's customId property
export const customId = 'confirm';

// Component type: 'button' | 'selectMenu' | 'modal'
export const type = 'button';

// Handler function
export async function run(interaction: ButtonInteraction, client: Client, handler: any) {
    const embed = EnhancedEmbedBuilder.createSuccess(
        '✅ Confirmed!',
        'Your action has been confirmed successfully.'
    );

    await interaction.reply({
        embeds: [embed],
        ephemeral: true, // Only visible to the user who clicked
    });
}
