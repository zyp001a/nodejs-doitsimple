
module.exports = function(modules){
	var API = {};
	modules.forEach(function(mod){
		API[mod] = require("./modules/"+mod+"/index");

	});

	return API;
};
