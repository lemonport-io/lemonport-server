const Account = require('../models/account');
const { sendSignedTransaction, transferToken } = require('../web3/methods');
const { verifyTwoFactor } = require('../helpers/twoFactor');
const { decryptAccount } = require('../web3/keystore');

module.exports = {
  sendEther: async (req, res, next) => {
    const user = req.foundUser;
    const { from, to, value, gasPrice, code } = req.value.body;
    if (user.twoFactor) {
      const twoFactorCheck = verifyTwoFactor(user.secret, code);
      if (twoFactorCheck.error) {
        return res.status(500).json({ error: true, message: twoFactorCheck.message });
      }
    }
    let account;
    account = await Account.findOne({
      where: { userID: user.userID, address: from }
    });
    const unlockedKeystore = decryptAccount(account.keystore, user.password);
    sendSignedTransaction({
      from: from,
      to: to,
      value: value,
      gasPrice,
      privateKey: unlockedKeystore.privateKey
    })
      .then(txHash => res.status(200).json({ txHash }))
      .catch(error => {
        res.status(500).json({ error: true, message: error.message });
      });
  },
  sendToken: async (req, res, next) => {
    const user = req.foundUser;
    const { from, to, token, amount, gasPrice, code } = req.value.body;
    if (user.twoFactor) {
      const twoFactorCheck = verifyTwoFactor(user.secret, code);
      if (twoFactorCheck.error) {
        return res.status(500).json({ error: true, message: twoFactorCheck.message });
      }
    }
    let account;
    account = await Account.findOne({
      where: { userID: user.userID, address: from }
    });
    const unlockedKeystore = decryptAccount(account.keystore, user.password);
    transferToken({
      tokenSymbol: token,
      from: from,
      to: to,
      amount: amount,
      gasPrice,
      privateKey: unlockedKeystore.privateKey
    })
      .then(txHash => res.status(200).json({ txHash }))
      .catch(error => {
        res.status(500).json({ error: true, message: error.message });
      });
  }
};
