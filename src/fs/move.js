import { isExist } from '../utils/fileChecker.js';
import { deleteFile } from './remove.js';
import path from 'path';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

const moveFile = async (pathToFile, pathToNewDirectory) => {
  if (!pathToFile || !pathToNewDirectory) {
    console.log('Invalid input');
    return;
  }
  try {
    const sourceFilePath = path.join(pathToFile);
    const targetFilePath = path.join(pathToNewDirectory, path.basename(sourceFilePath));

    if (await isExist(targetFilePath)) {
      console.log(`Operation failed. File '${targetFilePath}' already exists.`);
      return;
    }

    const readStream = createReadStream(sourceFilePath, 'utf-8');
    const writeStream = createWriteStream(targetFilePath, 'utf-8');

    await pipeline(readStream, writeStream);
    await deleteFile(pathToFile);
  } catch (err) {
    console.log('Operation failed');
  }
};

export { moveFile };