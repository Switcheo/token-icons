const fs = require('fs');
const {join} = require('path');
const sizeOf = require('image-size');

const dataFolderPath = join(__dirname, './tokenIcons')
const allowedExtensions = ['.svg', '.png'];
const minSize = 100;
const maxSize = 500;
const maxFileSize = 100 * 1024; // 100KB in bytes

fs.readdir(dataFolderPath, (err, files) => {
  if (err) {
    console.error('Error reading files:', err);
    process.exit(1);
  }

  files.forEach((file) => {
    console.log(`running validation check on ${file}...`);

    // check if image is svg or png
    const extension = file.slice(-4);
    if (!allowedExtensions.includes(extension)) {
      console.error(`\nInvalid file type: ${file}`);
      console.error(`Allowed extensions: ${allowedExtensions.join(', ')}`);
      process.exit(1);
    }

    const filePath = join(dataFolderPath, file);

    // check if image is lesser than file max size
    const fileSize = fs.statSync(filePath).size;
    if (fileSize > maxFileSize) {
      console.error(`\nFile size exceeds the limit: ${file}`);
      console.error(`File size: ${fileSize} bytes`);
      process.exit(1);
    }

    try {
      const dimensions = sizeOf(filePath);
      const width = dimensions.width;
      const height = dimensions.height;

      if (width !== height) {
        console.error(`\nImage is not square: ${file}`);
        console.error(`Width: ${width}, Height: ${height}`);
        process.exit(1);
      }

      if ((width < minSize || width > maxSize) && extension !== '.svg') {
        console.error(`\nImage size is not within the allowed range: ${file}`);
        console.error(`Width: ${width}, Height: ${height}`);
        process.exit(1);
      }
    } catch (error) {
      console.error(`Error reading image: ${file}`, error);
    }
  });
});
