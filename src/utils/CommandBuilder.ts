import { 
  SlashCommandBuilder, 
  ContextMenuCommandBuilder, 
  ApplicationCommandType,
  PermissionFlagsBits,
  ChannelType
} from 'discord.js';

export class CommandBuilder {
  public static createSlashCommand(name: string, description: string): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(name)
      .setDescription(description);
  }

  public static createUserContextMenu(name: string): ContextMenuCommandBuilder {
    return new ContextMenuCommandBuilder()
      .setName(name)
      .setType(ApplicationCommandType.User);
  }

  public static createMessageContextMenu(name: string): ContextMenuCommandBuilder {
    return new ContextMenuCommandBuilder()
      .setName(name)
      .setType(ApplicationCommandType.Message);
  }

  public static addCommonOptions(builder: SlashCommandBuilder, options: {
    guildOnly?: boolean;
    ownerOnly?: boolean;
    nsfw?: boolean;
    cooldown?: number;
    permissions?: bigint[];
  } = {}): SlashCommandBuilder {
    const { guildOnly = false, ownerOnly = false, nsfw = false } = options;

    if (guildOnly) {
      builder.setDMPermission(false);
    }

    if (nsfw) {
      builder.setNSFW(true);
    }

    return builder;
  }

  public static createSubcommandGroup(
    builder: SlashCommandBuilder,
    name: string,
    description: string
  ): SlashCommandBuilder {
    return builder.addSubcommandGroup(group =>
      group
        .setName(name)
        .setDescription(description)
    );
  }

  public static addStringOption(
    builder: SlashCommandBuilder,
    name: string,
    description: string,
    options: {
      required?: boolean;
      choices?: { name: string; value: string }[];
      autocomplete?: boolean;
      maxLength?: number;
      minLength?: number;
    } = {}
  ): SlashCommandBuilder {
    return builder.addStringOption(option => {
      option.setName(name).setDescription(description);
      
      if (options.required) option.setRequired(true);
      if (options.choices) option.addChoices(...options.choices);
      if (options.autocomplete) option.setAutocomplete(true);
      if (options.maxLength) option.setMaxLength(options.maxLength);
      if (options.minLength) option.setMinLength(options.minLength);
      
      return option;
    });
  }

  public static addIntegerOption(
    builder: SlashCommandBuilder,
    name: string,
    description: string,
    options: {
      required?: boolean;
      choices?: { name: string; value: number }[];
      autocomplete?: boolean;
      maxValue?: number;
      minValue?: number;
    } = {}
  ): SlashCommandBuilder {
    return builder.addIntegerOption(option => {
      option.setName(name).setDescription(description);
      
      if (options.required) option.setRequired(true);
      if (options.choices) option.addChoices(...options.choices);
      if (options.autocomplete) option.setAutocomplete(true);
      if (options.maxValue) option.setMaxValue(options.maxValue);
      if (options.minValue) option.setMinValue(options.minValue);
      
      return option;
    });
  }

  public static addBooleanOption(
    builder: SlashCommandBuilder,
    name: string,
    description: string,
    required: boolean = false
  ): SlashCommandBuilder {
    return builder.addBooleanOption(option =>
      option
        .setName(name)
        .setDescription(description)
        .setRequired(required)
    );
  }

  public static addUserOption(
    builder: SlashCommandBuilder,
    name: string,
    description: string,
    required: boolean = false
  ): SlashCommandBuilder {
    return builder.addUserOption(option =>
      option
        .setName(name)
        .setDescription(description)
        .setRequired(required)
    );
  }

  public static addChannelOption(
    builder: SlashCommandBuilder,
    name: string,
    description: string,
    options: {
      required?: boolean;
      channelTypes?: ChannelType[];
    } = {}
  ): SlashCommandBuilder {
    return builder.addChannelOption(option => {
      option.setName(name).setDescription(description);
      
      if (options.required) option.setRequired(true);
      if (options.channelTypes) option.addChannelTypes(...options.channelTypes);
      
      return option;
    });
  }

  public static addRoleOption(
    builder: SlashCommandBuilder,
    name: string,
    description: string,
    required: boolean = false
  ): SlashCommandBuilder {
    return builder.addRoleOption(option =>
      option
        .setName(name)
        .setDescription(description)
        .setRequired(required)
    );
  }

  public static addAttachmentOption(
    builder: SlashCommandBuilder,
    name: string,
    description: string,
    required: boolean = false
  ): SlashCommandBuilder {
    return builder.addAttachmentOption(option =>
      option
        .setName(name)
        .setDescription(description)
        .setRequired(required)
    );
  }

  // Predefined permission sets
  public static readonly PERMISSIONS = {
    ADMIN: [PermissionFlagsBits.Administrator],
    MODERATOR: [
      PermissionFlagsBits.ManageMessages,
      PermissionFlagsBits.ManageRoles,
      PermissionFlagsBits.KickMembers
    ],
    MANAGE_GUILD: [PermissionFlagsBits.ManageGuild],
    MANAGE_CHANNELS: [PermissionFlagsBits.ManageChannels],
    MANAGE_ROLES: [PermissionFlagsBits.ManageRoles],
    BAN_MEMBERS: [PermissionFlagsBits.BanMembers],
    KICK_MEMBERS: [PermissionFlagsBits.KickMembers],
    MANAGE_MESSAGES: [PermissionFlagsBits.ManageMessages],
    SEND_MESSAGES: [PermissionFlagsBits.SendMessages],
    VIEW_CHANNEL: [PermissionFlagsBits.ViewChannel]
  };

  // Common channel types
  public static readonly CHANNEL_TYPES = {
    TEXT: [ChannelType.GuildText],
    VOICE: [ChannelType.GuildVoice],
    CATEGORY: [ChannelType.GuildCategory],
    NEWS: [ChannelType.GuildNews],
    STAGE: [ChannelType.GuildStageVoice],
    FORUM: [ChannelType.GuildForum],
    TEXT_AND_NEWS: [ChannelType.GuildText, ChannelType.GuildNews],
    ALL_GUILD: [
      ChannelType.GuildText,
      ChannelType.GuildVoice,
      ChannelType.GuildCategory,
      ChannelType.GuildNews,
      ChannelType.GuildStageVoice,
      ChannelType.GuildForum
    ]
  };
}