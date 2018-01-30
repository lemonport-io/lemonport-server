const crypto = require('crypto');
const b32 = require('thirty-two');
const notp = require('notp');

/**
 * @desc generate TOTP secret
 * @param  {String}  [email]
 * @return {String}
 */
const generateSecret = email => {
  const issuer = encodeURIComponent('Lemonport');
  const bin = crypto.randomBytes(20);
  const base32 = b32
    .encode(bin)
    .toString('utf8')
    .replace(/=/g, '');
  const secret = base32
    .toLowerCase()
    .replace(/(\w{4})/g, '$1 ')
    .trim()
    .split(' ')
    .join('')
    .toUpperCase();
  const uri = `otpauth://totp/${issuer}:${encodeURIComponent(
    email
  )}?secret=${secret}&issuer=${issuer}&digits=6`;
  return { secret, uri };
};

/**
 * @desc generate TOTP code
 * @param  {String}  [secret]
 * @return {String}
 */
const generateTwoFactor = (secret, timestamp = Date.now()) => {
  const counter = Math.floor(timestamp / 1000 / 30);
  if (!secret || !secret.length) return null;
  const unformatted = secret.replace(/\W+/g, '').toUpperCase();
  const bin = b32.decode(unformatted);
  const token = notp.hotp.gen(bin, { counter });
  return token;
};

/**
 * @desc verify TOTP code
 * @param  {String}  [secret]
 * @param  {String}  [code]
 * @return {String}
 */
const verifyTwoFactor = (secret, token) => {
  if (!token || !token.length) {
    return { error: true, message: 'TWO_FACTOR_CODE_MISSING' };
  } else if (!secret || !secret.length) {
    return { error: true, message: 'FAILED_TWO_FACTOR_AUTH' };
  }
  const unformatted = secret.replace(/\W+/g, '').toUpperCase();
  const bin = b32.decode(unformatted);
  token = token.replace(/\W+/g, '');
  const result = notp.totp.verify(token, bin, {
    window: '4',
    time: 30
  });
  if (!result) {
    return { error: true, message: 'INVALID_TWO_FACTOR_CODE' };
  } else if (result.delta > 0) {
    return { error: true, message: 'EARLY_TWO_FACTOR_CODE' };
  } else if (result.delta < 0) {
    return { error: true, message: 'LATE_TWO_FACTOR_CODE' };
  } else if (result.delta === 0) {
    return { error: false, message: '' };
  }
  return { error: true, message: 'FAILED_TWO_FACTOR_AUTH' };
};

/**
 * @desc returns next TOTP timeframe
 * @return {Object} { start, end }
 */
const nextTimeframe = () => {
  const timeframe = 30000; // 30 secs
  const start =
    Math.floor(
      (Date.now() +
        Math.ceil((1 - Number('0.' + String(Date.now() / timeframe).split('.')[1])) * timeframe)) /
        10
    ) * 10;
  const end = start + timeframe;
  return { start, end };
};

module.exports = {
  generateSecret,
  generateTwoFactor,
  verifyTwoFactor,
  nextTimeframe
};
