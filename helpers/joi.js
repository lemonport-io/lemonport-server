const Joi = require('joi');

module.exports = {
  validateBody: schema => {
    return (req, res, next) => {
      const result = Joi.validate(req.body, schema);
      if (result.error) {
        return res.status(400).json(result.error);
      }

      if (!req.value) {
        req.value = {};
      }
      req.value['body'] = result.value;
      next();
    };
  },

  schemas: {
    sendBitcoinSchema: Joi.object().keys({
      from: Joi.string().required(),
      to: Joi.string().required(),
      value: Joi.string().required(),
      code: Joi.string().allow('')
    }),
    sendEtherSchema: Joi.object().keys({
      from: Joi.string().required(),
      to: Joi.string().required(),
      value: Joi.string().required(),
      gasPrice: Joi.string().allow(''),
      code: Joi.string().allow('')
    }),
    sendTokenSchema: Joi.object().keys({
      from: Joi.string().required(),
      to: Joi.string().required(),
      amount: Joi.string().required(),
      token: Joi.string().required(),
      gasPrice: Joi.string().allow(''),
      code: Joi.string().allow('')
    }),
    checkUserSchema: Joi.object().keys({
      email: Joi.string()
        .email()
        .required()
    }),
    userSignupSchema: Joi.object().keys({
      email: Joi.string()
        .email()
        .required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      password: Joi.string().required(),
      facebookID: Joi.string().allow('')
    }),
    userSigninSchema: Joi.object().keys({
      email: Joi.string()
        .email()
        .required(),
      password: Joi.string().required(),
      facebookID: Joi.string().allow('')
    }),
    userTwoFactorSchema: Joi.object().keys({
      email: Joi.string()
        .email()
        .required(),
      password: Joi.string().required(),
      code: Joi.string().required()
    }),
    enableTwoFactor: Joi.object().keys({
      code: Joi.string().required()
    }),
    verifyTwoFactor: Joi.object().keys({
      code: Joi.string().required()
    })
  }
};
