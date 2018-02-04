const blocktrail = require('blocktrail-sdk');
const uuid = require('uuid/v4');
const { KEYSTORE_HASH, BLOCKTRAIL_API_KEY, BLOCKTRAIL_API_SECRET } = require('../config');

const bitcoinClient = blocktrail.BlocktrailSDK({
  apiKey: BLOCKTRAIL_API_KEY,
  apiSecret: BLOCKTRAIL_API_SECRET,
  network: 'BTC',
  testnet: process.env.NODE_ENV !== 'production'
});

/**
 * @desc create new bitcoin wallet
 * @param  {String}  password
 * @return {Object}
 */
const createBitcoinWallet = password =>
  new Promise((resolve, reject) =>
    bitcoinClient.createNewWallet(
      uuid(),
      `${KEYSTORE_HASH}${password}`,
      (err, wallet, backupInfo) => {
        if (err) {
          reject(err);
        }
        resolve(wallet, backupInfo);
      }
    )
  );

/**
 * @desc unlock bitcoin wallet
 * @param  {String}  identifier
 * @param  {String}  password
 * @return {Object}
 */
const unlockBitcoinWallet = (identifier, password) =>
  new Promise((resolve, reject) =>
    bitcoinClient.initWallet(identifier, `${KEYSTORE_HASH}${password}`, (err, wallet) => {
      if (err) {
        reject(err);
      }
      resolve(wallet);
    })
  );

/**
 * @desc get bitcoin balance
 * @param  {String}  address
 * @return {String}
 */
const getBitcoinBalance = address =>
  new Promise((resolve, reject) =>
    bitcoinClient.address(address, (err, address) => {
      if (err) {
        reject(err);
      }
      resolve(address.balance);
    })
  );

/**
 * @desc convert from satoshi to bitcoin
 * @param  {String} satoshi
 * @return {Number}
 */
const fromSatoshi = satoshi => blocktrail.toBTC(Number(satoshi.replace(/[^0-9.]/g, '')));

/**
 * @desc convert from bitcoin to satoshi
 * @param  {String} bitcoin
 * @return {Number}
 */
const toSatoshi = bitcoin => blocktrail.toSatoshi(Number(bitcoin.replace(/[^0-9.]/g, '')));

module.exports = {
  createBitcoinWallet,
  unlockBitcoinWallet,
  getBitcoinBalance,
  fromSatoshi,
  toSatoshi
};
