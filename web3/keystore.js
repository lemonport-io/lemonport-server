const { web3 } = require('./index.js');
const { KEYSTORE_HASH } = require('../config');

/**
 * @desc encrypt accounts into keystore
 * @param  {String} privateKey
 * @param  {String} password
 * @return {Object}
 */
const encryptAccount = (privateKey, password) =>
  web3.eth.accounts.encrypt(privateKey, `${KEYSTORE_HASH}${password}`);

/**
 * @desc decrypt accounts with password
 * @param  {Object} keystore
 * @param  {String} password
 * @return {Object}
 */
const decryptAccount = (keystore, password) =>
  web3.eth.accounts.decrypt(keystore, `${KEYSTORE_HASH}${password}`);

module.exports = {
  encryptAccount,
  decryptAccount
};
