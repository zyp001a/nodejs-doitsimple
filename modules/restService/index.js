var utils = require("../utils/index");
var getDefaultConfig = function(){
	return {
		restRoot:'/books',
		db: {
			host:'localhost',
			port:27017,
			database:'bookdb',
			entityCollection:'book'
		},
		sampleData: [
			{
				name: "sample book 1",
				authors: ["unknown"],
				description: "The first sample book"
			},
			{
				name: "sample book 2",
				authors: ["unknown","adsfa"],
				description: "The second sample book"
			}
		],
		field: {
			unique: []
		},
		authenticateMethod: function(req, res, next){
			next();
		}
	};
};

var start = function(app, configToSet) {
	var config = utils.extendDefaultConfig(getDefaultConfig(), configToSet);
//	var config = require('./config');
	var db = utils.getMongodbHandle(config.db);
	var restUtils = require('./utils')(app, db, config);
	db.open(function(err, db) {
    if(!err) {
      console.log("Connected to database:" + config.db.database);
			restUtils.populateDB();
    }
	});
	require("./route")(app, config, restUtils);
	console.log("Restful Service Start at: /api" + config.restRoot);
	return {
		db: db
	};
};

module.exports.start = start;
