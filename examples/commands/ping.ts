import { SlashCommandBuilder } from 'discord.js';
import { CommandRunOptions } from '../../src/dev';
import { EnhancedEmbedBuilder } from '../../src/utils/EmbedBuilder';

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Check bot latency and response time')
  .setDMPermission(true);

export const cooldown = 5; // 5 seconds cooldown
export const category = 'utility';

export async function run({ interaction, client }: CommandRunOptions): Promise<void> {
  const sent = await interaction.reply({
    content: '🏓 Pinging...',
    fetchReply: true
  });

  const latency = sent.createdTimestamp - interaction.createdTimestamp;
  const apiLatency = Math.round(client.ws.ping);

  const embed = EnhancedEmbedBuilder.createInfo('🏓 Pong!')
    .addFields(
      { name: 'Bot Latency', value: `${latency}ms`, inline: true },
      { name: 'API Latency', value: `${apiLatency}ms`, inline: true },
      { name: 'Status', value: getLatencyStatus(latency), inline: true }
    );

  await interaction.editReply({
    content: null,
    embeds: [embed]
  });
}

function getLatencyStatus(latency: number): string {
  if (latency < 100) return '🟢 Excellent';
  if (latency < 200) return '🟡 Good';
  if (latency < 500) return '🟠 Fair';
  return '🔴 Poor';
}