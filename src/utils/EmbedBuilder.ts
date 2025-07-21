import { EmbedBuilder, ColorResolvable, User, Guild } from 'discord.js';

export class EnhancedEmbedBuilder {
  public static createBasic(
    title?: string,
    description?: string,
    color?: ColorResolvable
  ): EmbedBuilder {
    const embed = new EmbedBuilder();
    
    if (title) embed.setTitle(title);
    if (description) embed.setDescription(description);
    if (color) embed.setColor(color);
    
    embed.setTimestamp();
    
    return embed;
  }

  public static createSuccess(
    title: string = '✅ Success',
    description?: string
  ): EmbedBuilder {
    return this.createBasic(title, description, 0x00FF00);
  }

  public static createError(
    title: string = '❌ Error',
    description?: string
  ): EmbedBuilder {
    return this.createBasic(title, description, 0xFF0000);
  }

  public static createWarning(
    title: string = '⚠️ Warning',
    description?: string
  ): EmbedBuilder {
    return this.createBasic(title, description, 0xFFFF00);
  }

  public static createInfo(
    title: string = 'ℹ️ Information',
    description?: string
  ): EmbedBuilder {
    return this.createBasic(title, description, 0x0099FF);
  }

  public static createLoading(
    title: string = '⏳ Loading...',
    description?: string
  ): EmbedBuilder {
    return this.createBasic(title, description, 0x808080);
  }

  public static createUserProfile(user: User): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s Profile`)
      .setThumbnail(user.displayAvatarURL({ size: 256 }))
      .setColor(0x0099FF)
      .addFields(
        { name: 'Username', value: user.username, inline: true },
        { name: 'Discriminator', value: user.discriminator || 'None', inline: true },
        { name: 'ID', value: user.id, inline: true },
        { name: 'Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: false },
        { name: 'Bot Account', value: user.bot ? 'Yes' : 'No', inline: true }
      )
      .setTimestamp();

    return embed;
  }

  public static createGuildInfo(guild: Guild): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle(`${guild.name} Server Information`)
      .setThumbnail(guild.iconURL({ size: 256 }))
      .setColor(0x0099FF)
      .addFields(
        { name: 'Server Name', value: guild.name, inline: true },
        { name: 'Server ID', value: guild.id, inline: true },
        { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
        { name: 'Members', value: guild.memberCount.toString(), inline: true },
        { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: false },
        { name: 'Verification Level', value: guild.verificationLevel.toString(), inline: true },
        { name: 'Boost Level', value: guild.premiumTier.toString(), inline: true },
        { name: 'Boost Count', value: guild.premiumSubscriptionCount?.toString() || '0', inline: true }
      )
      .setTimestamp();

    if (guild.description) {
      embed.addFields({ name: 'Description', value: guild.description, inline: false });
    }

    return embed;
  }

  public static createCommandHelp(
    commandName: string,
    description: string,
    usage: string,
    examples: string[] = [],
    aliases: string[] = []
  ): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle(`📖 Command: ${commandName}`)
      .setDescription(description)
      .setColor(0x0099FF)
      .addFields(
        { name: 'Usage', value: `\`${usage}\``, inline: false }
      )
      .setTimestamp();

    if (examples.length > 0) {
      embed.addFields({
        name: 'Examples',
        value: examples.map(ex => `\`${ex}\``).join('\n'),
        inline: false
      });
    }

    if (aliases.length > 0) {
      embed.addFields({
        name: 'Aliases',
        value: aliases.map(alias => `\`${alias}\``).join(', '),
        inline: false
      });
    }

    return embed;
  }

  public static createPagination(
    items: string[],
    page: number,
    itemsPerPage: number = 10,
    title: string = 'Results'
  ): EmbedBuilder {
    const totalPages = Math.ceil(items.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageItems = items.slice(startIndex, endIndex);

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(pageItems.join('\n') || 'No items found')
      .setColor(0x0099FF)
      .setFooter({ text: `Page ${page} of ${totalPages} • ${items.length} total items` })
      .setTimestamp();

    return embed;
  }

  public static createStats(stats: Record<string, string | number>): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle('📊 Statistics')
      .setColor(0x0099FF)
      .setTimestamp();

    for (const [key, value] of Object.entries(stats)) {
      embed.addFields({
        name: key,
        value: value.toString(),
        inline: true
      });
    }

    return embed;
  }

  public static createProgressBar(
    current: number,
    max: number,
    length: number = 20,
    title?: string
  ): EmbedBuilder {
    const percentage = Math.min(100, Math.max(0, (current / max) * 100));
    const filledLength = Math.round((percentage / 100) * length);
    const emptyLength = length - filledLength;
    
    const filledBar = '█'.repeat(filledLength);
    const emptyBar = '░'.repeat(emptyLength);
    const progressBar = filledBar + emptyBar;

    const embed = new EmbedBuilder()
      .setColor(percentage === 100 ? 0x00FF00 : 0x0099FF)
      .addFields({
        name: title || 'Progress',
        value: `${progressBar} ${percentage.toFixed(1)}%\n${current}/${max}`,
        inline: false
      })
      .setTimestamp();

    return embed;
  }

  // Color constants
  public static readonly COLORS = {
    SUCCESS: 0x00FF00,
    ERROR: 0xFF0000,
    WARNING: 0xFFFF00,
    INFO: 0x0099FF,
    LOADING: 0x808080,
    PURPLE: 0x9932CC,
    ORANGE: 0xFF8C00,
    PINK: 0xFF69B4,
    CYAN: 0x00FFFF,
    LIME: 0x32CD32,
    GOLD: 0xFFD700,
    SILVER: 0xC0C0C0,
    BRONZE: 0xCD7F32
  };
}