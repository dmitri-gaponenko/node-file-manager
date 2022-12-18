import fs from 'fs/promises';
import { cwd } from 'process';

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

export { list };