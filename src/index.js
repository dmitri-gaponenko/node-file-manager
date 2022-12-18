import readline from 'readline';
import path from 'path';
import { stdin, stdout, cwd, chdir } from 'process';
import { EOL, homedir, cpus, userInfo, arch } from 'os';
import fs from 'fs/promises';
import { createReadStream, createWriteStream, constants } from 'fs';
import { createHash } from 'crypto';
import { pipeline } from 'stream/promises';
import zlib from 'zlib';

chdir(homedir());
const rl = readline.createInterface({ input: stdin, output: stdout });

const getUserNameFromArgs = () => {
  const prefix = '--username=';
  const userNameArg = process.argv
    .slice(2)
    .find((arg) => arg.startsWith(prefix));

  let userName = '';

  try {
    userName = userNameArg.slice(prefix.length);
  } catch (err) {
    console.log(`ERROR: '--username' parameter is not defined.`);
  }

  return userName;
};

const finish = () => {
  process.stdout.write(`Thank you for using File Manager, ${getUserNameFromArgs()}, goodbye!${EOL}`);
  rl.close();
  process.exit();
};

const list = async () => {
  try {
    const filesInFolder = await fs.readdir(cwd(), {
      withFileTypes: true,
    });
    const files = filesInFolder.filter((a) => a.isFile()).sort();
    const folders = filesInFolder.filter((a) => a.isDirectory()).sort();
    console.table(
      folders.concat(files).map((file) => {
        return { Name: file.name, Type: file.isFile() ? 'file' : 'directory' };
      })
    );
  } catch (err) {
    console.log('Operation failed');
    return null;
  }
};

const readFile = (pathToFile) => new Promise((resolve, reject) => {
  if (!pathToFile) {
    console.log('Invalid input');
    resolve();
  }
  const stream = createReadStream(pathToFile, 'utf-8');

  let data = '';

  stream.on('data', chunk => data += chunk);
  stream.on('end', () => {
    console.log(data);
    resolve();
  });
  stream.on('error', (error) => {
    console.log('Operation failed');
    resolve();
  });
});

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

const isExist = async (filepath) => {
  try {
    await fs.access(filepath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

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

const copyFile = async (pathToFile, pathToNewDirectory) => {
  if (!pathToFile || !pathToNewDirectory) {
    console.log('Invalid input');
    return;
  }
  try {
    const sourceFilePath = pathToFile;
    const targetFilePath = path.join(pathToNewDirectory, path.basename(sourceFilePath));

    if (await isExist(targetFilePath)) {
      console.log(`Operation failed. File '${targetFilePath}' already exists.`);
      return;
    }

    const readStream = createReadStream(sourceFilePath, 'utf-8');
    const writeStream = createWriteStream(targetFilePath, 'utf-8');

    await pipeline(readStream, writeStream);
  } catch (err) {
    console.log('Operation failed');
  }
};

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

const deleteFile = async (pathToFile) => {
  if (!pathToFile) {
    console.log('Invalid input');
    return;
  }
  try {
    await fs.rm(pathToFile);
  } catch (err) {
    console.log('Operation failed');
  }
};

const osInfo = (arg) => {
  switch (arg) {
    case '--EOL':
      console.log(JSON.stringify(EOL));
      break;
    case '--cpus':
      console.log(
        cpus().map((cpu) => {
          return { model: cpu.model, speed: (cpu.speed / 1000).toFixed(1)};
        })
      );
      break;
    case '--homedir':
      console.log(homedir());
      break;
    case '--username':
      console.log(userInfo().username);
      break;
    case '--architecture':
      console.log(arch());
      break;

    default:
      console.log('Invalid input');
      break;
  }
};

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
    const brotli = zlib.createBrotliCompress();

    await pipeline(input, brotli, output);
  } catch (err) {
    console.log('Operation failed');
  }
};

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
    const brotli = zlib.createBrotliDecompress();

    await pipeline(input, brotli, output);
  } catch (err) {
    console.log('Operation failed');
  }
};

const handle = async (text) => {
  const [command, ...arg] = text.trim().split(' ');

  switch (command) {
    case 'ls':
      await list();
      break;
    case 'up':
      try {
        chdir('../');
      } catch (err) {
        console.log('Operation failed');
      }
      break;
    case 'cd':
      if (!arg.join(' ')) {
        console.log('Invalid input');
      } else {
        try {
          chdir(arg.join(' '));
        } catch (err) {
          console.log('Operation failed');
        }
      }
      break;
    case 'cat':
      await readFile(arg.join(' '));
      break;
    case 'add':
      await createFile(arg.join(' '));
      break;
    case 'rn':
      await renameFile(arg[0], arg[1]);
      break;
    case 'cp':
      await copyFile(arg[0], arg[1]);
      break;
    case 'mv':
      await moveFile(arg[0], arg[1]);
      break;
    case 'rm':
      await deleteFile(arg.join(' '));
      break;
    case 'os':
      osInfo(arg.join(' '));
      break;
    case 'hash':
      await calculateHash(arg.join(' '));
      break;
    case 'compress':
      await compressFile(arg[0], arg[1]);
      break;
    case 'decompress':
      await decompressFile(arg[0], arg[1]);
      break;

    default:
      console.log('Invalid input');
      break;
  }

  printWorkingDirectoryMessage();
};

rl.on('line', (text) => {
  if (text === '.exit') {
    finish();
  }
  handle(text);
});

rl.on('SIGINT', () => {
  finish();
});

const printWorkingDirectoryMessage = () => {
  console.log(`You are currently in ${cwd()}`);
};

const runApp = () => {
  console.log(`Welcome to the File Manager, ${getUserNameFromArgs()}!${EOL}`);
  printWorkingDirectoryMessage();
};

runApp();
