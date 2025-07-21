import { SlashCommandBuilder } from 'discord.js';
import { CommandRunOptions } from '../../src/dev';
import { EnhancedEmbedBuilder } from '../../src/utils/EmbedBuilder';
import { ComponentHelpers } from '../../src/utils/ComponentHelpers';

export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Display help information')
  .addStringOption(option =>
    option
      .setName('command')
      .setDescription('Get help for a specific command')
      .setRequired(false)
      .setAutocomplete(true)
  );

export const cooldown = 3;
export const category = 'utility';

export async function run({ interaction, handler }: CommandRunOptions): Promise<void> {
  const commandName = interaction.options.getString('command');

  if (commandName) {
    // Show specific command help
    const command = handler.commandMap.get(commandName);
    if (!command) {
      const embed = EnhancedEmbedBuilder.createError('Command Not Found', `Command \`${commandName}\` does not exist.`);
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    const embed = EnhancedEmbedBuilder.createCommandHelp(
      command.name,
      command.description,
      `/${command.name}`,
      [`/${command.name}`],
      command.aliases || []
    );

    if (command.cooldown) {
      embed.addFields({ name: 'Cooldown', value: `${command.cooldown} seconds`, inline: true });
    }

    if (command.category) {
      embed.addFields({ name: 'Category', value: command.category, inline: true });
    }

    await interaction.reply({ embeds: [embed] });
  } else {
    // Show general help with categories
    const commands = handler.commands;
    const categories = new Map<string, typeof commands>();

    // Group commands by category
    for (const command of commands) {
      const category = command.category || 'General';
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category)!.push(command);
    }

    const embed = EnhancedEmbedBuilder.createInfo('📖 Help Menu', 'Select a category to view commands');

    // Create select menu for categories
    const options = Array.from(categories.keys()).map(category => ({
      label: category,
      value: `help_category_${category.toLowerCase()}`,
      description: `View ${category} commands`,
      emoji: getCategoryEmoji(category)
    }));

    const selectMenu = ComponentHelpers.createSelectMenuRow(
      'help_category_select',
      'Choose a category...',
      options
    );

    await interaction.reply({
      embeds: [embed],
      components: [selectMenu]
    });
  }
}

export async function autocomplete(interaction: any): Promise<void> {
  const focusedValue = interaction.options.getFocused();
  const handler = interaction.client.handler; // Assuming handler is accessible

  if (handler) {
    const commands = Array.from(handler.commandMap.keys())
      .filter(name => name.startsWith(focusedValue))
      .slice(0, 25)
      .map(name => ({ name, value: name }));

    await interaction.respond(commands);
  }
}

function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    'General': '📋',
    'Utility': '🔧',
    'Admin': '⚙️',
    'Moderation': '🛡️',
    'Fun': '🎉',
    'Music': '🎵',
    'Economy': '💰',
    'Games': '🎮'
  };
  return emojis[category] || '📁';
}