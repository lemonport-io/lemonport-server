const express = require('express'); //eslint-disable-line
const router = require('express-promise-router')();
const passport = require('passport');
const passportConfig = require('../passport'); //eslint-disable-line
const { validateBody, schemas } = require('../helpers/joi');
const EthereumController = require('../controllers/ethereum');
const { verifyUserMiddleware } = require('../helpers/jwt');

router
  .route('/send-ether')
  .post(
    validateBody(schemas.sendEtherSchema),
    passport.authenticate('jwt', { session: false }),
    verifyUserMiddleware,
    EthereumController.sendEther
  );

router
  .route('/send-token')
  .post(
    validateBody(schemas.sendTokenSchema),
    passport.authenticate('jwt', { session: false }),
    verifyUserMiddleware,
    EthereumController.sendToken
  );

module.exports = router;
