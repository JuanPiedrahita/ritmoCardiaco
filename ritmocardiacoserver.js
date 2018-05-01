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

//obtener mediciones de un usuario
//recibe documento del usario
router.get('/getLecturas', function (request, response) {
  	response = setHeaders(response);
  	response.contentType('application/json').status(200);
  	response.send(JSON.stringify(lecturas));
  	response.end;
});

//agregar mediciones de un usuario
//recibe documento del usuario
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

//registrar un usario nuevo
router.post('/registrarPaciente',function(request,response){
	response = setHeaders(response);
	console.log("registrar paciente");
	//console.log("body", request.body);
	//var paciente = JSON.parse(JSON.stringify(request.body));
	console.log("query",request.query);
	var paciente = JSON.parse(JSON.stringify(request.query));
	console.log("paciente",paciente);
	(async () => {		
		try {
			await postgres.executeQuery('BEGIN')
			console.log("transaction begin");
			console.log(parseFloat(paciente.estatura).toFixed(2));
			const insertPacienteValues = [paciente.documento, paciente.nombre, paciente.apellido, parseInt(paciente.edad),parseFloat( paciente.peso).toFixed(2), parseFloat(paciente.estatura).toFixed(2)]
			const { rows } = await client.query('INSERT INTO paciente(documento,nombre,apellido,edad,peso,estatura) VALUES($1,$2,$3,$4,$5,$6) RETURNING id', insertPacienteValues)
			console.log("insert paciente");
			const insertContactoVaules = [rows[0].id, paciente.correo, paciente.telefono, paciente.direccion]
			await postgres.executeQuery('INSERT INTO contacto(paciente,correo,telefono,direccion) VALUES($1,$2,$3,$4)', insertContactoVaules)
			console.log("insert contacto");
			await postgres.executeQuery('COMMIT')
			console.log("commit");
			response.status(200).send({resultado: "usuario insertado con exito"}).end();
		} catch (error) {
			await client.query('ROLLBACK')
			console.log(error);
			response.status(500).send({ error : "error insertando usuario"}).end();
		} finally {

		}
	})().catch(error => {
		console.log(error);
		response.status(500).send({ error : "error insertando usuario"}).end();
	})	
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