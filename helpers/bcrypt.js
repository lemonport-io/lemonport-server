const bcrypt = require('bcrypt');

/**
 * @desc validates if password is the same
 * @param  {String}  [password]
 * @param  {String}  [original]
 * @return {Boolean}
 */
const isValidPassword = async (password, original) => {
  const isValid = await bcrypt.compare(password, original);
  return isValid;
};

module.exports = {
  isValidPassword
};
