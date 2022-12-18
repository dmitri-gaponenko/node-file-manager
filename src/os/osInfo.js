import { EOL, homedir, cpus, userInfo, arch } from 'os';

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

export { osInfo };