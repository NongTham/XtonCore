import { StringSelectMenuInteraction } from 'discord.js';
import { ComponentHandler } from '../../src/dev';
import { EnhancedEmbedBuilder } from '../../src/utils/EmbedBuilder';

export const customId = /^help_category_/;
export const type = 'selectMenu';

export async function run(
  interaction: StringSelectMenuInteraction,
  client: any,
  handler: any
): Promise<void> {
  const selectedValue = interaction.values[0];
  const category = selectedValue.replace('help_category_', '');

  const commands = handler.commands.filter((cmd: any) => 
    (cmd.category || 'general').toLowerCase() === category
  );

  if (commands.length === 0) {
    const embed = EnhancedEmbedBuilder.createError('No Commands', `No commands found in category: ${category}`);
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  const embed = EnhancedEmbedBuilder.createInfo(
    `📖 ${category.charAt(0).toUpperCase() + category.slice(1)} Commands`,
    'Here are the available commands in this category:'
  );

  const commandList = commands.map((cmd: any) => {
    let line = `**/${cmd.name}** - ${cmd.description}`;
    if (cmd.cooldown) line += ` (${cmd.cooldown}s cooldown)`;
    return line;
  }).join('\n');

  embed.setDescription(commandList);
  embed.setFooter({ text: `${commands.length} commands in this category` });

  await interaction.update({ embeds: [embed] });
}

export default { customId, type, run } as ComponentHandler;