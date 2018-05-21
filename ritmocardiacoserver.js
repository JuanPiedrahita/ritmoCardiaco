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
router.get('/obtenerMediciones', function (request, response) {
	response = setHeaders(response);
	console.log("query",request.query);
	var params = [request.query.documento];
	var sql = "select * from medicion_ritmo_cardiaco where paciente = (select id from paciente where documento like $1)";
	postgres.executeQuery(sql,params)
	.then(res => {
		console.log(res.rows);
		response.status(200).send(res.rows).end();
	})
	.catch(error => {
		console.log(error);
		response.status(500).send({ error : "error leyendo mediciones"}).end();
	})
});

//agregar mediciones de un usuario
//recibe documento del usuario
router.post('/registrarMedicion', function (request, response) {
	response = setHeaders(response);
	console.log("registrar medicion");
	//console.log("body", request.body);
	//var medicion = JSON.parse(JSON.stringify(request.body));
	console.log("query",request.body);
	var medicion = JSON.parse(JSON.stringify(request.body));
	console.log("medicion",medicion);
	(async () => {		
		try {
			await postgres.executeQuery('BEGIN')
			console.log("transaction begin");
			const insertMedicionValues = [medicion.documento,parseInt(medicion.valor),parseInt(medicion.tiempo),new Date(medicion.fecha)]
			await postgres.executeQuery('insert into medicion_ritmo_cardiaco(paciente,valor,tiempo,fecha) values ((select id from paciente where documento like $1),$2,$3,$4)', insertMedicionValues)
			console.log("insert medicion");
			await postgres.executeQuery('COMMIT')
			console.log("commit");
			response.status(200).send({resultado: "medicion insertada exitosamente"}).end();
		} catch (error) {
			//await client.query('ROLLBACK')
			console.log(error);
			response.status(500).send({ error : "error insertando medicion"}).end();
		} finally {

		}
	})().catch(error => {
		console.log(error);
		response.status(500).send({ error : "error insertando medicion"}).end();
	})	
});

//obtener pacientes
router.get('/obtenerPacientes',function(request,response){
	response = setHeaders(response);
	console.log("query",request.query);
	var params = [];
	var sql = "";
	if(request.query.documento != undefined){
		sql = "select * from paciente p, contacto c where p.id=c.id and p.documento like $1";
		params.push(request.query.documento);
	} else {
		sql = "select * from paciente p, contacto c where p.id=c.id";
	}
	postgres.executeQuery(sql,params)
	.then(res => {
		console.log(res.rows);
		response.status(200).send(res.rows).end();
	})
	.catch(error => {
		console.log(error);
		response.status(500).send({ error : "error leyendo pacientes"}).end();
	})
});

//registrar un paciente nuevo
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
			const insertPacienteValues = [paciente.documento, paciente.nombre, paciente.apellido, parseInt(paciente.edad),parseFloat( paciente.peso).toFixed(2), parseFloat(paciente.estatura).toFixed(2)]
			const { rows } = await postgres.executeQuery('INSERT INTO paciente(documento,nombre,apellido,edad,peso,estatura) VALUES($1,$2,$3,$4,$5,$6) RETURNING id', insertPacienteValues)
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

//obtener diagnosticos de un usuario
//recibe documento del usario
router.get('/obtenerDiagnosticos', function (request, response) {
	response = setHeaders(response);
	console.log("query",request.query);
	var params = [request.query.documento];
	var sql = "select * from diagnostico where paciente = (select id from paciente where documento like $1)";
	postgres.executeQuery(sql,params)
	.then(res => {
		console.log(res.rows);
		response.status(200).send(res.rows).end();
	})
	.catch(error => {
		console.log(error);
		response.status(500).send({ error : "error leyendo diagnosticos"}).end();
	})
});

//obtener diagnosticos de un usuario
//recibe documento del usario
router.get('/obtenerDiagnosticosWeb', function (request, response) {
	response = setHeaders(response);
	console.log("query",request.query);
	var params = [request.query.documento];
	var sql = "select * from diagnostico where paciente = (select id from paciente where documento like $1)";
	postgres.executeQuery(sql,params)
	.then(res => {
		var dataDiagnosticos = [];
		console.log(res.rows);
		for(var i = 0; i<res.rows.length;i++){
			var diagnosticos = res.rows[i].diagnostico.split(',');
			var diagnostico = {
				  "resourceType": "Observation",
				  "id": "heart-rate",
				  "text": {
				    "status": "generated",
				    "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\"><p><b>Generated Narrative with Details</b></p><p><b>id</b>: heart-rate</p><p><b>status</b>: final</p><p><b>category</b>: Vital Signs <span>(Details : {http://hl7.org/fhir/observation-category code 'vital-signs' = 'Vital Signs', given as 'Vital Signs'})</span></p><p><b>code</b>: Heart rate <span>(Details : {LOINC code '8867-4' = 'Heart rate', given as 'Heart rate'})</span></p><p><b>subject</b>: <a>Patient/example</a></p><p><b>effective</b>: 02/07/1999</p><p><b>value</b>: 44 beats/minute<span> (Details: UCUM code /min = '/min')</span></p></div>"
				  },
				  "status": "final",
				  "category": [
				    {
				      "coding": [
				        {
				          "system": "http://hl7.org/fhir/observation-category",
				          "code": "vital-signs",
				          "display": "Vital Signs"
				        }
				      ],
				      "text": "Vital Signs"
				    }
				  ],
				  "code": {
				    "coding": [
				      {
				        "system": "http://loinc.org",
				        "code": "8867-4",
				        "display": "Heart rate"
				      }
				    ],
				    "text": "Heart rate"
				  },
				  "subject": {
				    "reference": "Patient/heart-rate-diagnostic"
				  },
				  "effectiveDateTime": res.rows[i].fecha,
				};
			diagnostico.primerDiagnostico = diagnosticos[0].split(":")[1];
			diagnostico.segundoDiagnostico = diagnosticos[1].split(":")[1];
			diagnostico.tercerDiagnostico = diagnosticos[2].split(":")[1];
			dataDiagnosticos.push(diagnostico);
		}
		//response.status(200).send(res.rows).end();
		response.status(200).send(dataDiagnosticos).end();
	})
	.catch(error => {
		console.log(error);
		response.status(500).send({ error : "error leyendo diagnosticos"}).end();
	})
});

//registrar diagnostico a un usuario
//recibe documento del usuario
router.post('/registrarDiagnostico', function (request, response) {
	response = setHeaders(response);
	console.log("registrar diagnostico");
	//console.log("body", request.body);
	//var diagnostico = JSON.parse(JSON.stringify(request.body));
	console.log("query",request.body);
	var diagnostico = JSON.parse(JSON.stringify(request.body));
	console.log("medicion",diagnostico);
	(async () => {		
		try {
			await postgres.executeQuery('BEGIN')
			console.log("transaction begin");
			const insertDiagnosticoValues = [diagnostico.documento,new Date(diagnostico.fecha),diagnostico.diagnostico]
			await postgres.executeQuery('insert into diagnostico(paciente,fecha,diagnostico) values ((select id from paciente where documento like $1),$2,$3)', insertDiagnosticoValues)
			console.log("insert diagnostico");
			await postgres.executeQuery('COMMIT')
			console.log("commit");
			response.status(200).send({resultado: "diagnostico insertado exitosamente"}).end();
		} catch (error) {
			//await client.query('ROLLBACK')
			console.log(error);
			response.status(500).send({ error : "error insertando diagnostico"}).end();
		} finally {

		}
	})().catch(error => {
		console.log(error);
		response.status(500).send({ error : "error insertando diagnostico"}).end();
	})	
});


//registrar diagnostico a un usuario
//recibe documento del usuario
router.get('/hacerDiagnostico', function (request, response) {
	response = setHeaders(response);
	console.log("hacer diagnostico");
	//console.log("body", request.body);
	//var diagnostico = JSON.parse(JSON.stringify(request.body));
	console.log("query",request.body);
	var documento = JSON.parse(JSON.stringify(request.body));
	console.log("documento",documento);
	(async () => {		
		try {
			console.log("Consultando datos");
			var {rows} = await postgres.executeQuery('select min(valor) from datos',[]);
			const min = rows[0].min;
			console.log("menor",min);
			var {rows} = await postgres.executeQuery('select max(valor) from datos',[]);
			const max = rows[0].max;
			console.log("mayor",max);
			var {rows} = await postgres.executeQuery('select count(*) from datos',[]);
			const total = rows[0].count;
			console.log("total",total);
			var rangoInicial = 0;
			var rangoFinal = 0;
			if (min % 5 < 3){
				rangoInicial = min - (min % 5);
			} else {
				rangoInicial = min - (min % 5) + 5;
			}
			if (max % 5 < 3){
				rangoFinal = max - (max % 5);
			} else {
				rangoFinal = max - (max % 5) + 5;
			}
			console.log("rangoInicial", rangoInicial);
			console.log("rangoFinal",rangoFinal)
			var cantidadRango5 = [];
			for(var i = rangoInicial; i <= rangoFinal ; i=i+5){
				console.log("consultando de "+(i-2)+" a "+(i+2));
				var {rows} = await postgres.executeQuery('select count(*) from datos where valor between $1 and $2',[(i-2),(i+2)]);
				cantidadRango5.push({
					"rango": i,
					"cantidad": rows[0].count,
					"probabilidad": parseFloat(rows[0].count/total)
				});
			}
			console.log("cantidadRango5", cantidadRango5);

			//pulsaciones
			/*console.log("Consultando pulsacions");
			const minPulsaciones = min*60;
			console.log("menor",minPulsaciones);
			const maxPulsaciones = max*60;
			console.log("mayor",maxPulsaciones);
			console.log("total",total);
			var rangoInicialPulsaciones = 0;
			var rangoFinalPulsaciones = 0;
			if (minPulsaciones % 250 < 126){
				rangoInicialPulsaciones = minPulsaciones - (minPulsaciones % 250);
			} else {
				rangoInicialPulsaciones = minPulsaciones - (minPulsaciones % 250) + 250;
			}
			if (maxPulsaciones % 250 < 126){
				rangoFinalPulsaciones = maxPulsaciones - (maxPulsaciones % 250);
			} else {
				rangoFinalPulsaciones = maxPulsaciones - (maxPulsaciones % 250) + 250;
			}
			console.log("rangoInicialPulsaciones", rangoInicialPulsaciones);
			console.log("rangoFinalPulsaciones",rangoFinalPulsaciones)
			var cantidadPulsaciones = [];
			for(var i = rangoInicialPulsaciones; i <= rangoFinalPulsaciones ; i=i+250){
				console.log("consultando pulsaciones de "+(i-124)+" a "+(i+125));
				var {rows} = await postgres.executeQuery('select count(*) from datos where valor*60 between $1 and $2',[(i-124),(i+125)]);
				cantidadPulsaciones.push({
					"rango": i,
					"cantidad": rows[0].count,
					"probabilidad": parseFloat(rows[0].count/total)
				});
			}
			console.log("cantidadPulsaciones", cantidadPulsaciones);

			response.status(200).send(cantidadPulsaciones).end();
			*/
			var dia = 4;
			var hora = 17;
			var minPulsacion = 10000000;
			var maxPulsacion = 0;
			var pulsaciones=[];
			while(dia != 5 || hora != 18){
				var fechaInicial = new Date('2018-06-'+dia+' '+hora+':00:00');
				var fechaFinal = new Date('2018-06-'+dia+' '+hora+':59:59');
				console.log("consultado pulsaciones de "+fechaInicial.toString()+" a "+fechaFinal.toString());
				var {rows} = await postgres.executeQuery('select avg(valor)*60 as promedio_hora from datos where fecha between $1 and $2',[fechaInicial,fechaFinal]);
				console.log(rows);
				if(rows[0].promedio_hora != null){
					minPulsacion = (rows[0].promedio_hora<minPulsacion)?rows[0].promedio_hora:minPulsacion;
					maxPulsacion = (rows[0].promedio_hora>maxPulsacion)?rows[0].promedio_hora:maxPulsacion;
					pulsaciones.push({
					hora: fechaInicial,
					cantidad: parseFloat(rows[0].promedio_hora)
				})
				}
				if(hora+1 == 24){
					hora = 0;
					dia= dia + 1;
				}else{
					hora = hora + 1;
				}
				console.log("dia ",dia, " hora ", hora);
			}
			console.log(pulsaciones);
			console.log("maxPulsacion", maxPulsacion);
			console.log("minPulsacion",minPulsacion);
			var rangoInicialPulsacion = 0;
			var rangoFinalPulsacion = 0;
			if (minPulsacion % 250 < 126){
				rangoInicialPulsacion = minPulsacion - (minPulsacion % 250);
			} else {
				rangoInicialPulsacion = minPulsacion - (minPulsacion % 250) + 250;
			}
			if (maxPulsacion % 250 < 126){
				rangoFinalPulsacion = maxPulsacion - (maxPulsacion % 250);
			} else {
				rangoFinalPulsacion = maxPulsacion - (maxPulsacion % 250) + 250;
			}
			console.log("rangoInicialPulsacion", rangoInicialPulsacion);
			console.log("rangoFinalPulsacion",rangoFinalPulsacion)
			var cantidadPulsaciones = [];
			for(var i = rangoInicialPulsacion; i <= rangoFinalPulsacion ; i=i+250){
				console.log("consultando pulsaciones de "+(i-124)+" a "+(i+125));
				var num = 0;
				for(var j=0;j<pulsaciones.length;j++){
					if(i-124<=pulsaciones[j].cantidad && pulsaciones[j].cantidad<i+125 ){
						console.log(pulsaciones[j].cantidad);
						num += 1;
					}
				}
				cantidadPulsaciones.push({
					"rango": i,
					"cantidad": num,
					"probabilidad": parseFloat(num/pulsaciones.length)
				});
			}

			var string1Punto = "";
			var string2Punto = "";
			var string3Punto = "No concluyente";

			//Primera validacion
			if(cantidadRango5.length >17){
				string1Punto = "Caracteristico de normalidad"
			} else if(cantidadRango5.length < 14){
				string1Punto = "Caracteristico de Enfermedad"
			} else {
				string1Punto = "no concluyente"
			}

			console.log("cantidadRango5", cantidadRango5);
			console.log("cantidadPulsaciones",cantidadPulsaciones);

			//Segunda validacion
			var compataratorProbabilidad = function(a,b){
				return b.probabilidad - a.probabilidad; 
			}
			cantidadRango5.sort(compataratorProbabilidad);
			cantidadPulsaciones.sort(compataratorProbabilidad);

			var cantidadRango5Mayor1 = cantidadRango5[0].rango;
			var cantidadRango5Mayor2 = cantidadRango5[1].rango;
			console.log("Cantidad rango 5 Mayor 1", cantidadRango5Mayor1)
			console.log("Cantidad rango 5 Mayor 2", cantidadRango5Mayor2)

			var criterioa = false;
			var criteriob = false;
			if(cantidadRango5Mayor1-cantidadRango5Mayor2>=15){
				var criterioa = true;
			}

			if(cantidadPulsaciones[0].probabilidad<0.217 || cantidadPulsaciones[0].probabilidad>0.304){
				var criteriob = true;
			}

			var numeroLatidosEnRango = false;
			for (var i = 0; i<pulsaciones.length; i++){
				if(3000>pulsaciones[i].cantidad && pulsaciones[i].cantidad>6250){
					numeroLatidosEnRango = true;
				}
			}

			if(criterioa || (criterioa && criteriob)){
				string2Punto = "Enfermedad criterio 1";
			} 
			if(!criterioa && criteriob && numeroLatidosEnRango){
				string2Punto += "Enfermedad criterio 2"
			}
			if(!criterioa && criteriob){
				string2Punto += "Enfermedad en evolución criterio 3"
			} 
			if(!criterioa && !criteriob){
				string2Punto = "Sano"
			}

			//tercera validacion
			var holtersEnfermos = false;
			var sumaMayoresProbabilidades = cantidadRango5Mayor1 + cantidadRango5Mayor2;
			if(sumaMayoresProbabilidades > 0.319){
				holtersEnfermos = true;
			}

			if(criterioa && criteriob && holtersEnfermos){
				string3Punto = "Enfermedad por primer criterio"
			}
			if(criteriob && holtersEnfermos){
				string3Punto = "Enfermedad por Segundo criterio"
			}
			if(criteriob && holtersEnfermos && numeroLatidosEnRango){
				string3Punto = "Enfermedad por tercer criterio"
			}
			if(holtersEnfermos && !criterioa && !criteriob){
				string3Punto = "Sano"
			}

			console.log("1 conclusión",string1Punto);
			console.log("2 conclusión",string2Punto);
			console.log("3 conclusión",string3Punto);

			var responseAnalisis = {
				"Primer analisis":string1Punto,
				"Segundo analisis":string2Punto,
				"Tercer analisis":string3Punto,
				"Diagnostico":(string1Punto.includes("Enfermedad") || string2Punto.includes("Enfermedad") || string3Punto.includes("Enfermedad"))?"Consulte a su medico":"Paciente sano",
			}

			response.status(200).send(responseAnalisis).end();


			//response.status(200).send({resultado: "diagnostico insertado exitosamente"}).end();
		} catch (error) {
			console.log(error);
			response.status(500).send({ error : "error haciendo diagnostico"}).end();
		} finally {

		}
	})().catch(error => {
		console.log(error);
		response.status(500).send({ error : "error haciendo diagnostico"}).end();
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