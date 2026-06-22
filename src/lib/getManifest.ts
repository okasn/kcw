import fs from 'fs/promises';
import path from 'path';

export async function getManifest() {
  const filePath = path.join(
    process.cwd(),
    'public',
    'data',
    'manifest.json'
  );

  const file = await fs.readFile(filePath, 'utf8');

  return JSON.parse(file);
}