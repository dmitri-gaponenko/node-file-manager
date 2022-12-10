import readline from 'readline';
import path from 'path';
import { stdin, stdout } from 'process';
import { EOL, homedir, cpus, userInfo, arch } from 'os';
import fs from 'fs/promises';
import { createReadStream, createWriteStream } from 'fs';
import { createHash } from 'crypto';
import { pipeline } from 'stream';
import zlib from 'zlib';

let workingDirectory = homedir();
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

// TODO: add sorting
const list = async (filesFolderPath) => {
  try {
    const filesFolder = await fs.readdir(filesFolderPath, {
      withFileTypes: true,
    });
    console.table(
      filesFolder.map((file) => {
        return { Name: file.name, Type: file.isFile() ? 'file' : 'directory' };
      })
    );
  } catch (err) {
    // throw new Error('FS operation failed');
    return null;
  }
};

const readFile = (pathToFile) => new Promise((resolve, reject) => {
  const stream = createReadStream(path.join(workingDirectory, pathToFile), 'utf-8');

  let data = '';

  stream.on('data', chunk => data += chunk);
  stream.on('end', () => {
    console.log(data);
    resolve();
  });
  stream.on('error', (error) => { 
    console.log('Error', error.message);
    reject();
  });
});

const createFile = async (fileName) => {
  const filepath = path.join(workingDirectory, fileName);

  try {
    await fs.writeFile(filepath, '', { flag: 'wx' });
  } catch (err) {
    console.log('Error:', err);
    throw new Error('FS operation failed');
  }
};

// TODO: check if newFilePath exists
const renameFile = async (pathToFile, fileName) => {
  const oldFilePath = path.join(workingDirectory, pathToFile);
  const newFilePath = path.join(workingDirectory, fileName);

  try {
    await fs.rename(oldFilePath, newFilePath);
  } catch (err) {
    console.log('Error:', err);
    throw new Error('FS operation failed');
  }
};

const copyFile = async (pathToFile, pathToNewDirectory) => new Promise((resolve, reject) => {
  const sourceFilePath = path.join(workingDirectory, pathToFile);
  const targetFilePath = path.join(workingDirectory, pathToNewDirectory, path.basename(sourceFilePath));

  const readStream = createReadStream(sourceFilePath, 'utf-8');
  readStream.on('error', (error) => {
    console.log('Error', error.message);
    reject();
  });

  const writeStream = createWriteStream(targetFilePath, 'utf-8');
  writeStream.on('error', (error) => {
    console.log('Error', error.message);
    reject();
  });
  writeStream.on('close', () => {
    resolve();
  });

  readStream.pipe(writeStream);
});

const moveFile = async (pathToFile, pathToNewDirectory) => new Promise((resolve, reject) => {
  const sourceFilePath = path.join(workingDirectory, pathToFile);
  const targetFilePath = path.join(workingDirectory, pathToNewDirectory, path.basename(sourceFilePath));

  const readStream = createReadStream(sourceFilePath, 'utf-8');
  readStream.on('error', (error) => {
    console.log('Error', error.message);
    reject();
  });

  const writeStream = createWriteStream(targetFilePath, 'utf-8');
  writeStream.on('error', (error) => {
    console.log('Error', error.message);
    reject();
  });
  writeStream.on('close', async () => {
    await deleteFile(pathToFile);
    resolve();
  });

  readStream.pipe(writeStream);
});

const deleteFile = async (pathToFile) => {
  const fileToRemove = path.join(workingDirectory, pathToFile);

  try {
    await fs.rm(fileToRemove);
  } catch (err) {
    console.log('Error', err.message);
    throw new Error('FS operation failed');
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
          return { model: cpu.model, speed: cpu.speed };
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
      break;
  }
};

const calculateHash = async (pathToFile) => {
  const hash = createHash('sha256');
  const filePath = path.join(workingDirectory, pathToFile);
  const contents = await fs.readFile(filePath, { encoding: 'utf8' });

  console.log(hash.update(contents).digest('hex'));
};

const compressFile = async (pathToFile, pathToDestination) => {
  const input = createReadStream(path.join(workingDirectory, pathToFile), 'utf-8');
  const output = createWriteStream(path.join(workingDirectory, `${pathToDestination}.br`));
  const brotli = zlib.createBrotliCompress();

  pipeline(input, brotli, output, (err) => {
    if (err) {
      console.log(err);
    }
  });
};

const decompressFile = async (pathToFile, pathToDestination) => {
  const input = createReadStream(path.join(workingDirectory, pathToFile));
  const output = createWriteStream(path.join(workingDirectory, `${pathToDestination}`), 'utf-8');
  const brotli = zlib.createBrotliDecompress();

  pipeline(input, brotli, output, (err) => {
    if (err) {
      console.log(err);
    }
  });
};

const handle = async (text) => {
  const [command, ...arg] = text.split(' ');

  switch (command) {
    case 'ls':
      await list(workingDirectory);
      break;
    case 'up':
      workingDirectory = path.join(workingDirectory, '../');
      break;
    case 'cd':
      workingDirectory = path.join(workingDirectory, arg.join(' '));
      // TODO: check folder/file is exist
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
  console.log(`You are currently in ${workingDirectory}`);
};

const runApp = () => {
  console.log(`Welcome to the File Manager, ${getUserNameFromArgs()}!${EOL}`);
  printWorkingDirectoryMessage();
};

runApp();
