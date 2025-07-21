import { 
  Client, 
  APIApplicationCommand, 
  SlashCommandBuilder, 
  ChatInputCommandInteraction,
  ContextMenuCommandBuilder,
  ButtonInteraction,
  SelectMenuInteraction,
  ModalSubmitInteraction,
  AutocompleteInteraction,
  PermissionResolvable
} from 'discord.js';

export interface LocalCommand extends APIApplicationCommand {
  deleted?: boolean;
  cooldown?: number; // in seconds
  permissions?: PermissionResolvable[];
  aliases?: string[];
  category?: string;
  ownerOnly?: boolean;
  guildOnly?: boolean;
  nsfw?: boolean;
  run: (options: CommandRunOptions) => Promise<void>;
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
  [key: string]: any;
}

export interface CommandRunOptions {
  interaction: ChatInputCommandInteraction;
  client: Client;
  handler: any; // ClientHandler type
}

export interface ComponentHandler {
  customId: string | RegExp;
  type: 'button' | 'selectMenu' | 'modal';
  run: (interaction: ButtonInteraction | SelectMenuInteraction | ModalSubmitInteraction, client: Client, handler: any) => Promise<void>;
}

export interface ValidationFunction {
  (interaction: ChatInputCommandInteraction, command: LocalCommand, handler: any, client: Client): Promise<boolean> | boolean;
}

export interface CommandStats {
  name: string;
  uses: number;
  errors: number;
  lastUsed: Date;
  averageExecutionTime: number;
}

export interface CooldownData {
  userId: string;
  commandName: string;
  expiresAt: number;
}

export interface PerformanceMetrics {
  commandExecutions: Map<string, number>;
  commandErrors: Map<string, number>;
  commandTimes: Map<string, number[]>;
  memoryUsage: number[];
  uptime: number;
}
