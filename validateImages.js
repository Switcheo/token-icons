const fs = require('fs');
const path = require('path');
const sizeOf = require('image-size');

const dataFolderPath = path.dirname(path.dirname(__dirname)) + '/data'
const allowedExtensions = ['.svg', '.png'];
const minSize = 100;
const maxSize = 500;
const maxFileSize = 20 * 1024; // 20KB in bytess

fs.readdir(dataFolderPath, (err, files) => {
  if (err) {
    console.error('Error reading files:', err);
    process.exit(1);
  }

  files.forEach((file) => {
    // check if image is svg or png
    const extension = file.slice(-4);
    if (!allowedExtensions.includes(extension)) {
      console.error(`\nInvalid file type: ${file}`);
      console.error(`Allowed extensions: ${allowedExtensions.join(', ')}`);
      return;
    }

    const filePath = path.join(dataFolderPath, file);

    // check if image is lesser than file max size
    const fileSize = fs.statSync(filePath).size;
    if (fileSize > maxFileSize) {
      console.error(`\nFile size exceeds the limit: ${file}`);
      console.error(`File size: ${fileSize} bytes`);
      return;
    }

    try {
      console.log("script")
      const dimensions = sizeOf(filePath);
      const width = dimensions.width;
      const height = dimensions.height;

      if (width !== height) {
        console.error(`\nImage is not square: ${file}`);
        console.error(`Width: ${width}, Height: ${height}`);
        return;
      }

      if ((width < minSize || width > maxSize) && extension !== '.svg') {
        console.error(`\nImage size is not within the allowed range: ${file}`);
        console.error(`Width: ${width}, Height: ${height}`);
        return;
      }

    } catch (error) {
      console.error(`\nError reading image: ${file}`, error);
    }
  });
});