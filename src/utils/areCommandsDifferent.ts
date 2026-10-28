interface Command {
  [key: string]: unknown;
}

function normalize(command: Command): string {
  const keys = [
    'name',
    'name_localizations',
    'description',
    'description_localizations',
    'default_member_permissions',
    'dm_permission',
    'nsfw',
    'type',
    'options',
  ];
  return JSON.stringify(Object.fromEntries(keys.map(key => [key, command[key] ?? null])));
}

export function areCommandsDifferent(existingCommand: Command, localCommand: Command): boolean {
  return normalize(existingCommand) !== normalize(localCommand);
}
