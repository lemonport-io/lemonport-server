const BigNumber = require('bignumber.js');
const { web3 } = require('../web3');
const Account = require('../models/account');
const { fromWei } = require('../web3/helpers');

module.exports = {
  all: async (req, res, next) => {
    const user = req.foundUser;
    const accountsRaw = await Account.findAll({
      attributes: ['address', 'currency', 'balance'],
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
  }
};
