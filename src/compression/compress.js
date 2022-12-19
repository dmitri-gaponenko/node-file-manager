import { isExist } from '../utils/fileChecker.js';
import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';
import { createBrotliCompress } from 'zlib';

const compressFile = async (pathToFile, pathToDestination) => {
  if (!pathToFile || !pathToDestination) {
    console.log('Invalid input');
    return;
  }
  try {
    if (await isExist(pathToDestination)) {
      console.log(`Operation failed. File '${pathToDestination}' already exists.`);
      return;
    }

    const input = createReadStream(pathToFile, 'utf-8');
    const output = createWriteStream(pathToDestination);
    const brotli = createBrotliCompress();

    await pipeline(input, brotli, output);
  } catch (err) {
    console.log('Operation failed');
  }
};

export { compressFile };