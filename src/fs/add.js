import path from 'path';
import { cwd } from 'process';
import fs from 'fs/promises';

const createFile = async (fileName) => {
  if (!fileName) {
    console.log('Invalid input');
    return;
  }
  const filepath = path.join(cwd(), fileName);

  try {
    await fs.writeFile(filepath, '', { flag: 'wx' });
  } catch (err) {
    console.log('Operation failed');
  }
};

export { createFile };