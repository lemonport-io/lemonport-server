const Account = require('../models/account');
const { sendBitcoinTransaction } = require('../web3/methods');
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
    const account = await Account.findOne({
      where: { userID: user.userID, address: from }
    });
    await sendBitcoinTransaction({
      identifier: account.identifier,
      password: user.password,
      to,
      value
    })
      .then(result => res.status(200).json({ txHash: result.hash }))
      .catch(error => res.status(500).json({ error: true, message: error.message }));
  }
};
