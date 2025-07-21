// Example validation: Maintenance mode
import { ChatInputCommandInteraction } from 'discord.js';
import { LocalCommand, ValidationFunction } from '../../src/dev';
import { Logger } from '../../src/logger';

// This validation prevents command execution during maintenance
const maintenanceValidation: ValidationFunction = async (
  interaction: ChatInputCommandInteraction,
  command: LocalCommand,
  handler: any,
  client: any
): Promise<boolean> => {
  // Check if maintenance mode is enabled (you can store this in a database or config)
  const maintenanceMode = process.env.MAINTENANCE_MODE === 'true';
  
  if (maintenanceMode) {
    // Allow owners to use commands during maintenance
    if (handler.permissionManager.isOwner(interaction.user.id)) {
      return false; // Allow execution
    }

    // Block all other users
    await interaction.reply({
      content: '🚧 **Maintenance Mode**\n\nThe bot is currently under maintenance. Please try again later.',
      ephemeral: true
    });

    Logger.info(`Command ${command.name} blocked due to maintenance mode for user ${interaction.user.id}`);
    return true; // Block execution
  }

  return false; // Allow execution
};

export default maintenanceValidation;