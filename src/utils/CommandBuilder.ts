import {
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  PermissionFlagsBits,
  ChannelType,
} from "discord.js";

type SlashCommandBuilderType =
  | SlashCommandBuilder
  | SlashCommandOptionsOnlyBuilder
  | SlashCommandSubcommandsOnlyBuilder
  | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;

export class CommandBuilder {
  public static createSlashCommand(
    name: string,
    description: string
  ): SlashCommandBuilder {
    return new SlashCommandBuilder().setName(name).setDescription(description);
  }

  public static createUserContextMenu(name: string): ContextMenuCommandBuilder {
    return new ContextMenuCommandBuilder()
      .setName(name)
      .setType(ApplicationCommandType.User);
  }

  public static createMessageContextMenu(
    name: string
  ): ContextMenuCommandBuilder {
    return new ContextMenuCommandBuilder()
      .setName(name)
      .setType(ApplicationCommandType.Message);
  }

  public static addCommonOptions(
    builder: SlashCommandBuilder,
    options: {
      guildOnly?: boolean;
      ownerOnly?: boolean;
      nsfw?: boolean;
      cooldown?: number;
      permissions?: bigint[];
    } = {}
  ): SlashCommandBuilder {
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
  ): SlashCommandSubcommandsOnlyBuilder {
    return builder.addSubcommandGroup((group) =>
      group.setName(name).setDescription(description)
    );
  }

  public static addStringOption(
    builder: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder,
    name: string,
    description: string,
    options: {
      required?: boolean;
      choices?: { name: string; value: string }[];
      autocomplete?: boolean;
      maxLength?: number;
      minLength?: number;
    } = {}
  ): SlashCommandOptionsOnlyBuilder {
    return builder.addStringOption((option) => {
      option.setName(name).setDescription(description);

      if (options.required) option.setRequired(true);
      if (options.choices) option.addChoices(...options.choices);
      if (options.autocomplete) option.setAutocomplete(true);
      if (options.maxLength) option.setMaxLength(options.maxLength);
      if (options.minLength) option.setMinLength(options.minLength);

      return option;
    }) as SlashCommandOptionsOnlyBuilder;
  }

  public static addIntegerOption(
    builder: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder,
    name: string,
    description: string,
    options: {
      required?: boolean;
      choices?: { name: string; value: number }[];
      autocomplete?: boolean;
      maxValue?: number;
      minValue?: number;
    } = {}
  ): SlashCommandOptionsOnlyBuilder {
    return builder.addIntegerOption((option) => {
      option.setName(name).setDescription(description);

      if (options.required) option.setRequired(true);
      if (options.choices) option.addChoices(...options.choices);
      if (options.autocomplete) option.setAutocomplete(true);
      if (options.maxValue) option.setMaxValue(options.maxValue);
      if (options.minValue) option.setMinValue(options.minValue);

      return option;
    }) as SlashCommandOptionsOnlyBuilder;
  }

  public static addBooleanOption(
    builder: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder,
    name: string,
    description: string,
    required: boolean = false
  ): SlashCommandOptionsOnlyBuilder {
    return builder.addBooleanOption((option) =>
      option.setName(name).setDescription(description).setRequired(required)
    ) as SlashCommandOptionsOnlyBuilder;
  }

  public static addUserOption(
    builder: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder,
    name: string,
    description: string,
    required: boolean = false
  ): SlashCommandOptionsOnlyBuilder {
    return builder.addUserOption((option) =>
      option.setName(name).setDescription(description).setRequired(required)
    ) as SlashCommandOptionsOnlyBuilder;
  }

  public static addChannelOption(
    builder: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder,
    name: string,
    description: string,
    options: {
      required?: boolean;
      channelTypes?: ChannelType[];
    } = {}
  ): SlashCommandOptionsOnlyBuilder {
    return builder.addChannelOption((option) => {
      option.setName(name).setDescription(description);

      if (options.required) option.setRequired(true);
      if (options.channelTypes)
        option.addChannelTypes(...(options.channelTypes as any));

      return option;
    }) as SlashCommandOptionsOnlyBuilder;
  }

  public static addRoleOption(
    builder: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder,
    name: string,
    description: string,
    required: boolean = false
  ): SlashCommandOptionsOnlyBuilder {
    return builder.addRoleOption((option) =>
      option.setName(name).setDescription(description).setRequired(required)
    ) as SlashCommandOptionsOnlyBuilder;
  }

  public static addAttachmentOption(
    builder: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder,
    name: string,
    description: string,
    required: boolean = false
  ): SlashCommandOptionsOnlyBuilder {
    return builder.addAttachmentOption((option) =>
      option.setName(name).setDescription(description).setRequired(required)
    ) as SlashCommandOptionsOnlyBuilder;
  }

  // Predefined permission sets
  public static readonly PERMISSIONS = {
    ADMIN: [PermissionFlagsBits.Administrator],
    MODERATOR: [
      PermissionFlagsBits.ManageMessages,
      PermissionFlagsBits.ManageRoles,
      PermissionFlagsBits.KickMembers,
    ],
    MANAGE_GUILD: [PermissionFlagsBits.ManageGuild],
    MANAGE_CHANNELS: [PermissionFlagsBits.ManageChannels],
    MANAGE_ROLES: [PermissionFlagsBits.ManageRoles],
    BAN_MEMBERS: [PermissionFlagsBits.BanMembers],
    KICK_MEMBERS: [PermissionFlagsBits.KickMembers],
    MANAGE_MESSAGES: [PermissionFlagsBits.ManageMessages],
    SEND_MESSAGES: [PermissionFlagsBits.SendMessages],
    VIEW_CHANNEL: [PermissionFlagsBits.ViewChannel],
  };

  // Common channel types
  public static readonly CHANNEL_TYPES = {
    TEXT: [ChannelType.GuildText],
    VOICE: [ChannelType.GuildVoice],
    CATEGORY: [ChannelType.GuildCategory],
    ANNOUNCEMENT: [ChannelType.GuildAnnouncement],
    STAGE: [ChannelType.GuildStageVoice],
    FORUM: [ChannelType.GuildForum],
    TEXT_AND_ANNOUNCEMENT: [
      ChannelType.GuildText,
      ChannelType.GuildAnnouncement,
    ],
    ALL_GUILD: [
      ChannelType.GuildText,
      ChannelType.GuildVoice,
      ChannelType.GuildCategory,
      ChannelType.GuildAnnouncement,
      ChannelType.GuildStageVoice,
      ChannelType.GuildForum,
    ],
  };
}
