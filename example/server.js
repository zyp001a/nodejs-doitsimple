var express = require('express');
var app = express();

var path = require('path'),
    http = require('http');


var dis = require('../index')([
	'restService',
	'authService'
]);
//uploadServer.start();

app.configure(function () {
  app.set('port', process.env.PORT || 3000);
  app.use(express.logger('dev'));  /* 'default', 'short', 'tiny', 'dev' */
  app.use(express.bodyParser({limit: '500mb'}));
//    app.use(express.static(path.join(__dirname, 'public')));
});

var authService = dis.authService.start(app);

var bookService = dis.restService.start(app, {
	authenticateMethod:authService.authenticateMethod
});


http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});

