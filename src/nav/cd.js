import { chdir } from 'process';

const cd = (pathToDirectory) => {
  if (!pathToDirectory) {
    console.log('Invalid input');
    return;
  }
  try {
    chdir(pathToDirectory);
  } catch (err) {
    console.log('Operation failed');
  }
};

export { cd };