const Sequelize = require('sequelize');
const { DATABASE } = require('../config/index');

const sequelize = new Sequelize(DATABASE);

const Account = sequelize.define('accounts', {
  identifier: {
    type: Sequelize.STRING,
    unique: true,
    primaryKey: true,
    allowNull: false
  },
  address: {
    type: Sequelize.STRING,
    allowNull: false
  },
  keystore: {
    type: Sequelize.JSON
  },
  userID: {
    type: Sequelize.STRING,
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

// .sync({ force: process.env.NODE_ENV === 'development' })
sequelize
  .sync()
  .then(() =>
    console.log(`SEQUELIZE ==> wallets table has been successfully created, if one doesn't exist`)
  )
  .catch(error => console.log('This error occured', error));

module.exports = Account;
