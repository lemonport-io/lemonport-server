switch (process.env.NODE_ENV) {
  case 'development':
    module.exports = {
      username: 'postgres',
      password: null,
      database: 'lemonport-server',
      host: '127.0.0.1',
      dialect: 'postgres'
    };
    break;
  case 'staging':
    module.exports = {
      username: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      host: process.env.PGHOST,
      dialect: 'postgres'
    };
    break;
  case 'production':
    module.exports = {
      username: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      host: process.env.PGHOST,
      dialect: 'postgres'
    };
    break;
  default:
    console.error('Unrecognized NODE_ENV: ' + process.env.NODE_ENV); // eslint-disable-line
}
