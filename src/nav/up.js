import { chdir } from 'process';

const up = () => {
  try {
    chdir('../');
  } catch (err) {
    console.log('Operation failed');
  }
};

export { up };