const BigNumber = require('bignumber.js');
const uuid = require('uuid/v4');
const { web3 } = require('../web3');
const User = require('../models/user');
const Account = require('../models/account');
const { signToken } = require('../helpers/jwt');
const { sendVerifyEmail } = require('../helpers/mailgun');
const { decrypt } = require('../helpers/cipher');
const { fromWei } = require('../web3/helpers');
const { encryptAccount } = require('../web3/keystore');
const {
  createBitcoinWallet,
  generateBitcoinAddress,
  getBitcoinBalance,
  fromSatoshi
} = require('../blocktrail');
const { generateSecret, verifyTwoFactor } = require('../helpers/twoFactor');

const getAllAccounts = async userID => {
  const accountsRaw = await Account.findAll({
    attributes: ['identifier', 'address', 'currency', 'balance'],
    where: { userID },
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
  return accounts;
};

module.exports = {
  signUp: async (req, res, next) => {
    const { email, firstName, lastName, password, facebookID } = req.value.body;
    const foundUser = await User.findOne({ where: { email } });
    if (foundUser) {
      return res.status(403).json({ error: true, message: 'EMAIL_ALREADY_EXISTS' });
    }
    const userID = uuid();
    const verified = false;
    const twoFactor = false;
    const newUser = await User.create({
      userID,
      email,
      firstName,
      lastName,
      facebookID,
      password,
      verified,
      twoFactor
    });
    const ethIdentifier = uuid();
    const ethWallet = web3.eth.accounts.create();
    const ethKeystore = encryptAccount(ethWallet.privateKey, password);
    const ethAccount = await Account.create({
      identifier: ethIdentifier,
      address: ethWallet.address,
      keystore: ethKeystore,
      userID,
      currency: 'ETH'
    });
    const btcIdentifier = uuid();
    const btcWallet = await createBitcoinWallet(btcIdentifier, password);
    const address = await generateBitcoinAddress(btcWallet.identifier, password);
    const btcAccount = await Account.create({
      identifier: btcIdentifier,
      address,
      userID,
      currency: 'BTC'
    });
    const token = signToken(newUser);
    sendVerifyEmail(email);
    const accounts = [
      {
        address: ethAccount.address,
        currency: ethAccount.currency,
        balance: ethAccount.balance
      },
      {
        address: btcAccount.address,
        currency: btcAccount.currency,
        balance: btcAccount.balance
      }
    ];
    res.status(200).json({
      firstName,
      lastName,
      facebookID,
      token,
      email,
      verified,
      twoFactor,
      accounts
    });
  },
  signIn: async (req, res, next) => {
    const { email } = req.value.body;
    const user = await User.findOne({
      attributes: ['firstName', 'lastName', 'userID', 'verified', 'facebookID', 'twoFactor'],
      where: { email }
    });
    if (!user) {
      return res.status(404).json({ error: true, message: 'USER_NOT_FOUND' });
    }
    if (user.twoFactor) {
      return res.status(200).json({ error: false, message: 'REQUIRE_TWO_FACTOR' });
    }
    const token = signToken(user);
    const { firstName, lastName, facebookID, verified, twoFactor } = user;
    const accounts = await getAllAccounts(user.userID);
    res.status(200).json({
      firstName,
      lastName,
      facebookID,
      token,
      email,
      verified,
      twoFactor,
      accounts
    });
  },
  signInTwoFactor: async (req, res, next) => {
    const { email, code } = req.value.body;
    const user = await User.findOne({
      attributes: [
        'firstName',
        'lastName',
        'userID',
        'verified',
        'facebookID',
        'twoFactor',
        'secret'
      ],
      where: { email }
    });
    if (!user) {
      return res.status(404).json({ error: true, message: 'USER_NOT_FOUND' });
    }
    if (user.twoFactor) {
      const twoFactorCheck = verifyTwoFactor(user.secret, code);
      if (twoFactorCheck.error) {
        return res.status(500).json({ error: true, message: twoFactorCheck.message });
      }
    }
    const token = signToken(user);
    const { firstName, lastName, facebookID, verified, twoFactor } = user;
    const accounts = await getAllAccounts(user.userID);
    res.status(200).json({
      firstName,
      lastName,
      facebookID,
      token,
      email,
      verified,
      twoFactor,
      accounts
    });
  },
  checkUser: async (req, res, next) => {
    const { email } = req.value.body;
    const user = await User.findOne({
      where: { email }
    });
    if (!user) {
      return res.status(200).json({ error: false, message: 'USER_NOT_FOUND' });
    }
    res.status(200).json({ error: false, message: 'USER_FOUND' });
  },
  resendVerifyEmail: async (req, res, next) => {
    const { email } = req.foundUser;
    sendVerifyEmail(email);
    res.status(200).json({ error: false, message: 'VERIFY_EMAIL_SENT' });
  },
  verify: async (req, res, next) => {
    const email = decrypt(req.params.hash);
    const user = await User.findOne({
      where: { email }
    });
    await user.update({ verified: true });
    res.status(200).json({ error: false, message: 'USER_EMAIL_VERIFIED' });
  },
  emailVerified: async (req, res, next) => {
    const { verified } = req.foundUser;
    res.status(200).json({ verified });
  },
  requestTwoFactor: async (req, res, next) => {
    const user = req.foundUser;
    const { secret, uri } = generateSecret(user.email);
    await user.update({ secret });
    res.status(200).json({ uri });
  },
  enableTwoFactor: async (req, res, next) => {
    const user = req.foundUser;
    const { code } = req.value.body;
    const twoFactorCheck = verifyTwoFactor(user.secret, code);
    if (twoFactorCheck.error) {
      return res.status(500).json({ error: true, message: twoFactorCheck.message });
    }
    await user.update({ twoFactor: true });
    res.status(200).json({ twoFactor: true });
  },
  checkTwoFactor: async (req, res, next) => {
    const { twoFactor } = req.foundUser;
    res.status(200).json({ twoFactor });
  },
  verifyTwoFactor: async (req, res, next) => {
    const user = req.foundUser;
    const { code } = req.value.body;
    if (user.twoFactor) {
      const twoFactorCheck = verifyTwoFactor(user.secret, code);
      if (twoFactorCheck.error) {
        return res.status(500).json({ error: true, message: twoFactorCheck.message });
      }
    }
    res.status(200).json({ error: false, message: 'SUCCESSFUL_TWO_FACTOR_AUTH' });
  }
};
