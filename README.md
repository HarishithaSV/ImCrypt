Encrypting an Image

To encrypt an image, use the following command:

bash

imcrypt --encrypt <path-to-image> --outputImageFileName <output-image-file-name> --outputKeyFileName <output-key-file-name>

    <path-to-image>: The path to the image you want to encrypt.
    --outputImageFileName (-i): The name of the output encrypted image file. This is optional; if not provided, it will default to <image-name>_encrypted.<extension>.
    --outputKeyFileName (-p): The name of the output key file. This is optional; if not provided, it will default to <image-name>_key.txt.

Example

Encrypt an image named myImage.png and save the encrypted image as myEncryptedImage.png with the key saved as myKey.txt:

bash

imcrypt --encrypt myImage.png --outputImageFileName myEncryptedImage.png --outputKeyFileName myKey.txt

Decrypting an Image

To decrypt an image, use the following command:

bash

imcrypt --decrypt <path-to-encrypted-image> --key <path-to-key-file> --outputImageFileName <output-image-file-name>

    <path-to-encrypted-image>: The path to the encrypted image you want to decrypt.
    --key (-k): The path to the key file used for decryption.
    --outputImageFileName (-i): The name of the output decrypted image file. This is optional; if not provided, it will default to <image-name>_decrypted.<extension>.

Example

Decrypt an encrypted image named myEncryptedImage.png using the key myKey.txt and save the decrypted image as myDecryptedImage.png:

bash

imcrypt --decrypt myEncryptedImage.png --key myKey.txt --outputImageFileName myDecryptedImage.png

Options

    --encrypt, -e: Path to the image to encrypt.
    --decrypt, -d: Path to the image to decrypt.
    --outputImageFileName, -i: Output image file name.
    --outputKeyFileName, -p: Output key file name.
    --key, -k: Path to the key file for decryption.
    --clear, -c: Clear the console.
    --version, -v: Print CLI version.
    --help: Print help info.
