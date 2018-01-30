const express = require('express'); //eslint-disable-line
const router = require('express-promise-router')();
const passport = require('passport');
const passportConfig = require('../passport'); //eslint-disable-line
const { validateBody, schemas } = require('../helpers/joi');
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
  .route('/tokens')
  .get(
    passport.authenticate('jwt', { session: false }),
    verifyUserMiddleware,
    AccountsController.tokens
  );

router
  .route('/balances')
  .get(
    passport.authenticate('jwt', { session: false }),
    verifyUserMiddleware,
    AccountsController.balances
  );

router
  .route('/generate')
  .post(
    validateBody(schemas.generateAccountSchema),
    passport.authenticate('jwt', { session: false }),
    verifyUserMiddleware,
    AccountsController.generate
  );

router
  .route('/import')
  .post(
    validateBody(schemas.importAccountSchema),
    passport.authenticate('jwt', { session: false }),
    verifyUserMiddleware,
    AccountsController.import
  );

router
  .route('/add-address')
  .post(
    validateBody(schemas.addAddressSchema),
    passport.authenticate('jwt', { session: false }),
    verifyUserMiddleware,
    AccountsController.addAddress
  );

router
  .route('/rename')
  .post(
    validateBody(schemas.renameAccountSchema),
    passport.authenticate('jwt', { session: false }),
    verifyUserMiddleware,
    AccountsController.rename
  );

router
  .route('/delete')
  .post(
    validateBody(schemas.deleteAccountSchema),
    passport.authenticate('jwt', { session: false }),
    verifyUserMiddleware,
    AccountsController.delete
  );

module.exports = router;
