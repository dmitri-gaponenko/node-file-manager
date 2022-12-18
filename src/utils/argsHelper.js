const getUserNameFromArgs = () => {
  const prefix = '--username=';
  const userNameArg = process.argv
    .slice(2)
    .find((arg) => arg.startsWith(prefix));

  let userName = 'anonymous';

  try {
    userName = userNameArg.slice(prefix.length);
  } catch (err) {
    console.log(`Invalid input. '--username' parameter is not defined.`);
  }

  return userName;
};

export { getUserNameFromArgs };