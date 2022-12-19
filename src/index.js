import { createInterface } from 'readline';
import { stdin, stdout, cwd, chdir } from 'process';
import { EOL, homedir } from 'os';

import { list } from './nav/list.js';
import { up } from './nav/up.js';
import { cd } from './nav/cd.js';
import { readFile } from './fs/read.js';
import { createFile } from './fs/add.js';
import { copyFile } from './fs/copy.js';
import { moveFile } from './fs/move.js';
import { deleteFile } from './fs/remove.js';
import { renameFile } from './fs/rename.js';
import { osInfo } from './os/osInfo.js';
import { compressFile } from './compression/compress.js';
import { decompressFile } from './compression/decompress.js';
import { calculateHash } from './utils/hashFile.js';
import { getUserNameFromArgs } from './utils/argsHelper.js';

chdir(homedir());

const handle = async (text) => {
  const [command, ...arg] = text.trim().split(' ');

  switch (command) {
    case 'ls':
      await list();
      break;
    case 'up':
      up();
      break;
    case 'cd':
      cd(arg.join(' '));
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

const rl = createInterface({ input: stdin, output: stdout });

const finish = () => {
  process.stdout.write(`Thank you for using File Manager, ${getUserNameFromArgs()}, goodbye!${EOL}`);
  rl.close();
  process.exit();
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
