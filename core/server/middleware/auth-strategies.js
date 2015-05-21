var passport = require('passport'),
    BearerStrategy = require('passport-http-bearer').Strategy,
    ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy,
    models  = require('../models');

/**
 * ClientPasswordStrategy
 *
 * This strategy is used to authenticate registered OAuth clients.  It is
 * employed to protect the `token` endpoint, which consumers use to obtain
 * access tokens.  The OAuth 2.0 specification suggests that clients use the
 * HTTP Basic scheme to authenticate (not implemented yet).

 * Use of the client password strategy is implemented to support ember-simple-auth.
 */
passport.use(new ClientPasswordStrategy(
    function (clientId, clientSecret, done) {
        models.Client.findSingle({slug: clientId})
        .then(function (model) {
            if (model) {
                var client = model.jsonify();
                if (client.secret === clientSecret) {
                    return done(null, client);
                }
            }
            return done(null, false);
        });
    }
));

/**
 * BearerStrategy
 *
 * This strategy is used to authenticate users based on an access token (aka a
 * bearer token).  The user must have previously authorized a client
 * application, which is issued an access token to make requests on behalf of
 * the authorizing user.
 */
passport.use(new BearerStrategy(
    function (accessToken, done) {
        models.Accesstoken.findSingle({token: accessToken})
        .then(function (model) {
            if (model) {
                var token = model.jsonify();
                if (token.expires > Date.now()) {
                    models.User.findSingle({_id: token.user_id})
                    .then(function (model) {
                        if (model) {
                            var user = model.jsonify(),
                                info = {scope: '*'};
                            return done(null, {_id: user._id}, info);
                        }
                        return done(null, false);
                    });
                } else {
                    return done(null, false);
                }
            } else {
                return done(null, false);
            }
        });
    }
));
