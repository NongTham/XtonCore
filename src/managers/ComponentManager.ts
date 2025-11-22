import { 
  Client, 
  ButtonInteraction, 
  SelectMenuInteraction, 
  ModalSubmitInteraction,
  InteractionType
} from 'discord.js';
import { ComponentHandler } from '../dev';
import { Clientlogger } from '../logger';
import { getFilePaths } from '../utils/getPaths';
import { pathToFileURL } from 'node:url';
import path from 'path';

export class ComponentManager {
  private client: Client;
  private handlers: ComponentHandler[];
  private componentsPath?: string;
  private clientHandler?: any; // Will be set after ClientHandler is fully constructed

  constructor(client: Client, componentsPath?: string) {
    this.client = client;
    this.handlers = [];
    this.componentsPath = componentsPath;
  }

  public setClientHandler(handler: any): void {
    this.clientHandler = handler;
  }

  public async initialize(): Promise<void> {
    if (this.componentsPath) {
      await this.loadComponents();
    }
    this.setupEventListeners();
    Clientlogger.info(`Component Manager initialized with ${this.handlers.length} handlers`);
  }

  private async loadComponents(): Promise<void> {
    if (!this.componentsPath) return;

    try {
      const componentFiles = await getFilePaths(this.componentsPath, true);
      
      for (const filePath of componentFiles) {
        try {
          const absolutePath = path.resolve(filePath);
          // Use require for CommonJS compatibility with ts-node
          const componentModule = require(absolutePath);
          const handler = componentModule.default || componentModule;

          if (this.isValidHandler(handler)) {
            this.handlers.push(handler);
            Clientlogger.debug(`Loaded component handler: ${handler.customId}`);
          } else {
            Clientlogger.warn(`Invalid component handler in ${filePath}`);
          }
        } catch (error) {
          Clientlogger.error(`Error loading component from ${filePath}:`, error);
        }
      }
    } catch (error) {
      Clientlogger.error('Error loading components:', error);
    }
  }

  private isValidHandler(handler: any): handler is ComponentHandler {
    return (
      handler &&
      (typeof handler.customId === 'string' || handler.customId instanceof RegExp) &&
      ['button', 'selectMenu', 'modal'].includes(handler.type) &&
      typeof handler.run === 'function'
    );
  }

  private setupEventListeners(): void {
    this.client.on('interactionCreate', async (interaction) => {
      if (interaction.isButton()) {
        await this.handleButtonInteraction(interaction);
      } else if (interaction.isSelectMenu()) {
        await this.handleSelectMenuInteraction(interaction);
      } else if (interaction.isModalSubmit()) {
        await this.handleModalInteraction(interaction);
      }
    });
  }

  private async handleButtonInteraction(interaction: ButtonInteraction): Promise<void> {
    const handler = this.findHandler(interaction.customId, 'button');
    if (handler) {
      try {
        await handler.run(interaction, this.client, this.clientHandler);
      } catch (error) {
        Clientlogger.error(`Error executing button handler for ${interaction.customId}:`, error);
        await this.handleInteractionError(interaction, error);
      }
    }
  }

  private async handleSelectMenuInteraction(interaction: SelectMenuInteraction): Promise<void> {
    const handler = this.findHandler(interaction.customId, 'selectMenu');
    if (handler) {
      try {
        await handler.run(interaction, this.client, this.clientHandler);
      } catch (error) {
        Clientlogger.error(`Error executing select menu handler for ${interaction.customId}:`, error);
        await this.handleInteractionError(interaction, error);
      }
    }
  }

  private async handleModalInteraction(interaction: ModalSubmitInteraction): Promise<void> {
    const handler = this.findHandler(interaction.customId, 'modal');
    if (handler) {
      try {
        await handler.run(interaction, this.client, this.clientHandler);
      } catch (error) {
        Clientlogger.error(`Error executing modal handler for ${interaction.customId}:`, error);
        await this.handleInteractionError(interaction, error);
      }
    }
  }

  private findHandler(customId: string, type: ComponentHandler['type']): ComponentHandler | null {
    return this.handlers.find(handler => {
      if (handler.type !== type) return false;
      
      if (typeof handler.customId === 'string') {
        return handler.customId === customId;
      } else if (handler.customId instanceof RegExp) {
        return handler.customId.test(customId);
      }
      
      return false;
    }) || null;
  }

  private async handleInteractionError(
    interaction: ButtonInteraction | SelectMenuInteraction | ModalSubmitInteraction,
    error: any
  ): Promise<void> {
    const errorMessage = 'There was an error while processing this interaction!';
    
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: errorMessage, ephemeral: true });
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    } catch (followUpError) {
      Clientlogger.error('Failed to send error message to user:', followUpError);
    }
  }

  public addHandler(handler: ComponentHandler): void {
    if (this.isValidHandler(handler)) {
      this.handlers.push(handler);
      Clientlogger.debug(`Added component handler: ${handler.customId}`);
    } else {
      throw new Error('Invalid component handler');
    }
  }

  public removeHandler(customId: string | RegExp, type: ComponentHandler['type']): boolean {
    const index = this.handlers.findIndex(handler => 
      handler.customId === customId && handler.type === type
    );
    
    if (index !== -1) {
      this.handlers.splice(index, 1);
      Clientlogger.debug(`Removed component handler: ${customId}`);
      return true;
    }
    
    return false;
  }

  public getHandlers(): ComponentHandler[] {
    return [...this.handlers];
  }

  public getHandlerCount(): number {
    return this.handlers.length;
  }
}