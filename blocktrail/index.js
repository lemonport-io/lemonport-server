const { BlocktrailSDK } = require('blocktrail-sdk');
const BigNumber = require('bignumber.js');

const { KEYSTORE_HASH, BLOCKTRAIL_API_KEY, BLOCKTRAIL_API_SECRET } = require('../config');

const bitcoinClient = BlocktrailSDK({
  apiKey: BLOCKTRAIL_API_KEY,
  apiSecret: BLOCKTRAIL_API_SECRET,
  network: 'BTC',
  testnet: process.env.NODE_ENV !== 'production'
});

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

/**
 * @desc create new bitcoin wallet
 * @param  {String}  identifier
 * @param  {String}  password
 * @return {Object}
 */
const createBitcoinWallet = (identifier, password) =>
  new Promise((resolve, reject) =>
    bitcoinClient.createNewWallet(
      identifier,
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
 * @desc generate new bitcoin address
 * @param  {String}  identifier
 * @param  {String}  password
 * @return {Object}
 */
const generateBitcoinAddress = (identifier, password) =>
  new Promise((resolve, reject) =>
    bitcoinClient.initWallet(identifier, `${KEYSTORE_HASH}${password}`, (err, wallet) => {
      if (err) {
        reject(err);
      }
      wallet.getNewAddress((err, address) => {
        if (err) {
          reject(err);
        }
        resolve(address);
      });
    })
  );

/**
 * @desc generate new bitcoin address
 * @param  {String}  identifier
 * @param  {String}  password
 * @return {Object}
 */
const sendBitcoinTransaction = ({ identifier, password, to, value }) =>
  new Promise((resolve, reject) =>
    bitcoinClient.initWallet(identifier, `${KEYSTORE_HASH}${password}`, (err, wallet) => {
      if (err) {
        reject(err);
      }
      const _value = toSatoshi(value);
      wallet.pay({ [to]: _value }, (err, result) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      });
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

module.exports = {
  fromSatoshi,
  toSatoshi,
  createBitcoinWallet,
  unlockBitcoinWallet,
  generateBitcoinAddress,
  sendBitcoinTransaction,
  getBitcoinBalance
};
