var mongo = require('mongodb'),
		fs = require('fs');

var Server = mongo.Server,
		Db = mongo.Db;

var extendDefaultConfig = function(defaultConfig, configToSet){
	var config = new Object(defaultConfig);
	for (var key in configToSet){
		if(!config[key]){
			console.log(new Error("Configuration Error!"+ key+"' is not exist"));
			process.exit(0);
		}
		else{
			config[key] = configToSet[key];
		}
	}
	return config;
};
module.exports.extendDefaultConfig = extendDefaultConfig;

var getMongodbHandle = function(dbconfig){
	if(!dbconfig.database || !dbconfig.host){
		console.log("mongodb host or database is not set");
		process.exit(0);
	}
	var server = new Server(dbconfig.host, dbconfig.port, 
													{auto_reconnect: true});
	var db = new Db(dbconfig.database, server, {safe: true});
	return db;
};
module.exports.getMongodbHandle = getMongodbHandle;
