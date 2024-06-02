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

const decrypt = async flags => {
	// check if flags contain encrypt flag
	if (flags.encrypt) {
		alert({
			type: `warning`,
			name: `Invalid combination of flags`,
			msg: `Cannot use both --encrypt and --decrypt flags together`
		});
		process.exit(1);
	}

	// find the value of the decrypt flag
	const filePath = flags.decrypt;

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

		spinner.succeed(`Image read successfully`);

		// handle the outputImageFileName flag
		let outputImageFile = `${fileNameWithoutExtension}_decrypted.${extension}`;
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

		// find the key file
		let keyFile = `${fileNameWithoutExtension}.key`;

		if (flags.key) {
			keyFile = path.basename(flags.key);
		} else {
			alert({
				type: `warning`,
				name: `No key file specified`,
				msg: `Please specify the key file using the --key flag`
			});
			process.exit(1);
		}

		// check if the key file exists
		if (!fs.existsSync(keyFile)) {
			alert({
				type: `warning`,
				name: `Invalid key file`,
				msg: `Please provide a valid key file`
			});
			process.exit(1);
		}

		// read the key file
		const spinner3 = ora(`Reading key file...`).start();
		const key = fs.readFileSync(keyFile, 'utf-8');
		spinner3.succeed(`Key file read successfully`);

		// convert the key to a buffer
		const keyBuffer = Buffer.from(key, 'hex');

		// get the image buffer
		const imageBuffer = await image.getBufferAsync(jimp.MIME_PNG);

		const spinner4 = ora(`Decrypting image...`).start();
		// xor the image buffer with the key buffer
		const decryptedBuffer = Buffer.alloc(imageBuffer.length);
		for (let i = 0; i < imageBuffer.length; i++) {
			decryptedBuffer[i] = imageBuffer[i] ^ keyBuffer[i % keyBuffer.length];
		}
		spinner4.succeed(`Image decrypted successfully`);

		// write the decrypted buffer to a file
		const spinner5 = ora(`Writing decrypted image to file...`).start();
		fs.writeFileSync(outputImageFile, decryptedBuffer);
		spinner5.succeed(`Decrypted image written to file`);

		// success message
		alert({
			type: `success`,
			name: `Image Decrypted`,
			msg: `Image decrypted successfully. Decrypted image written to ${outputImageFile}`
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

module.exports = decrypt;
