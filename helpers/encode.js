const fs = require('fs');
const path = require('path');
/**
 * @desc encode file to pase
 * @param  {string}  email
 * @return {Boolean}
 */
const encodeBase64 = file =>
  new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, file);
    fs.readFile(filePath, (error, bitmap) => {
      if (error) {
        reject(error);
      }
      const buffer = Buffer.from(bitmap);
      const base64 = buffer.toString('base64');
      resolve(base64);
    });
  });

module.exports = {
  encodeBase64
};
