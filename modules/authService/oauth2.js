
var BearerStrategy = require('passport-http-bearer').Strategy;
var passport = require('passport');
var utils = require("../utils/index");


module.exports = function(app, config){
	app.use(passport.initialize());
	var BSON = require('mongodb').BSONPure;

	var db = utils.getMongodbHandle(config.restConfig.db);

	db.open(function(err, db) {
    if(!err) {
      console.log("Connected to database:" + config.restConfig.db.database);
    }
	});


var findByToken =	function(token, fn) {

	db.collection(config.restConfig.db.entityCollection, function(err, collection) {
		if(!err){
			var token_json={};
			token_json[config.restConfig.field.token]=token;
			collection.findOne(token_json, function(err, item) {
				if(!err){
					return fn(null,item);
				}
				else{
					return fn("access token not found", null);
				}
			});
		}
		else{
			return fn("collection doesn't exist", null);	
		}

	});

}

	// Use the BearerStrategy within Passport.
	//   Strategies in Passport require a `validate` function, which accept
	//   credentials (in this case, a token), and invoke a callback with a user
	//   object.
	passport.use(new BearerStrategy({},	function(token, done) {

		// asynchronous validation, for effect...
		process.nextTick(function () {
			// Find the user by token.  If there is no user with the given token, set
			// the user to `false` to indicate failure.  Otherwise, return the
			// authenticated `user`.  Note that in a production-ready application, one
			// would want to validate the token for authenticity.
			findByToken(token, function(err, user) {
				if (err) { return done(err); }
				console.log('this is '+user);
				if (!user) { return done(null, false); }
				return done(null, user);
			});
		});
	}));


	// curl -v http://127.0.0.1:3000/authenticate?access_token=token1
	var authenticateMethod = function(req, res, next){
		passport.authenticate('bearer', { session: false }, function(err, user, info){
			if (err) { return next(err); }
			if (!user) { return next("no user"); }
			req.user = user;
      return next();
    })(req, res);
	};

	app.get('/authenticate', authenticateMethod, 
					function(req, res){
						res.json(req.user);
					});
	return authenticateMethod;
};
