const alert = require('cli-alerts');
const fs = require('fs');
const jimp = require('jimp');
const path = require('path');

const askQuestion = query => {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve =>
    rl.question(query, ans => {
      rl.close();
      resolve(ans);
    })
  );
};

const encrypt = async flags => {
  if (flags.decrypt) {
    alert({
      type: 'warning',
      name: 'Invalid combination of flags',
      msg: 'Cannot use both --encrypt and --decrypt flags together'
    });
    process.exit(1);
  }

  const filePath = flags.encrypt;

  if (!filePath) {
    alert({
      type: 'warning',
      name: 'Invalid file path',
      msg: 'Please provide a valid file path'
    });
    process.exit(1);
  }

  const cwd = process.cwd();
  const fullPath = path.join(cwd, filePath);

  if (!fs.existsSync(fullPath)) {
    alert({
      type: 'warning',
      name: 'Invalid file path',
      msg: 'Please provide a valid file path'
    });
    process.exit(1);
  }

  try {
    const ora = require('ora');
    const spinner = ora('Reading Image...').start();
    const image = await jimp.read(fullPath);

    const extension = image.getExtension();

    if (extension === 'jpeg' || extension === 'jpg') {
      spinner.stop();
      const proceed = await askQuestion(
        `The image you are trying to encrypt is a jpeg/jpg. Some information may be lost while encryption/decryption. Do you want to proceed? (y/n) \n`
      );

      if (proceed !== 'y') {
        process.exit(0);
      }
      spinner.start();
    }

    spinner.succeed('Image read successfully');

    let outputImageFile = `${path.basename(
      filePath,
      path.extname(filePath)
    )}_encrypted.${extension}`;

    if (flags.outputImageFileName) {
      outputImageFile = path.basename(flags.outputImageFileName);

      if (!outputImageFile.includes('.')) {
        outputImageFile = `${outputImageFile}.${extension}`;
      } else {
        outputImageFile = outputImageFile.split('.')[0] + `.${extension}`;
      }
    }

    if (fs.existsSync(outputImageFile)) {
      alert({
        type: 'error',
        name: 'Invalid output image file name',
        msg: `The output image file name already exists: ${outputImageFile}
        \nPlease provide a different output image file name with --outputImageFileName/-i flag`
      });
      process.exit(1);
    }

    const keyFileName = `${path.basename(
      filePath,
      path.extname(filePath)
    )}_key.txt`;

    let outputKeyFile = keyFileName;

    if (flags.outputKeyFileName) {
      outputKeyFile = path.basename(flags.outputKeyFileName);
    }

    if (fs.existsSync(outputKeyFile)) {
      alert({
        type: 'error',
        name: 'Invalid output key file name',
        msg: `The output key file name already exists: ${outputKeyFile}
        \nPlease provide a different output key file name with --outputKeyFileName/-p flag`
      });
      process.exit(1);
    }

    const spinner2 = ora('Encrypting image: Reading Image Data').start();
    const rgba = image.bitmap.data;
    const length = rgba.length;

    spinner2.succeed('Image data read successfully');

    const spinner3 = ora('Encrypting image: Generating key').start();
    const key = [];
    for (let i = 0; i < length; i++) {
      key.push(Math.floor(Math.random() * 256));
    }

    spinner3.succeed('Key generated successfully');

    const spinner4 = ora('Encrypting image: Encrypting image').start();
    await new Promise(resolve => {
      for (let i = 0; i < length; i++) {
        rgba[i] = rgba[i] ^ key[i];
      }

      image.bitmap.data = rgba;
      resolve();
    });

    spinner4.succeed('Image encrypted successfully');

    const spinner5 = ora('Encrypting image: Saving image').start();
    image.write(outputImageFile);
    spinner5.succeed('Image saved successfully');

    const spinner6 = ora('Encrypt
