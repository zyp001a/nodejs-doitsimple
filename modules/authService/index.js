var utils = require("../utils/index");
var restfulService = require("../restService/index");

var getDefaultConfig = function(){
	return {
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
					access_token: "token1"
				},
				{
					userid: "user2",
					access_token: "token2"
				}
			],
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
	restfulService.start(app, config.restConfig);
	return {
		authenticateMethod: authenticateMethod
	};
};

module.exports.start = start;
