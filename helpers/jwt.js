const JWT = require('jsonwebtoken');
const User = require('../models/user');
const { JWT_SECRET } = require('../config/index');

/**
 * sign user jsonwebtoken
 * @type {Object}
 */
const signToken = user => {
  return JWT.sign(
    {
      iss: 'lemonport.io',
      sub: user.userID,
      iat: Date.now(),
      exp: Date.now() + 1800000 // 30 mins
    },
    JWT_SECRET
  );
};

/**
 * @desc verify and find user middleware
 */
const verifyUserMiddleware = async (req, res, next) => {
  const token = req.headers.authorization;
  let userID = null;
  let foundUser = null;
  try {
    const jwt = JWT.verify(token, JWT_SECRET);
    userID = jwt.sub;
  } catch (error) {
    return res.status(500).json({ error: true, message: 'INVALID_JWT' });
  }
  if (userID) {
    foundUser = await User.findOne({ where: { userID } });
  } else {
    return res.status(500).json({ error: true, message: 'MISSING_USER_ID' });
  }
  if (!foundUser) {
    return res.status(404).json({ error: true, message: 'USER_NOT_FOUND' });
  }
  req.foundUser = foundUser;
  next();
};

module.exports = {
  verifyUserMiddleware,
  signToken
};
