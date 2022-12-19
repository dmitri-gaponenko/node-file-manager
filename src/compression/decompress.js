import { isExist } from '../utils/fileChecker.js';
import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';
import { createBrotliDecompress } from 'zlib';

const decompressFile = async (pathToFile, pathToDestination) => {
  if (!pathToFile || !pathToDestination) {
    console.log('Invalid input');
    return;
  }
  try {
    if (await isExist(pathToDestination)) {
      console.log(`Operation failed. File '${pathToDestination}' already exists.`);
      return;
    }

    const input = createReadStream(pathToFile);
    const output = createWriteStream(pathToDestination, 'utf-8');
    const brotli = createBrotliDecompress();

    await pipeline(input, brotli, output);
  } catch (err) {
    console.log('Operation failed');
  }
};

export { decompressFile };