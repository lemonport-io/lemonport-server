const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');
const { DATABASE } = require('../config/index');

const sequelize = new Sequelize(DATABASE);

const User = sequelize.define(
  'users',
  {
    userID: {
      type: Sequelize.STRING,
      unique: true,
      primaryKey: true,
      allowNull: false
    },
    email: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false
    },
    facebookID: {
      type: Sequelize.STRING
    },
    firstName: {
      type: Sequelize.STRING
    },
    lastName: {
      type: Sequelize.STRING
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    verified: {
      type: Sequelize.BOOLEAN,
      allowNull: false
    },
    twoFactor: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    secret: {
      type: Sequelize.STRING
    }
  },
  {
    hooks: {
      beforeCreate: async user => {
        const salt = await bcrypt.genSalt();
        const passwordhash = await bcrypt.hash(user.password, salt);
        user.password = passwordhash;
      }
    }
  }
);

// .sync({ force: process.env.NODE_ENV === 'development' })
sequelize
  .sync()
  .then(() =>
    console.log(`SEQUELIZE ==> users table has been successfully created, if one doesn't exist`)
  )
  .catch(error => console.log('This error occured', error));

module.exports = User;
