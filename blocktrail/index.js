const { BlocktrailSDK } = require('blocktrail-sdk');
const BigNumber = require('bignumber.js');
const uuid = require('uuid/v4');
const { KEYSTORE_HASH, BLOCKTRAIL_API_KEY, BLOCKTRAIL_API_SECRET } = require('../config');

const bitcoinClient = BlocktrailSDK({
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
 * @param  {Number} satoshi
 * @return {BigNumber}
 */
const fromSatoshi = satoshi => BigNumber(String(satoshi)).times('1e-8');

/**
 * @desc convert from bitcoin to satoshi
 * @param  {Number} bitcoin
 * @return {BigNumber}
 */
const toSatoshi = bitcoin => BigNumber(String(bitcoin)).dividedBy('1e-8');

module.exports = {
  createBitcoinWallet,
  unlockBitcoinWallet,
  getBitcoinBalance,
  fromSatoshi,
  toSatoshi
};
