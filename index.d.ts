import { Client, APIApplicationCommand } from 'discord.js';
import { Logger } from 'winston';

class ClientHandler {
  constructor(options: ClientHandlerOptions);
  public get commands(): LocalCommand[];
}

interface ClientHandlerOptions {
  client: Client;
  commandsPath?: string;
  eventsPath?: string;
  validationsPath?: string;
  guild?: string;
}

interface LocalCommand extends APIApplicationCommand {
  deleted?: boolean;
  [key: string]: any;
}

export { ClientHandler, LocalCommand };
