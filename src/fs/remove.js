import fs from 'fs/promises';

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

export { deleteFile };