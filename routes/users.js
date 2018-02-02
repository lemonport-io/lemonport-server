const express = require('express'); //eslint-disable-line
const router = require('express-promise-router')();
const passport = require('passport');
const passportConfig = require('../passport'); //eslint-disable-line
const { validateBody, schemas } = require('../helpers/joi');
const { verifyUserMiddleware } = require('../helpers/jwt');
const UsersController = require('../controllers/users');

router.route('/signup').post(validateBody(schemas.userSignupSchema), UsersController.signUp);

router
  .route('/signin')
  .post(
    validateBody(schemas.userSigninSchema),
    passport.authenticate('local', { session: false }),
    UsersController.signIn
  );

router
  .route('/signin-two-factor')
  .post(
    validateBody(schemas.userTwoFactorSchema),
    passport.authenticate('local', { session: false }),
    UsersController.signInTwoFactor
  );

router.route('/check-user').post(validateBody(schemas.checkUserSchema), UsersController.checkUser);

router.route('/verify/:hash').get(UsersController.verify);

router
  .route('/email-verified')
  .get(
    passport.authenticate('jwt', { session: false }),
    verifyUserMiddleware,
    UsersController.emailVerified
  );

router
  .route('/email-verified')
  .get(
    passport.authenticate('jwt', { session: false }),
    verifyUserMiddleware,
    UsersController.emailVerified
  );

router
  .route('/request-two-factor')
  .get(
    passport.authenticate('jwt', { session: false }),
    verifyUserMiddleware,
    UsersController.requestTwoFactor
  );

router
  .route('/enable-two-factor')
  .post(
    validateBody(schemas.enableTwoFactor),
    passport.authenticate('jwt', { session: false }),
    verifyUserMiddleware,
    UsersController.enableTwoFactor
  );

router
  .route('/check-two-factor')
  .get(
    passport.authenticate('jwt', { session: false }),
    verifyUserMiddleware,
    UsersController.checkTwoFactor
  );

router
  .route('/verify-two-factor')
  .post(
    validateBody(schemas.verifyTwoFactor),
    passport.authenticate('jwt', { session: false }),
    verifyUserMiddleware,
    UsersController.verifyTwoFactor
  );

module.exports = router;
