// src/utils/buildCommandTree.ts (ปรับปรุง)
import { getFilePaths } from './getPaths'; // สมมติว่าเป็น async และ path ถูก resolve ถูกต้อง
import path from 'path';
import { pathToFileURL } from 'node:url'; // <--- เพิ่มการ import นี้

export async function buildCommandTree(commandsDir?: string): Promise<any[]> {
  const commandTree: any[] = [];
  if (!commandsDir) return [];
  const commandFilePaths = await getFilePaths(commandsDir, true);

  for (const commandFilePath of commandFilePaths) {
    try {
      const absolutePath = path.resolve(commandFilePath);
      // Use require for CommonJS compatibility with ts-node
      const commandModule = require(absolutePath);

      let { data, run, deleted, ...rest } = commandModule.default || commandModule;

      if (!data) throw new Error(`File ${commandFilePath} must export "data".`);
      if (!run) throw new Error(`File ${commandFilePath} must export a "run" function.`);
      if (!data.name) throw new Error(`File ${commandFilePath} must have a command name.`);
      if (!data.description) throw new Error(`File ${commandFilePath} must have a command description.`);

      try {
        data = data.toJSON ? data.toJSON() : data;
      } catch (error) { /* ปล่อยผ่านถ้า data ไม่ใช่ object ที่มี toJSON */ }

      commandTree.push({
        ...data,
        ...rest,
        deleted,
        run,
      });
    } catch (error) {
      console.error(`[XtonCoreBuilder] Error loading command from ${commandFilePath}:`, error);
    }
  }
  return commandTree;
}