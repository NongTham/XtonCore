// Example validation: Guild whitelist
import { ChatInputCommandInteraction } from 'discord.js';
import { LocalCommand, ValidationFunction } from '../../src/dev';
import { Logger } from '../../src/logger';

// This validation only allows commands in whitelisted guilds
const guildWhitelistValidation: ValidationFunction = async (
  interaction: ChatInputCommandInteraction,
  command: LocalCommand,
  handler: any,
  client: any
): Promise<boolean> => {
  // Skip validation for DM commands or if no guild restriction
  if (!interaction.guildId || !command.guildOnly) {
    return false; // Allow execution
  }

  // Define whitelisted guild IDs (you can store this in a database)
  const whitelistedGuilds = process.env.WHITELISTED_GUILDS?.split(',') || [];
  
  // If no whitelist is configured, allow all guilds
  if (whitelistedGuilds.length === 0) {
    return false; // Allow execution
  }

  // Check if current guild is whitelisted
  if (!whitelistedGuilds.includes(interaction.guildId)) {
    await interaction.reply({
      content: '❌ **Access Denied**\n\nThis bot is not authorized to run commands in this server.',
      ephemeral: true
    });

    Logger.warn(`Command ${command.name} blocked in non-whitelisted guild ${interaction.guildId}`);
    return true; // Block execution
  }

  return false; // Allow execution
};

export default guildWhitelistValidation;