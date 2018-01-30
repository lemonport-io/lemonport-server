const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const LocalStrategy = require('passport-local').Strategy;
const { JWT_SECRET } = require('./config/index');
const User = require('./models/user');
const { isValidPassword } = require('./helpers/bcrypt');

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromHeader('authorization'),
      secretOrKey: JWT_SECRET
    },
    async (payload, done) => {
      try {
        const user = User.findOne({ where: { uuid: payload.sub } });

        if (!user) {
          return done(null, false);
        }

        done(null, user);
      } catch (err) {
        done(err, false);
      }
    }
  )
);

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email'
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
          return done(null, false, { message: 'USER_NOT_FOUND' });
        }
        const isMatch = await isValidPassword(password, user.dataValues.password);
        if (!isMatch) {
          return done(null, false, { message: 'INVALID_PASSWORD' });
        }
        done(null, user);
      } catch (error) {
        done(error, false);
      }
    }
  )
);
