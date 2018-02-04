const express = require('express'); //eslint-disable-line
const router = require('express-promise-router')();
const passport = require('passport');
const passportConfig = require('../passport'); //eslint-disable-line
const { validateBody, schemas } = require('../helpers/joi');
const BitcoinController = require('../controllers/bitcoin');
const { verifyUserMiddleware } = require('../helpers/jwt');

router
  .route('/send-bitcoin')
  .post(
    validateBody(schemas.sendBitcoinSchema),
    passport.authenticate('jwt', { session: false }),
    verifyUserMiddleware,
    BitcoinController.sendBitcoin
  );

module.exports = router;
