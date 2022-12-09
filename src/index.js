import readline from 'readline';
import path from 'path';
import { stdin, stdout } from 'process';
import { EOL, homedir } from 'os';
import fs from 'fs/promises';
import { createReadStream } from 'fs';

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
