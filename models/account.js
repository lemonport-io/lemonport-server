const Sequelize = require('sequelize');
const { DATABASE } = require('../config/index');

const sequelize = new Sequelize(DATABASE);

const Account = sequelize.define(
  'accounts',
  {
    address: {
      type: Sequelize.STRING,
      unique: true,
      primaryKey: true,
      allowNull: false
    },
    keystore: {
      type: Sequelize.JSON
    },
    userID: {
      type: Sequelize.STRING,
      allowNull: false
    },
    userWallet: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    name: {
      type: Sequelize.STRING
    },
    type: {
      type: Sequelize.STRING
    },
    tokens: {
      type: Sequelize.ARRAY(Sequelize.JSON)
    },
    balance: {
      type: Sequelize.STRING
    }
  },
  {
    hooks: {
      beforeCreate: async user => {
        if (user.keystore) {
          user.type = 'HOT';
        } else {
          user.type = 'COLD';
        }
        if (!user.balance) {
          user.balance = '0.00000000';
        }
        if (!user.name) {
          user.name = `Wallet ${user.userWallet}`;
        }
      }
    }
  }
);

sequelize
  .sync({ force: process.env.NODE_ENV === 'development' })
  .then(() =>
    console.log(`SEQUELIZE ==> wallets table has been successfully created, if one doesn't exist`)
  )
  .catch(error => console.log('This error occured', error));

module.exports = Account;
