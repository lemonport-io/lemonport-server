const BigNumber = require('bignumber.js');
const { web3 } = require('../web3');
const Account = require('../models/account');
const { fromWei } = require('../web3/helpers');
const {
  getBitcoinBalance,
  fromSatoshi,
  unlockBitcoinWallet,
  generateBitcoinAddress
} = require('../blocktrail');

module.exports = {
  all: async (req, res, next) => {
    const user = req.foundUser;
    const accountsRaw = await Account.findAll({
      attributes: ['identifier', 'address', 'currency', 'balance'],
      where: { userID: user.userID },
      order: [['createdAt', 'ASC']]
    });
    const accounts = await Promise.all(
      accountsRaw.map(async account => {
        if (account.currency === 'ETH') {
          const wei = await web3.eth.getBalance(account.address);
          const ether = fromWei(wei);
          const balance = BigNumber(ether).toFormat(8);
          await account.update({ balance }, { where: { identifier: account.identifier } });
        } else if (account.currency === 'BTC') {
          const satoshi = await getBitcoinBalance(account.address);
          const bitcoin = fromSatoshi(satoshi);
          const balance = BigNumber(bitcoin).toFormat(8);
          await account.update({ balance }, { where: { identifier: account.identifier } });
        }
        return account;
      })
    );
    res.status(200).json({ accounts });
  },
  currency: async (req, res, next) => {
    const user = req.foundUser;
    const { currency } = req.params;
    const account = await Account.findOne({
      attributes: ['identifier', 'address', 'currency', 'balance'],
      where: { userID: user.userID, currency }
    });
    if (account.currency === 'ETH') {
      const wei = await web3.eth.getBalance(account.address);
      const ether = fromWei(wei);
      const balance = BigNumber(ether).toFormat(8);
      await account.update({ balance }, { where: { identifier: account.identifier } });
    } else if (account.currency === 'BTC') {
      const satoshi = await getBitcoinBalance(account.address);
      const bitcoin = fromSatoshi(satoshi);
      const balance = BigNumber(bitcoin).toFormat(8);
      await account.update({ balance }, { where: { identifier: account.identifier } });
    }
    res.status(200).json({ account });
  },
  generateBitcoinAddress: async (req, res, next) => {
    const user = req.foundUser;
    const account = await Account.findOne({
      attributes: ['identifier', 'address', 'currency', 'balance'],
      where: { userID: user.userID, currency: 'BTC' }
    });
    const btcWallet = unlockBitcoinWallet(account.identifier, user.password);
    const address = await generateBitcoinAddress(btcWallet.identifier, user.password);
    await account.update({ address }, { where: { address: account.identifier } });
    res.status(200).json({ account });
  }
};
