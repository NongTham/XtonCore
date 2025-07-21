import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ComponentType,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} from 'discord.js';

export class ComponentHelpers {
  // Button Builders
  public static createButton(
    customId: string,
    label: string,
    style: ButtonStyle = ButtonStyle.Primary,
    options: {
      emoji?: string;
      disabled?: boolean;
      url?: string;
    } = {}
  ): ButtonBuilder {
    const button = new ButtonBuilder()
      .setCustomId(customId)
      .setLabel(label)
      .setStyle(style);

    if (options.emoji) button.setEmoji(options.emoji);
    if (options.disabled) button.setDisabled(true);
    if (options.url && style === ButtonStyle.Link) {
      button.setURL(options.url);
    }

    return button;
  }

  public static createLinkButton(
    url: string,
    label: string,
    emoji?: string
  ): ButtonBuilder {
    const button = new ButtonBuilder()
      .setURL(url)
      .setLabel(label)
      .setStyle(ButtonStyle.Link);

    if (emoji) button.setEmoji(emoji);

    return button;
  }

  // Predefined button sets
  public static createConfirmButtons(
    confirmId: string = 'confirm',
    cancelId: string = 'cancel'
  ): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      this.createButton(confirmId, 'Confirm', ButtonStyle.Success, { emoji: '✅' }),
      this.createButton(cancelId, 'Cancel', ButtonStyle.Danger, { emoji: '❌' })
    );
  }

  public static createPaginationButtons(
    currentPage: number,
    totalPages: number,
    baseId: string = 'page'
  ): ActionRowBuilder<ButtonBuilder> {
    const row = new ActionRowBuilder<ButtonBuilder>();

    // First page button
    row.addComponents(
      this.createButton(`${baseId}_first`, 'First', ButtonStyle.Secondary, {
        emoji: '⏮️',
        disabled: currentPage === 1
      })
    );

    // Previous page button
    row.addComponents(
      this.createButton(`${baseId}_prev`, 'Previous', ButtonStyle.Secondary, {
        emoji: '◀️',
        disabled: currentPage === 1
      })
    );

    // Current page indicator
    row.addComponents(
      this.createButton(`${baseId}_current`, `${currentPage}/${totalPages}`, ButtonStyle.Primary, {
        disabled: true
      })
    );

    // Next page button
    row.addComponents(
      this.createButton(`${baseId}_next`, 'Next', ButtonStyle.Secondary, {
        emoji: '▶️',
        disabled: currentPage === totalPages
      })
    );

    // Last page button
    row.addComponents(
      this.createButton(`${baseId}_last`, 'Last', ButtonStyle.Secondary, {
        emoji: '⏭️',
        disabled: currentPage === totalPages
      })
    );

    return row;
  }

  public static createNumberButtons(
    baseId: string = 'number',
    start: number = 1,
    end: number = 5
  ): ActionRowBuilder<ButtonBuilder> {
    const row = new ActionRowBuilder<ButtonBuilder>();

    for (let i = start; i <= Math.min(end, start + 4); i++) {
      row.addComponents(
        this.createButton(`${baseId}_${i}`, i.toString(), ButtonStyle.Secondary)
      );
    }

    return row;
  }

  // Select Menu Builders
  public static createSelectMenu(
    customId: string,
    placeholder: string,
    options: Array<{
      label: string;
      value: string;
      description?: string;
      emoji?: string;
      default?: boolean;
    }>,
    settings: {
      minValues?: number;
      maxValues?: number;
      disabled?: boolean;
    } = {}
  ): StringSelectMenuBuilder {
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(customId)
      .setPlaceholder(placeholder);

    const menuOptions = options.map(option => {
      const menuOption = new StringSelectMenuOptionBuilder()
        .setLabel(option.label)
        .setValue(option.value);

      if (option.description) menuOption.setDescription(option.description);
      if (option.emoji) menuOption.setEmoji(option.emoji);
      if (option.default) menuOption.setDefault(true);

      return menuOption;
    });

    selectMenu.addOptions(menuOptions);

    if (settings.minValues) selectMenu.setMinValues(settings.minValues);
    if (settings.maxValues) selectMenu.setMaxValues(settings.maxValues);
    if (settings.disabled) selectMenu.setDisabled(true);

    return selectMenu;
  }

  public static createSelectMenuRow(
    customId: string,
    placeholder: string,
    options: Array<{
      label: string;
      value: string;
      description?: string;
      emoji?: string;
      default?: boolean;
    }>,
    settings?: {
      minValues?: number;
      maxValues?: number;
      disabled?: boolean;
    }
  ): ActionRowBuilder<StringSelectMenuBuilder> {
    return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      this.createSelectMenu(customId, placeholder, options, settings)
    );
  }

  // Modal Builders
  public static createModal(
    customId: string,
    title: string,
    inputs: Array<{
      customId: string;
      label: string;
      style?: TextInputStyle;
      placeholder?: string;
      required?: boolean;
      minLength?: number;
      maxLength?: number;
      value?: string;
    }>
  ): ModalBuilder {
    const modal = new ModalBuilder()
      .setCustomId(customId)
      .setTitle(title);

    const rows: ActionRowBuilder<TextInputBuilder>[] = [];

    for (const input of inputs) {
      const textInput = new TextInputBuilder()
        .setCustomId(input.customId)
        .setLabel(input.label)
        .setStyle(input.style || TextInputStyle.Short);

      if (input.placeholder) textInput.setPlaceholder(input.placeholder);
      if (input.required !== undefined) textInput.setRequired(input.required);
      if (input.minLength) textInput.setMinLength(input.minLength);
      if (input.maxLength) textInput.setMaxLength(input.maxLength);
      if (input.value) textInput.setValue(input.value);

      rows.push(new ActionRowBuilder<TextInputBuilder>().addComponents(textInput));
    }

    modal.addComponents(...rows);
    return modal;
  }

  // Utility functions
  public static createButtonRow(...buttons: ButtonBuilder[]): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons);
  }

  public static disableAllComponents<T extends any>(
    components: ActionRowBuilder<T>[]
  ): ActionRowBuilder<T>[] {
    return components.map(row => {
      const newRow = new ActionRowBuilder<T>();
      newRow.components = row.components.map(component => {
        if ('setDisabled' in component) {
          (component as any).setDisabled(true);
        }
        return component;
      });
      return newRow;
    });
  }

  public static createLoadingButton(
    customId: string = 'loading',
    label: string = 'Loading...'
  ): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      this.createButton(customId, label, ButtonStyle.Secondary, {
        emoji: '⏳',
        disabled: true
      })
    );
  }

  // Common select menu options
  public static readonly COMMON_OPTIONS = {
    BOOLEAN: [
      { label: 'Yes', value: 'true', emoji: '✅' },
      { label: 'No', value: 'false', emoji: '❌' }
    ],
    PRIORITY: [
      { label: 'Low', value: 'low', emoji: '🟢' },
      { label: 'Medium', value: 'medium', emoji: '🟡' },
      { label: 'High', value: 'high', emoji: '🟠' },
      { label: 'Critical', value: 'critical', emoji: '🔴' }
    ],
    DIFFICULTY: [
      { label: 'Easy', value: 'easy', emoji: '🟢' },
      { label: 'Medium', value: 'medium', emoji: '🟡' },
      { label: 'Hard', value: 'hard', emoji: '🔴' },
      { label: 'Expert', value: 'expert', emoji: '⚫' }
    ]
  };
}