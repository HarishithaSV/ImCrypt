const ora = require('ora');

module.exports = ({ clear }) => {
  if (clear) {
    console.clear();
  }

  const spinner = ora('Initializing CLI...').start();

  setTimeout(() => {
    spinner.succeed('CLI initialized');
  }, 1000);
};
