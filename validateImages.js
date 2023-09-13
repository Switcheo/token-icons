const fs = require('fs');
const {join} = require('path');
const sizeOf = require('image-size');

// Excluding these images from the size validation because they are difficult to fix
const excludedFiles = ['HDN.svg', 'SOM.svg'];

const tokensPath = join(__dirname, './tokens')
const blockchainsPath = join(__dirname, './blockchains')
const allowedExtensions = ['.svg', '.png'];
const minSize = 100;
const maxSize = 500;
const maxFileSize = 100 * 1024; // 100KB in bytes

function validateImages(dataFolderPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(dataFolderPath, (err, files) => {
      if (err) {
        console.error('Error reading files:', err);
        resolve(true); // Consider it as an error
      }

      let hasError = false;

      for (let file of files) {
        console.log(`running validation check on ${file}...`);

        // check if image is svg or png
        const extension = file.slice(-4);
        if (!allowedExtensions.includes(extension)) {
          console.error(`\nInvalid file type: ${file}`);
          console.error(`Allowed extensions: ${allowedExtensions.join(', ')}\n`);
          hasError = true;
        }

        const filePath = join(dataFolderPath, file);

        // check if image is lesser than file max size
        const fileSize = fs.statSync(filePath).size;
        if (fileSize > maxFileSize && !excludedFiles.includes(file)) {
          console.error(`\nFile size exceeds the limit: ${file}`);
          console.error(`File size: ${fileSize} bytes\n`);
          hasError = true;
        }

        try {
          const dimensions = sizeOf(filePath);
          const width = dimensions.width;
          const height = dimensions.height;

          if (width !== height) {
            console.error(`\nImage is not square: ${file}`);
            console.error(`Width: ${width}, Height: ${height}\n`);
            hasError = true;
          }

          if ((width < minSize || height < minSize) && extension !== '.svg') {
            console.error(`\nImage is too small: ${file}.`);
            console.error(`Please make sure the image's dimensions are at least ${minSize}x${minSize}.\n`);
            hasError = true;
          }

          if ((height > maxSize || width > maxSize) && extension !== '.svg') {
            console.error(`\nImage is too big: ${file}.`);
            console.error(`Please make sure the image's dimensions are not larger than ${maxSize}x${maxSize}.\n`);
            hasError = true;
          }
        } catch (error) {
          console.error(`Error reading image: ${file}`, error);
        }
      }

      resolve(hasError);
    });
  });
}

Promise.all([validateImages(tokensPath), validateImages(blockchainsPath)])
    .then((results) => {
      if (results.some((hasError) => hasError)) {
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
