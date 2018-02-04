const Account = require('../models/account');
const { unlockBitcoinWallet, toSatoshi } = require('../web3/methods');
const { verifyTwoFactor } = require('../helpers/twoFactor');

module.exports = {
  sendBitcoin: async (req, res, next) => {
    const user = req.foundUser;
    const { from, to, value, code } = req.value.body;
    if (user.twoFactor) {
      const twoFactorCheck = verifyTwoFactor(user.secret, code);
      if (twoFactorCheck.error) {
        return res.status(500).json({ error: true, message: twoFactorCheck.message });
      }
    }
    let account;
    account = await Account.findOne({
      where: { userID: user.uuid, address: from }
    });
    const bitcoinWallet = unlockBitcoinWallet(account.keystore.identifier, user.password);
    const _value = toSatoshi(value);
    bitcoinWallet.pay({ [to]: _value }, (error, result) => {
      if (error) {
        res.status(500).json({ error: true, message: error.message });
      }
      res.status(200).json({ txHash: result.hash });
    });
  }
};
