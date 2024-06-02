Imcrypt

A CLI tool for encrypting and decrypting images securely.

GitHub package.json version  
GitHub Repo stars  
npm
Tech Stack

Node  
Overview

imcrypt is a command-line tool that uses XOR encryption to encrypt and decrypt PNG, JPG, and JPEG images. It provides a secure method to encrypt images, making them unreadable without the key.
Preview

CLI Preview
Installation

To install imcrypt, run:

bash

npm install -g imcrypt

Usage
Encrypting an Image

Encrypt an image using the -e flag, specifying the input image file, and optionally the output image and key file names.

bash

imcrypt -e <input_image_path> -i <output_image_file_name> -p <output_key_file_name>

Example:

bash

imcrypt -e myImage.png -i encryptedImage.png -p keyFile.txt

Decrypting an Image

Decrypt an encrypted image using the -d flag, specifying the input encrypted image file, the key file, and optionally the output image file name.

bash

imcrypt -d <input_encrypted_image_path> -k <key_file_path> -i <output_image_file_name>

Example:

bash

imcrypt -d encryptedImage.png -k keyFile.txt -i decryptedImage.png

Options

    -e, --encrypt: The image file to encrypt.
    -d, --decrypt: The encrypted image file to decrypt.
    -i, --outputImageFileName: Specify the output image file name.
    -p, --outputKeyFileName: Specify the output key file name.
    -k, --key: The key file to use for decryption.
    -c, --clear: Clear the console after execution.
    --noClear: Do not clear the console after execution.
    -v, --version: Print CLI version.

Examples
Encrypting an Image

bash

imcrypt -e myImage.png -i encryptedImage.png -p keyFile.txt

Decrypting an Image

bash

imcrypt -d encryptedImage.png -k keyFile.txt -i decryptedImage.png

Additional Commands
Help

Print help information.

bash

imcrypt help

Output

After each operation, imcrypt provides detailed feedback on the status of the operation:

    Success messages: Operation completed successfully.
    Warning messages: Incorrect flag combinations or invalid file paths.
    Error messages: Critical issues preventing the operation from completing.

Limitations

While encryption and decryption are effective on PNG images, JPEG and JPG images may experience slight pixel changes due to the lossy nature of those formats.
License

This project is licensed under the MIT License. See the LICENSE file for details.
Author

    theninza
