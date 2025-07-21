import fs from 'fs/promises';
import path from 'path';

export async function getFilePaths(directory?: string, nesting?: boolean): Promise<string[]> {
  let filePaths: string[] = [];
  if (!directory) return filePaths;

  try {
    const items = await fs.readdir(directory, { withFileTypes: true });

    for (const item of items) {
      const itemPath = path.join(directory, item.name);

      if (item.isFile()) {
        filePaths.push(itemPath);
      }

      if (nesting && item.isDirectory()) {
        const nestedFiles = await getFilePaths(itemPath, true);
        filePaths = [...filePaths, ...nestedFiles];
      }
    }
  } catch (error) {
    console.error(`[XtonCoreUtils] Error reading directory ${directory}:`, error);
  }
  return filePaths;
}

export async function getFolderPaths(directory?: string, nesting?: boolean): Promise<string[]> {
  let folderPaths: string[] = [];
  if (!directory) return folderPaths;

  try {
    const items = await fs.readdir(directory, { withFileTypes: true });
    for (const item of items) {
      const itemPath = path.join(directory, item.name);
      if (item.isDirectory()) {
        folderPaths.push(itemPath);
        if (nesting) {
          const nestedFolders = await getFolderPaths(itemPath, true);
          folderPaths = [...folderPaths, ...nestedFolders];
        }
      }
    }
  } catch (error) {
    console.error(`[XtonCoreUtils] Error reading directory ${directory}:`, error);
  }
  return folderPaths;
}