const express = require('express'); //eslint-disable-line
const router = require('express-promise-router')();
const passport = require('passport');
const passportConfig = require('../passport'); //eslint-disable-line
const AccountsController = require('../controllers/accounts');
const { verifyUserMiddleware } = require('../helpers/jwt');

router
  .route('/all')
  .get(
    passport.authenticate('jwt', { session: false }),
    verifyUserMiddleware,
    AccountsController.all
  );

router
  .route('/:currency')
  .get(
    passport.authenticate('jwt', { session: false }),
    verifyUserMiddleware,
    AccountsController.currency
  );

module.exports = router;
