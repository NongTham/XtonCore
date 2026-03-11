import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
  Message,
  ComponentType,
  ButtonInteraction,
} from 'discord.js';
import { Clientlogger } from '../logger';

export class PaginationBuilder {
  private embeds: EmbedBuilder[] = [];
  private interaction: ChatInputCommandInteraction;
  private timeout: number;
  private currentPage = 0;
  private ephemeral = false;

  constructor(interaction: ChatInputCommandInteraction, timeoutMs = 60000) {
    this.interaction = interaction;
    this.timeout = timeoutMs;
  }

  /**
   * Set the array of embeds to paginate through
   */
  public setEmbeds(embeds: EmbedBuilder[]): this {
    this.embeds = embeds;
    return this;
  }

  /**
   * Set whether the pagination message should be ephemeral
   */
  public setEphemeral(ephemeral: boolean): this {
    this.ephemeral = ephemeral;
    return this;
  }

  /**
   * Render and start the pagination collector
   */
  public async render(): Promise<Message | null> {
    if (this.embeds.length === 0) {
      throw new Error('No embeds to paginate');
    }

    if (this.embeds.length === 1) {
      // Just send it without buttons
      const reply = await this.interaction.reply({
        embeds: [this.embeds[0]],
        ephemeral: this.ephemeral,
        fetchReply: true
      });
      return reply as Message;
    }

    const row = this.createButtons();
    
    // Add page numbers to footers if not set
    this.embeds.forEach((embed, i) => {
      // Avoid overwriting existing footers entirely if they exist
      const existingFooter = embed.data.footer?.text;
      if (!existingFooter?.includes('Page')) {
         embed.setFooter({
           text: `${existingFooter ? existingFooter + ' • ' : ''}Page ${i + 1} of ${this.embeds.length}`,
           iconURL: embed.data.footer?.icon_url
         });
      }
    });

    const reply = await this.interaction.reply({
      embeds: [this.embeds[this.currentPage]],
      components: [row],
      ephemeral: this.ephemeral,
      fetchReply: true
    }) as Message;

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: this.timeout,
    });

    collector.on('collect', async (i: ButtonInteraction) => {
      if (i.user.id !== this.interaction.user.id) {
        await i.reply({ content: 'You cannot use these buttons.', ephemeral: true });
        return;
      }

      await i.deferUpdate();

      if (i.customId === 'prev_page') {
        this.currentPage = this.currentPage > 0 ? this.currentPage - 1 : this.embeds.length - 1;
      } else if (i.customId === 'next_page') {
        this.currentPage = this.currentPage + 1 < this.embeds.length ? this.currentPage + 1 : 0;
      }

      await this.interaction.editReply({
        embeds: [this.embeds[this.currentPage]],
        components: [this.createButtons()]
      }).catch(err => Clientlogger.warn('Failed to edit pagination message', err));
    });

    collector.on('end', async () => {
      // Disable buttons when time runs out
      const disabledRow = this.createButtons(true);
      await this.interaction.editReply({
        components: [disabledRow]
      }).catch(() => null); // Ignore errors on timeout (message might be deleted)
    });

    return reply;
  }

  private createButtons(disabled = false): ActionRowBuilder<ButtonBuilder> {
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('prev_page')
        .setLabel('Previous')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(disabled),
      new ButtonBuilder()
        .setCustomId('next_page')
        .setLabel('Next')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(disabled)
    );

    return row;
  }
}
