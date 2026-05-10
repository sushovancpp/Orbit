const passport = require('passport');

module.exports = () => {
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    const GoogleStrategy = require('passport-google-oauth20').Strategy;
    const User = require('../models/User');
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ oauthId: profile.id, oauthProvider: 'google' });
        if (!user) {
          user = await User.create({
            oauthId: profile.id,
            oauthProvider: 'google',
            name: profile.displayName,
            email: profile.emails[0].value,
            avatar: profile.photos[0]?.value,
            username: profile.emails[0].value.split('@')[0] + Math.floor(Math.random() * 999),
            isVerified: true,
          });
        }
        done(null, user);
      } catch (err) { done(err, null); }
    }));
  }

  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    const GitHubStrategy = require('passport-github2').Strategy;
    const User = require('../models/User');
    passport.use(new GitHubStrategy({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: '/api/auth/github/callback',
      scope: ['user:email'],
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ oauthId: profile.id, oauthProvider: 'github' });
        if (!user) {
          const email = profile.emails?.[0]?.value || `${profile.username}@github.com`;
          user = await User.create({
            oauthId: profile.id.toString(),
            oauthProvider: 'github',
            name: profile.displayName || profile.username,
            email,
            avatar: profile.photos[0]?.value,
            username: profile.username + Math.floor(Math.random() * 99),
            isVerified: true,
          });
        }
        done(null, user);
      } catch (err) { done(err, null); }
    }));
  }
};