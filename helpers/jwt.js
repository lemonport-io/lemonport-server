const JWT = require('jsonwebtoken');
const User = require('../models/user');
const { JWT_SECRET } = require('../config/index');

/**
 * @desc verify and find user middleware
 */
const verifyUserMiddleware = async (req, res, next) => {
  const token = req.headers.authorization;
  let uuid = null;
  let foundUser = null;
  try {
    const jwt = JWT.verify(token, JWT_SECRET);
    uuid = jwt.sub;
  } catch (error) {
    return res.status(500).json({ error: true, message: 'INVALID_JWT' });
  }
  if (uuid) {
    foundUser = await User.findOne({ where: { uuid } });
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
  verifyUserMiddleware
};
