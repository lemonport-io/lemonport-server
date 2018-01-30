const { web3 } = require('./index.js');

/**
 * @desc pad string to specific width and padding
 * @param  {String} n
 * @param  {Number} width
 * @param  {String} z
 * @return {String}
 */
const padLeft = (n, width, z) => {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
};

/**
 * @desc get ethereum contract call data string
 * @param  {String} func
 * @param  {Array}  arrVals
 * @return {String}
 */
const getDataString = (func, arrVals) => {
  let val = '';
  for (let i = 0; i < arrVals.length; i++) val += padLeft(arrVals[i], 64);
  const data = func + val;
  return data;
};

/**
 * @desc get naked ethereum address
 * @param  {String} address
 * @return {String}
 */
const getNakedAddress = address => address.toLowerCase().replace('0x', '');

/**
 * @desc convert to checksum addres
 * @param  {String} address
 * @return {String}
 */
const toChecksumAddress = address => {
  if (typeof address === 'undefined') return '';

  address = address.toLowerCase().replace('0x', '');
  const addressHash = web3.utils.sha3(address).replace('0x', '');
  let checksumAddress = '0x';

  for (let i = 0; i < address.length; i++) {
    if (parseInt(addressHash[i], 16) > 7) {
      checksumAddress += address[i].toUpperCase();
    } else {
      checksumAddress += address[i];
    }
  }
  return checksumAddress;
};

/**
 * @desc check if address is checkum
 * @param  {String} address
 * @return {String}
 */
const isChecksumAddress = address => address === toChecksumAddress(address);

/**
 * @desc sanitize hexadecimal string
 * @param  {String} address
 * @return {String}
 */
const sanitizeHex = hex => {
  hex = hex.substring(0, 2) === '0x' ? hex.substring(2) : hex;
  if (hex === '') return '';
  hex = hex.length % 2 !== 0 ? '0' + hex : hex;
  return '0x' + hex;
};

/**
 * @desc convert from wei to ether
 * @param  {Number} wei
 * @return {String}
 */
const fromWei = wei => web3.utils.fromWei(String(wei));

/**
 * @desc convert from ether to wei
 * @param  {Number} ether
 * @return {String}
 */
const toWei = ether => web3.utils.toWei(String(ether));

module.exports = {
  padLeft,
  getDataString,
  getNakedAddress,
  toChecksumAddress,
  isChecksumAddress,
  sanitizeHex,
  fromWei,
  toWei
};
