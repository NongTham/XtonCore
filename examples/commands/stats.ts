import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { CommandRunOptions } from '../../src/dev';
import { EnhancedEmbedBuilder } from '../../src/utils/EmbedBuilder';

export const data = new SlashCommandBuilder()
  .setName('stats')
  .setDescription('Display bot performance statistics')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .setDMPermission(false);

export const cooldown = 10;
export const category = 'admin';
export const permissions = [PermissionFlagsBits.ManageGuild];

export async function run({ interaction, handler }: CommandRunOptions): Promise<void> {
  await interaction.deferReply();

  const stats = handler.getStats();
  const report = handler.generateReport();

  const embed = EnhancedEmbedBuilder.createInfo('📊 Bot Statistics')
    .setDescription('```\n' + report + '\n```')
    .addFields(
      { name: 'Commands Loaded', value: stats.commands.toString(), inline: true },
      { name: 'Active Cooldowns', value: stats.cooldowns.toString(), inline: true },
      { name: 'Component Handlers', value: stats.components.toString(), inline: true }
    );

  await interaction.editReply({ embeds: [embed] });
}