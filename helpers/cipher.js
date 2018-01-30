const crypto = require('crypto');
const { VERIFY_SECRET } = require('../config');

/**
 * @desc encrypts string with verify_secret
 * @param  {String}  [string]
 * @param  {String}  [secret=VERIFY_SECRET]
 * @return {String}
 */
const encrypt = (string, secret = VERIFY_SECRET) => {
  let cipher = crypto.createCipher('aes-256-cbc', secret);
  let encrypted = cipher.update(string, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

/**
 * @desc decrypts string with verify_secret
 * @param  {String}  [string]
 * @param  {String}  [secret=VERIFY_SECRET]
 * @return {String}
 */
const decrypt = (string, secret = VERIFY_SECRET) => {
  let decipher = crypto.createDecipher('aes-256-cbc', secret);
  let decrypted = decipher.update(string, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

module.exports = {
  encrypt,
  decrypt
};
