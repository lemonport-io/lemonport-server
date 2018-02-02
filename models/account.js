const Sequelize = require('sequelize');
const { DATABASE } = require('../config/index');

const sequelize = new Sequelize(DATABASE);

const Account = sequelize.define('accounts', {
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
  currency: {
    type: Sequelize.STRING
  },
  balance: {
    type: Sequelize.STRING,
    defaultValue: '0.00000000'
  },
  token: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
});

sequelize
  .sync({ force: process.env.NODE_ENV === 'development' })
  .then(() =>
    console.log(`SEQUELIZE ==> wallets table has been successfully created, if one doesn't exist`)
  )
  .catch(error => console.log('This error occured', error));

module.exports = Account;
