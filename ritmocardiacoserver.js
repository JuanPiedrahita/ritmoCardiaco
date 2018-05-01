var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var postgres = require("./postgresDB.js");


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var setHeaders = function(response){
	response.header('Access-Control-Allow-Origin', '*');
  	response.header('Access-Control-Allow-Methods', 'GET, POST');
  	response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  	return response;
}

var router = express.Router();

router.get('/getLecturas', function (request, response) {
  	response = setHeaders(response);
  	response.contentType('application/json').status(200);
  	response.send(JSON.stringify(lecturas));
  	response.end;
});

router.post('/postLecturas', function (request, response) {
	//console.log("params", request.query);
	console.log("body", request.body);
	//console.log("request", request);
  	//console.log("data", request.query.data);
	var temp = JSON.parse(JSON.stringify(request.body));
	temp.ritmo = parseInt(temp.ritmo)
	temp.tiempo = parseInt(temp.tiempo)
	lecturas.push(temp);	
  	response = setHeaders(response);
  	response.send(JSON.stringify(lecturas));
  	response.end;
});

app.use(router);

postgres.connect()
.then(()=>{
	console.log("Postgres connected");
	var server = app.listen(4040, function () {
		"use strict";
		
		var host = '0.0.0.0',
			port = server.address().port;
		
		console.log(' Server is listening at http://%s:%s', host, port);
	});
	  
})
.catch(()=>{
	console.log("ERROR: Couldn't connect, please verify config.json");
	console.log("closing");
	process.exit(2);
});

//para cerrar conexión
process.on('SIGINT',function(){
	console.log("Clossing connection");
	postgres.end()
	.then(()=>{
		console.log("Connecion closed");
		process.exit(2);
	})
})