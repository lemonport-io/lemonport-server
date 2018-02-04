const database = require('./database');

switch (process.env.NODE_ENV) {
  case 'development':
    module.exports = {
      LOGGER: 'dev',
      HTTP_PROVIDER: 'https://ropsten.infura.io/',
      DOMAIN: 'http://localhost:3000',
      DATABASE: database,
      JWT_SECRET: process.env.LEMONPORT_JWT_DEVELOPMENT,
      VERIFY_SECRET: process.env.LEMONPORT_VERIFY_SECRET,
      KEYSTORE_HASH: process.env.LEMONPORT_KEYSTORE_HASH,
      MAILGUN_API_KEY: process.env.LEMONPORT_MAILGUN_API_KEY,
      MAILGUN_API_DOMAIN: process.env.LEMONPORT_MAILGUN_API_DOMAIN,
      BLOCKTRAIL_API_KEY: process.env.LEMONPORT_BLOCKTRAIL_API_KEY,
      BLOCKTRAIL_API_SECRET: process.env.LEMONPORT_BLOCKTRAIL_API_SECRET
    };
    break;
  case 'staging':
    module.exports = {
      LOGGER: 'dev',
      HTTP_PROVIDER: 'https://ropsten.infura.io/',
      DOMAIN: 'https://lemonport.io',
      DATABASE: database,
      JWT_SECRET: process.env.LEMONPORT_JWT_STAGING,
      VERIFY_SECRET: process.env.LEMONPORT_VERIFY_SECRET,
      KEYSTORE_HASH: process.env.LEMONPORT_KEYSTORE_HASH,
      MAILGUN_API_KEY: process.env.LEMONPORT_MAILGUN_API_KEY,
      MAILGUN_API_DOMAIN: process.env.LEMONPORT_MAILGUN_API_DOMAIN,
      BLOCKTRAIL_API_KEY: process.env.LEMONPORT_BLOCKTRAIL_API_KEY,
      BLOCKTRAIL_API_SECRET: process.env.LEMONPORT_BLOCKTRAIL_API_SECRET
    };
    break;
  case 'production':
    module.exports = {
      LOGGER: 'common',
      HTTP_PROVIDER: 'https://mainnet.infura.io/',
      DOMAIN: 'https://lemonport.io',
      DATABASE: database,
      JWT_SECRET: process.env.LEMONPORT_JWT_PRODUCTION,
      VERIFY_SECRET: process.env.LEMONPORT_VERIFY_SECRET,
      KEYSTORE_HASH: process.env.LEMONPORT_KEYSTORE_HASH,
      MAILGUN_API_KEY: process.env.LEMONPORT_MAILGUN_API_KEY,
      MAILGUN_API_DOMAIN: process.env.LEMONPORT_MAILGUN_API_DOMAIN,
      BLOCKTRAIL_API_KEY: process.env.LEMONPORT_BLOCKTRAIL_API_KEY,
      BLOCKTRAIL_API_SECRET: process.env.LEMONPORT_BLOCKTRAIL_API_SECRET
    };
    break;
  default:
    console.error('Unrecognized NODE_ENV: ' + process.env.NODE_ENV); // eslint-disable-line
}
