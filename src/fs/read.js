import { createReadStream } from 'fs';

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

export { readFile };