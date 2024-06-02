const alert = require('cli-alerts');
const fs = require('fs');
const jimp = require('jimp');
const path = require('path');
const readline = require('readline');

// helper functions
function askQuestion(query) {
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
}

const encrypt = async flags => {
	// check if flags contain decrypt flag
	if (flags.decrypt) {
		alert({
			type: `warning`,
			name: `Invalid combination of flags`,
			msg: `Cannot use both --encrypt and --decrypt flags together`
		});
		process.exit(1);
	}

	// find the value of the encrypt flag
	const filePath = flags.encrypt;

	// check if the filePath is a valid file path
	if (!filePath) {
		alert({
			type: `warning`,
			name: `Invalid file path`,
			msg: `Please provide a valid file path`
		});
		process.exit(1);
	}

	// get the current working directory
	const cwd = process.cwd();

	// join the filePath with the cwd
	const fullPath = path.join(cwd, filePath);

	// check if the filePath is a valid file path
	if (!fs.existsSync(fullPath)) {
		alert({
			type: `warning`,
			name: `Invalid file path`,
			msg: `Please provide a valid file path`
		});
		process.exit(1);
	}

	// read the image

	try {
		const ora = (await import('ora')).default;

		// get the base name of the file
		const fileName = path.basename(fullPath);

		// remove the extension from the file name
		const fileNameWithoutExtension = fileName.split('.')[0];

		const spinner = ora(`Reading Image...`).start();

		const image = await jimp.read(fullPath);

		// get the image extension using jimp
		const extension = image.getExtension();

		// ask question to proceed if the image is a jpeg/jpg
		if (extension === `jpeg` || extension === `jpg`) {
			spinner.stop();
			const proceed = await askQuestion(
				`The image you are trying to encrypt is a jpeg/jpg. Some information may be lost while encryption/decryption. Do you want to proceed? (y/n) \n`
			);

			if (proceed !== `y`) {
				process.exit(0);
			}
			spinner.start();
		}

		spinner.succeed(`Image read successfully`);

		// handle the outputImageFileName flag
		let outputImageFile = `${fileNameWithoutExtension}_encrypted.${extension}`;
		const spinner2 = ora(`Checking for output image file name`).start();
		if (flags.outputImageFileName) {
			outputImageFile = path.basename(flags.outputImageFileName);
			// check if the outputImageFile is the same as the input file
			if (outputImageFile === fileName) {
				spinner2.fail(
					`Output image file name cannot be the same as the input file name`
				);
				process.exit(1);
			} else {
				spinner2.succeed(
					`Output image file name is different from input file name`
				);
			}
		} else {
			spinner2.info(`Using default output image file name`);
		}

		// generate a random key 32 characters long
		const spinner3 = ora(`Generating key...`).start();
		const key = require('crypto').randomBytes(32).toString('hex');
		spinner3.succeed(`Key generated successfully`);

		// handle the outputKeyFileName flag
		let outputKeyFile = `${fileNameWithoutExtension}.key`;
		const spinner4 = ora(`Checking for output key file name`).start();
		if (flags.outputKeyFileName) {
			outputKeyFile = path.basename(flags.outputKeyFileName);
			// check if the outputKeyFile is the same as the input file
			if (outputKeyFile === fileName) {
				spinner4.fail(
					`Output key file name cannot be the same as the input file name`
				);
				process.exit(1);
			} else {
				spinner4.succeed(`Output key file name is different from input file name`);
			}
		} else {
			spinner4.info(`Using default output key file name`);
		}

		// convert the key to a buffer
		const keyBuffer = Buffer.from(key, 'hex');

		// get the image buffer
		const imageBuffer = await image.getBufferAsync(jimp.MIME_PNG);

		const spinner5 = ora(`Encrypting image...`).start();
		// xor the image buffer with the key buffer
		const encryptedBuffer = Buffer.alloc(imageBuffer.length);
		for (let i = 0; i < imageBuffer.length; i++) {
			encryptedBuffer[i] = imageBuffer[i] ^ keyBuffer[i % keyBuffer.length];
		}
		spinner5.succeed(`Image encrypted successfully`);

		// write the encrypted buffer to a file
		const spinner6 = ora(`Writing encrypted image to file...`).start();
		fs.writeFileSync(outputImageFile, encryptedBuffer);
		spinner6.succeed(`Encrypted image written to file`);

		// write the key to a file
		const spinner7 = ora(`Writing key to file...`).start();
		fs.writeFileSync(outputKeyFile, key);
		spinner7.succeed(`Key written to file`);

		// success message
		alert({
			type: `success`,
			name: `Image Encrypted`,
			msg: `Image encrypted successfully. Encrypted image written to ${outputImageFile}. Key written to ${outputKeyFile}`
		});
	} catch (err) {
		alert({
			type: `error`,
			name: `Error`,
			msg: err.message
		});
		process.exit(1);
	}
};

module.exports = encrypt;
