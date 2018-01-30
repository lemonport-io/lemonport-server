const Tx = require('ethereumjs-tx');
const BigNumber = require('bignumber.js');
const { web3 } = require('./index.js');
const { getDataString, getNakedAddress, toWei, fromWei } = require('./helpers');

/**
 * @desc gets token list
 * @return {Array}
 */
const getTokenIndex = () => {
  let tokensIndex;
  const network = web3.currentProvider.host
    .match(/(https?:\/\/)\w+/gi)[0]
    .replace(/(https?:\/\/)/gi, '');
  switch (network) {
    case 'ropsten':
      tokensIndex = require('./ropsten.json');
      break;
    case 'mainnet':
      tokensIndex = require('./mainnet.json');
      break;
    default:
      tokensIndex = null;
      break;
  }
  return tokensIndex;
};

/**
 * @desc gets token balance
 * @param  {String}  accountAddress
 * @param  {String}  tokenAddress
 * @return {Promise}
 */
const getBalanceOf = (accountAddress, tokenAddress) =>
  new Promise((resolve, reject) => {
    const balanceMethod = web3.utils.sha3('balanceOf(address)').substring(0, 10);
    const dataString = getDataString(balanceMethod, [getNakedAddress(accountAddress)]);
    web3.eth
      .call({ to: tokenAddress, data: dataString })
      .then(balance => resolve(fromWei(balance)))
      .catch(error => reject(error));
  });

/**
 * @desc get account tokens
 * @param  {String} accountAddress
 * @return {Array}
 */
const getAccountTokens = async (accountAddress, tokenList) => {
  const tokensIndex = getTokenIndex();
  let accountTokens = await Promise.all(
    tokensIndex.map(async token => {
      if (tokensIndex) {
        if (tokenList && !tokenList.includes(token.symbol)) return null;
        let balance = await getBalanceOf(accountAddress, token.address);
        if (balance === '0') {
          return null;
        }
        balance = BigNumber(balance)
          .toFormat(token.decimal, 0)
          .replace(/0+$/, '')
          .replace(/\.+$/, '');
        return { symbol: token.symbol, balance };
      }
      return null;
    })
  );
  accountTokens = accountTokens.filter(token => !!token).length
    ? accountTokens.filter(token => !!token)
    : null;
  return accountTokens;
};

/**
 * @desc sign transaction
 * @param {Object} txDetails
 * @param {String} privateKey
 * @return {String}
 */
const signTx = (txDetails, privateKey) => {
  const tx = new Tx(txDetails);
  const key = Buffer.from(privateKey, 'hex');
  tx.sign(key);
  const serializedTx = `0x${tx.serialize().toString('hex')}`;
  return serializedTx;
};

/**
 * @desc get transaction details
 * @param {String} from
 * @param {String} to
 * @param {String} data
 * @param {String} value
 * @param {String} gasPrice
 * @return {Object}
 */
const getTxDetails = async (from, to, data, value, gasPrice) => {
  const _gasPrice = gasPrice || (await web3.eth.getGasPrice());
  const estimateGasData = value === '0x00' ? { from, to, data } : { to, data };
  const gasLimit = await web3.eth.estimateGas(estimateGasData);
  const nonce = await web3.eth.getTransactionCount(from);
  const tx = {
    nonce: web3.utils.toHex(nonce),
    gasPrice: web3.utils.toHex(_gasPrice),
    gasLimit: web3.utils.toHex(gasLimit),
    value: web3.utils.toHex(value),
    data: data,
    to
  };
  return tx;
};

/**
 * @desc send signed transaction
 * @param  {Object}  transaction { from, to, value, data, gasPrice, privateKey}
 * @return {Promise}
 */
const sendSignedTransaction = transaction =>
  new Promise((resolve, reject) => {
    const from =
      transaction.from.substr(0, 2) === '0x' ? transaction.from : `0x${transaction.from}`;
    const to = transaction.to.substr(0, 2) === '0x' ? transaction.to : `0x${transaction.to}`;
    const value = transaction.value ? toWei(transaction.value) : '0x00';
    const data = transaction.data ? transaction.data : '0x';
    const privateKey =
      transaction.privateKey.substr(0, 2) === '0x'
        ? transaction.privateKey.substr(2)
        : transaction.privateKey;
    getTxDetails(from, to, data, value, transaction.gasPrice)
      .then(txDetails => {
        const signedTx = signTx(txDetails, privateKey);
        web3.eth
          .sendSignedTransaction(signedTx)
          .once('transactionHash', txHash => resolve(txHash))
          .catch(error => reject(error));
      })
      .catch(error => reject(error));
  });

/**
 * @desc transfer token
 * @param  {Object}  transaction { tokenSymbol, from, to, amount, gasPrice, privateKey}
 * @return {Promise}
 */
const transferToken = transaction =>
  new Promise((resolve, reject) => {
    const tokenObject = getTokenIndex().filter(
      token => token.symbol === transaction.tokenSymbol
    )[0];
    const transferMethod = web3.utils.sha3('transfer(address,uint256)').substring(0, 10);
    const value = new BigNumber(transaction.amount)
      .times(new BigNumber(10).pow(tokenObject.decimal))
      .toString(16);
    const recipient = getNakedAddress(transaction.to);
    const dataString = getDataString(transferMethod, [recipient, value]);
    sendSignedTransaction({
      from: transaction.from,
      to: tokenObject.address,
      data: dataString,
      gasPrice: transaction.gasPrice,
      privateKey: transaction.privateKey
    })
      .then(txHash => resolve(txHash))
      .catch(error => reject(error));
  });

module.exports = {
  getTokenIndex,
  getBalanceOf,
  sendSignedTransaction,
  getAccountTokens,
  transferToken
};
