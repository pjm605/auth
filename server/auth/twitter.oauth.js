'use strict';

var router = require('express').Router();
var passport = require('passport');
var TwitterStrategy = require('passport-twitter');
var fs = require ('fs')
var secrets = fs.readFileSync('secrets.json', 'utf8')
// var secrets = fs.readFile('../../secrets.json', function (err, data) {
//   if(err) {
//     throw err;
//   }
//   console.log(data)
//   return data
// })
var User = require('../api/users/user.model');

router.get('/', passport.authenticate('twitter'));

router.get('/callback', passport.authenticate('twitter', {
  successRedirect: '/stories',
  failureRedirect: '/signup'
}));

passport.use(new TwitterStrategy({
  consumerKey: 'xe86sGm0HUu7qTwnQBq89dX02',
  consumerSecret: secrets.twitter,
  callbackURL: 'http://127.0.0.1:8080/auth/twitter/callback'
}, function (token, refreshToken, profile, done) {
  var info = {
    name: profile.displayName,
    // twitter may not provide an email, if so we'll just fake it
    email: profile.emails ? profile.emails[0].value : [profile.username , 'fake-auther-email.com'].join('@'),
    photo: profile.photos ? profile.photos[0].value : undefined
  };
  User.findOrCreate({
    where: {twitterId: profile.id},
    defaults: info
  })
  .spread(function (user) {
    done(null, user);
  })
  .catch(done);
}));

module.exports = router;
