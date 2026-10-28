import { Client } from 'discord.js';
import { LocalCommand } from '../dev';
import { getAppCommands } from './getAppCommands';
import { areCommandsDifferent } from './areCommandsDifferent';
import { Clientlogger } from '../logger';

export async function registerCommands({
  client,
  commands: localCommands,
  guild,
}: {
  client: Client;
  commands: LocalCommand[];
  guild?: string;
}) {
  const applicationCommands = (await getAppCommands(client, guild)) as any;

  for (const localCommand of localCommands) {
    const {
      name,
      name_localizations,
      description,
      description_localizations,
      default_member_permissions,
      dm_permission,
      options,
    } = localCommand;

    const existingCommand = applicationCommands.cache.find((cmd: any) => cmd.name === name);
    const commandPayload = {
      name,
      name_localizations,
      description,
      description_localizations,
      default_member_permissions,
      dm_permission,
      nsfw: (localCommand as any).nsfw,
      type: (localCommand as any).type,
      options,
    };

    if (existingCommand) {
      if (localCommand.deleted) {
        await applicationCommands.delete(existingCommand.id);

        let message = `🗑 Deleted command "${name}".`;

        Clientlogger.info(message);

        continue;
      }

      if (areCommandsDifferent(existingCommand, commandPayload)) {
        await applicationCommands.edit(existingCommand.id, commandPayload);

        let message = `🔁 Edited command "${name}".`;

        Clientlogger.info(message);

      }
    } else {
      if (localCommand.deleted) {
        let message = `⏩ Skipping registering command "${name}" as it's set to delete.`;

        Clientlogger.info(message);

        continue;
      }

      await applicationCommands.create(commandPayload);

      let message = `✅ Registered command "${name}".`;

      Clientlogger.info(message);
    }
  }
}
