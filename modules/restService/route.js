module.exports = function(app, config, utils) {
	app.get("/api"+config.restRoot, config.authenticateMethod, utils.findAll);
	app.get("/api"+config.restRoot+'/:id', config.authenticateMethod, utils.findById);
	app.post("/api"+config.restRoot, config.authenticateMethod, utils.addEntity);
	app.put("/api"+config.restRoot+'/:id', config.authenticateMethod, utils.updateEntity);
	app.delete("/api"+config.restRoot+'/:id', config.authenticateMethod, utils.deleteEntity);
};
