// passportConfig.js
import dotenv from 'dotenv';
dotenv.config();

console.log("DEBUG CLIENT_ID:", process.env.CLIENT_ID);
console.log("DEBUG CLIENT_SECRET:", process.env.CLIENT_SECRET);

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

const allowedEmails = [
  'admin@gmail.com',
];

passport.serializeUser((user, done) => {
  // store minimal identifier
  done(null, user.email);
});

passport.deserializeUser((email, done) => {
  // in real app, fetch user from DB by email
  done(null, { email });
});

passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: 'http://localhost:4500/auth/google/callback',
},
  (accessToken, refreshToken, profile, done) => {
    const emails = profile.emails;
    if (!emails || emails.length == 0) {
      return done(null, false, { message: 'No email found' });
    }
    const email = emails[0].value;
    if (allowedEmails.includes(email)) {
      const user = {
        email,
        name: profile.displayName,
        photo: profile.photos?.[0]?.value
      };
      return done(null, user);
    } else {
      return done(null, false, { message: 'Email not allowed' });
    }
  }
));
