import { isExist } from '../utils/fileChecker.js';
import path from 'path';
import fs from 'fs/promises';

const renameFile = async (pathToFile, fileName) => {
  if (!pathToFile || !fileName) {
    console.log('Invalid input');
    return;
  }

  const oldFilePath = pathToFile;
  const newFilePath = path.join(path.dirname(oldFilePath), fileName);

  if (await isExist(newFilePath)) {
    console.log(`Operation failed. File '${fileName}' already exists.`);
    return;
  }

  try {
    await fs.rename(oldFilePath, newFilePath);
  } catch (err) {
    console.log('Operation failed');
  }
};

export { renameFile };