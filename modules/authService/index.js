var utils = require("../utils/index");
var restfulService = require("../restService/index");
var bcrypt = require('bcrypt');
const jwa = require('jwa');
const hmac = jwa('hs256');


function tokenCheckFromDb(token, db, config, fn) {
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
		//async return
	});
};
function tokenSignFromDb(user, db, config, fn){
	var token = hmac.sign(user.userid, config.secret);
	var token_json={};
	token_json[config.restConfig.field.token]=token;
	db.collection(config.restConfig.db.entityCollection, function(err, collection){
		if(err)
			console.log(err);
		else
			collection.update({userid: user.userid}, {$set: token_json}, {safe:true}, function(err, result) {									
				if(err)
					console.log(err);
				else
					fn(token);
			});
	});
};
function encryptByBcrypt(pass){
	var salt = bcrypt.genSaltSync(10);
	var hash = bcrypt.hashSync(pass, salt);
	return hash;
}
function encryptByHmac(pass){
	return hmac.sign(pass, 'asfasdfas');
}

function checkByyBcrypt(pass, encryptPass){
  return bcrypt.compareSync(pass, encryptPass);
};

var getDefaultConfig = function(){
	return {
// TODO: test if sync is needed
		passwordEncryptFunc: encryptByHmac,
// not used by default, password is encrypted and send to database, password would not return from database
//		passwordCheckFunc: checkByyBcrypt,
		tokenCheckFunc: tokenCheckFromDb,
		tokenSignFunc: tokenSignFromDb,
		tokenUnsignFunc: function(){
		},
		secret: 'aaa',

		restConfig: {
			restRoot:'/user',
			db: {
				host:'localhost',
				port:27017,
				database:'userdb',
				entityCollection:'user'
			},
			sampleData: [
				{
					userid: "user1",
					email: "user1@163.com",
					username: "aaa",
					mobile_phone: "",
					address: "",
					qq: "",
					password: encryptByHmac('123456'),
					access_token: "token1"
				},
				{
					userid: "user2",
					email: "user2@qq.com",
					username: "zzz",
					mobile_phone: "",
					address: "",
					qq: "",
					password: encryptByHmac('123457'),
					access_token: "token2"
				}
			],
//TODO userid field, password field
			field: {
				unique: ["userid"],
				token: 'access_token'
			}
		}
	};
};

var start = function(app, configToSet){
	var config = utils.extendDefaultConfig(getDefaultConfig(), configToSet);
	var authenticateMethod = require("./oauth2")(app, config);
	config.restConfig.authenticateMethod = authenticateMethod;
	var rest = restfulService.start(app, config.restConfig);
//	var require("./tokenManager")(app, config);
	var db = rest.db;
	app.get('/api/authenticate/test', authenticateMethod, 
					function(req, res){
						res.json(req.user);
					});
	app.post('/api/authenticate', function (req, res) {
		var userid = req.body.userid;
		var password = config.passwordEncryptFunc(req.body.password);

		console.log(userid);
		console.log(password);
		db.collection(config.restConfig.db.entityCollection, function(err, collection) {
			if(!err){
//				var token_json={};

				collection.findOne({
					userid: userid, 
					password: password
				}, function(err, item) {
					if(err && item === null){
//						console.log(item);
						res.send(401, 'Wrong user or password');
						return;
					}
					else{
						config.tokenSignFunc(item, db, config, function(token){
							res.json({ token: token });
						});
					}
				});
			}
			else{
				res.send(401, 'collection doesn\'t exist');
				return;	
			}
			//async return
		});		



	});

	return {
		authenticateMethod: authenticateMethod
	};
};

module.exports.start = start;
