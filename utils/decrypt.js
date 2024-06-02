const alert = require('cli-alerts');
const fs = require('fs');
const jimp = require('jimp');
const path = require('path');

const decrypt = async flags => {
  if (flags.encrypt) {
    alert({
      type: 'warning',
      name: 'Invalid combination of flags',
      msg: 'Cannot use both --encrypt and --decrypt flags together'
    });
    process.exit(1);
  }

  const imageFilePath = flags.decrypt;
  const keyFilePath = flags.key;

  if (!imageFilePath || !keyFilePath) {
    alert({
      type: 'warning',
      name: 'Invalid file path',
      msg: 'Please provide both --decrypt and --key flags'
    });
    process.exit(1);
  }

  const cwd = process.cwd();
  const fullImagePath = path.join(cwd, imageFilePath);
  const fullKeyPath = path.join(cwd, keyFilePath);

  if (!fs.existsSync(fullImagePath) || !fs.existsSync(fullKeyPath)) {
    alert({
      type: 'warning',
      name: 'Invalid file path',
      msg: 'Please provide valid file paths for both image and key files'
    });
    process.exit(1);
  }

  try {
    const ora = require('ora');
    const spinner = ora('Reading Image...').start();
    const image = await jimp.read(fullImagePath);

    spinner.succeed('Image read successfully');

    const spinner2 = ora('Decrypting image: Reading Key...').start();
    const keyData = fs.readFileSync(fullKeyPath, 'utf8');

    if (!keyData) {
      alert({
        type: 'error',
        name: 'Invalid key file',
        msg: 'Key file is empty or not readable'
      });
      process.exit(1);
    }

    const key = keyData.split(',').map(Number);

    if (key.length !== image.bitmap.data.length) {
      alert({
        type: 'error',
        name: 'Invalid key length',
        msg: 'Key length does not match the length of the image data'
      });
      process.exit(1);
    }

    spinner2.succeed('Key read successfully');

    const spinner3 = ora('Decrypting image: Decrypting image...').start();
    await new Promise(resolve => {
      const rgba = image.bitmap.data;
      const length = rgba.length;

      for (let i = 0; i < length; i++) {
        rgba[i] = rgba[i] ^ key[i];
      }

      image.bitmap.data = rgba;
      resolve();
    });

    spinner3.succeed('Decryption successful');

    const outputFileName = flags.outputImageFileName
      ? flags.outputImageFileName
      : `${path.basename(imageFilePath, path.extname(imageFilePath))}_decrypted.png`;

    const outputFilePath = path.join(cwd, outputFileName);

    const spinner4 = ora('Decrypting image: Saving image...').start();
    image.write(outputFilePath);
    spinner4.succeed('Image saved successfully');

    const chalk = require('chalk');
    console.log(
      chalk.bgGreen.black('✔ Success') +
        chalk.green(' Image decrypted successfully') +
        chalk.green('\n\n\tDecrypted Image: ') +
        chalk.bold.green(outputFileName) +
        '\n'
    );
  } catch (error) {
    alert({
      type: 'error',
      name: 'Decryption error',
      msg: error.message
    });
    process.exit(1);
  }
};

module.exports = decrypt;
