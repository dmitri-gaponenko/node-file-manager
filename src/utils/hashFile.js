import fs from 'fs/promises';
import { createHash } from 'crypto';

const calculateHash = async (pathToFile) => {
  if (!pathToFile) {
    console.log('Invalid input');
    return;
  }
  try {
    const hash = createHash('sha256');
    const contents = await fs.readFile(pathToFile, { encoding: 'utf8' });

    console.log(hash.update(contents).digest('hex'));
  } catch (err) {
    console.log('Operation failed');
  }
};

export { calculateHash };