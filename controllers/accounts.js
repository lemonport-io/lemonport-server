const BigNumber = require('bignumber.js');
const { web3 } = require('../web3');
const Account = require('../models/account');
const { verifyTwoFactor } = require('../helpers/twoFactor');
const { getAccountTokens } = require('../web3/methods');
const { encryptAccount } = require('../web3/keystore');
const { fromWei } = require('../web3/helpers');

const getAccountBalance = async address => {
  const wei = await web3.eth.getBalance(address);
  const ether = fromWei(wei);
  const balance = BigNumber(ether).toFormat(8);
  return balance;
};

module.exports = {
  all: async (req, res, next) => {
    const user = req.foundUser;
    const accountsRaw = await Account.findAll({
      attributes: ['address', 'name', 'type', 'tokens', 'balance'],
      where: { userID: user.uuid },
      order: [['createdAt', 'ASC']]
    });
    const accounts = await Promise.all(
      accountsRaw.map(async account => {
        if (account.address) {
          const wei = await web3.eth.getBalance(account.address);
          const ether = fromWei(wei);
          const balance = BigNumber(ether).toFormat(8);
          const tokens = await getAccountTokens(account.address);
          await account.update({ balance, tokens }, { where: { address: account.address } });
        }
        return account;
      })
    );
    res.status(200).json({ accounts });
  },
  tokens: async (req, res, next) => {
    const user = req.foundUser;
    const accountsRaw = await Account.findAll({
      attributes: ['address', 'name', 'type', 'tokens', 'balance'],
      where: { userID: user.uuid },
      order: [['createdAt', 'ASC']]
    });
    const accounts = await Promise.all(
      accountsRaw.map(async account => {
        if (account.address) {
          const tokens = await getAccountTokens(account.address);
          await account.update({ tokens }, { where: { address: account.address } });
        }
        return account;
      })
    );
    res.status(200).json({ accounts });
  },
  balances: async (req, res, next) => {
    const user = req.foundUser;
    const accountsRaw = await Account.findAll({
      attributes: ['address', 'name', 'type', 'tokens', 'balance'],
      where: { userID: user.uuid },
      order: [['createdAt', 'ASC']]
    });
    const accounts = await Promise.all(
      accountsRaw.map(async account => {
        if (account.address) {
          const wei = await web3.eth.getBalance(account.address);
          const ether = fromWei(wei);
          const balance = BigNumber(ether).toFormat(8);
          await account.update({ balance }, { where: { address: account.address } });
        }
        return account;
      })
    );
    res.status(200).json({ accounts });
  },
  generate: async (req, res, next) => {
    const user = req.foundUser;
    const { name } = req.value.body;
    const generatedWallet = web3.eth.accounts.create();
    const keystore = encryptAccount(generatedWallet.privateKey, user.password);
    const walletNumber = user.walletCount + 1;
    const newAccount = await Account.create({
      name: name || null,
      address: generatedWallet.address,
      keystore,
      userID: user.uuid,
      userWallet: walletNumber
    });
    const account = {
      address: newAccount.address,
      name: newAccount.name,
      type: newAccount.type,
      tokens: newAccount.tokens,
      balance: newAccount.balance
    };
    await user.update({ walletCount: walletNumber });
    res.status(200).json({ account });
  },
  import: async (req, res, next) => {
    const user = req.foundUser;
    const { name, address, privateKey } = req.value.body;
    const keystore = encryptAccount(privateKey, user.password);
    const walletNumber = user.walletCount + 1;
    const newAccount = await Account.create({
      name: name || null,
      address,
      keystore,
      userID: user.uuid,
      userWallet: walletNumber
    });
    const account = {
      address: newAccount.address,
      name: newAccount.name,
      type: newAccount.type,
      tokens: newAccount.tokens,
      balance: newAccount.balance
    };
    await user.update({ walletCount: walletNumber });
    res.status(200).json({ account });
  },
  addAddress: async (req, res, next) => {
    const user = req.foundUser;
    const { name, address } = req.value.body;
    const walletNumber = user.walletCount + 1;
    const newAccount = await Account.create({
      name: name || null,
      address,
      userID: user.uuid,
      userWallet: walletNumber
    });
    const account = {
      address: newAccount.address,
      name: newAccount.name,
      type: newAccount.type,
      tokens: newAccount.tokens,
      balance: newAccount.balance
    };
    await user.update({ walletCount: walletNumber });
    res.status(200).json({ account });
  },
  rename: async (req, res, next) => {
    const user = req.foundUser;
    const { address, name } = req.value.body;
    const changedAccount = await Account.findOne({
      where: { address }
    });
    if (changedAccount.userID !== user.uuid) {
      return res.status(403).json({ error: true, message: 'USER_NOT_ACCOUNT_OWNER' });
    }
    changedAccount.name = name;
    const balance = await getAccountBalance(changedAccount.address);
    await changedAccount.update({ name, balance }, { fields: ['name', 'balance'] });
    const account = {
      address: changedAccount.address,
      name: changedAccount.name,
      type: changedAccount.type,
      tokens: changedAccount.tokens,
      balance: changedAccount.balance
    };
    res.status(200).json({ account });
  },
  delete: async (req, res, next) => {
    const user = req.foundUser;
    const { address, code } = req.value.body;
    const account = await Account.findOne({
      where: { address }
    });
    if (account.userID !== user.uuid) {
      return res.status(403).json({ error: true, message: 'USER_NOT_ACCOUNT_OWNER' });
    }
    if (user.twoFactor) {
      const twoFactorCheck = verifyTwoFactor(user.secret, code);
      if (twoFactorCheck.error) {
        return res.status(500).json({ error: true, message: twoFactorCheck.message });
      }
    }
    await account.destroy();
    await user.update({ walletCount: user.walletCount - 1 });
    res.status(200).json({ error: false, message: 'WALLET_SUCCESFULLY_DELETED' });
  }
};
