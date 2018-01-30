const JWT = require('jsonwebtoken');
const BigNumber = require('bignumber.js');
const uuidv4 = require('uuid/v4');
const { web3 } = require('../web3');
const User = require('../models/user');
const Account = require('../models/account');
const { JWT_SECRET } = require('../config/index');
const { sendVerifyEmail } = require('../helpers/mailgun');
const { decrypt } = require('../helpers/cipher');
const { getAccountTokens } = require('../web3/methods');
const { fromWei } = require('../web3/helpers');
const { encryptAccount } = require('../web3/keystore');
const { generateSecret, verifyTwoFactor } = require('../helpers/twoFactor');

const getAllAccounts = async userID => {
  const accountsRaw = await Account.findAll({
    attributes: ['address', 'name', 'type', 'tokens', 'balance'],
    where: { userID },
    order: [['createdAt', 'ASC']]
  });
  const accounts = await Promise.all(
    accountsRaw.map(async account => {
      if (account.address) {
        const wei = await web3.eth.getBalance(account.address);
        const ether = fromWei(wei);
        const balance = BigNumber(ether).toFormat(8);
        let tokens = null;
        if (account.tokens) {
          const tokenList = account.tokens.map(token => token.symbol);
          tokens = await getAccountTokens(account.address, tokenList);
        }
        await account.update({ balance, tokens }, { where: { address: account.address } });
      }
      return account;
    })
  );
  return accounts;
};

const signToken = user => {
  return JWT.sign(
    {
      iss: 'lemonport.io',
      sub: user.uuid,
      iat: Date.now(),
      exp: Date.now() + 1800000 // 30 mins
    },
    JWT_SECRET
  );
};

module.exports = {
  signUp: async (req, res, next) => {
    const { email, password } = req.value.body;
    const foundUser = await User.findOne({ where: { email } });
    if (foundUser) {
      return res.status(403).json({ error: true, message: 'EMAIL_ALREADY_EXISTS' });
    }
    const uuid = uuidv4();
    const verified = false;
    const twoFactor = false;
    const newUser = await User.create({
      uuid,
      email,
      password,
      walletCount: 1,
      verified,
      twoFactor
    });
    const generatedWallet = web3.eth.accounts.create();
    const keystore = encryptAccount(generatedWallet.privateKey, password);
    const newAccount = await Account.create({
      address: generatedWallet.address,
      keystore,
      userID: uuid,
      userWallet: 1
    });
    const token = signToken(newUser);
    sendVerifyEmail(email);
    const account = {
      address: newAccount.address,
      name: newAccount.name,
      type: newAccount.type,
      tokens: newAccount.tokens,
      balance: newAccount.balance
    };
    res.status(200).json({ token, email, verified, twoFactor, accounts: [account] });
  },
  signIn: async (req, res, next) => {
    const { email } = req.value.body;
    const user = await User.findOne({
      attributes: ['uuid', 'verified', 'twoFactor', 'secret'],
      where: { email }
    });
    if (!user) {
      return res.status(404).json({ error: true, message: 'USER_NOT_FOUND' });
    }
    if (user.twoFactor) {
      return res.status(200).json({ error: false, message: 'REQUIRE_TWO_FACTOR' });
    }
    const token = signToken(user);
    const { verified, twoFactor } = user;
    const accounts = await getAllAccounts(user.uuid);
    res.status(200).json({ token, email, verified, twoFactor, accounts });
  },
  signInTwoFactor: async (req, res, next) => {
    const { email, code } = req.value.body;
    const user = await User.findOne({
      attributes: ['uuid', 'verified', 'twoFactor', 'secret'],
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
    const { verified, twoFactor } = user;
    const accounts = await getAllAccounts(user.uuid);
    res.status(200).json({ token, email, verified, twoFactor, accounts });
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
