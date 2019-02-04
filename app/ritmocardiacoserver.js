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

//get measurementes de un user
//recibe document del usario
router.get('/getMeasurements', function (request, response) {
	response = setHeaders(response);
	console.log("query",request.query);
	var params = [request.query.document];
	var sql = "select * from heart_rate_measurement where patient = (select id from patient where document like $1)";
	postgres.executeQuery(sql,params)
	.then(res => {
		console.log(res.rows);
		response.status(200).send(res.rows).end();
	})		
	.catch(error => {
		console.log(error);
		response.status(500).send({ error : "error loading measurements"}).end();
	})
});

//agregar measurementes de un user
//recibe document del user
router.post('/postMeasurement', function (request, response) {
	response = setHeaders(response);
	console.log("post measurement");
	//console.log("body", request.body);
	//var measurement = JSON.parse(JSON.stringify(request.body));
	console.log("query",request.body);
	var measurement = JSON.parse(JSON.stringify(request.body));
	console.log("measurement",measurement);
	(async () => {		
		try {
			await postgres.executeQuery('BEGIN')
			console.log("transaction begin");
			const insertmeasurementValues = [measurement.document,parseInt(measurement.value),parseInt(measurement.time),new Date(measurement.date)]
			await postgres.executeQuery('insert into heart_rate_measurement(patient,value,time,date) values ((select id from patient where document like $1),$2,$3,$4)', insertmeasurementValues)
			console.log("insert measurement");
			await postgres.executeQuery('COMMIT')
			console.log("commit");
			response.status(200).send({result: "measurement successfully inserted"}).end();
		} catch (error) {
			await postgres.executeQuery('ROLLBACK')
			console.log(error);
			response.status(500).send({ error : "error inserting measurement"}).end();
		} finally {

		}
	})().catch(error => {
		console.log(error);
		response.status(500).send({ error : "error inserting measurement"}).end();
	})	
});

//get patients
router.get('/getPatients',function(request,response){
	response = setHeaders(response);
	console.log("query",request.query);
	var params = [];
	var sql = "";
	if(request.query.document != undefined){
		sql = "select * from patient p, contact c where p.id=c.patient and p.document like $1";
		params.push(request.query.document);
	} else {
		sql = "select * from patient p, contact c where p.id=c.patient";
	}
	postgres.executeQuery(sql,params)
	.then(res => {
		console.log(res.rows);
		response.status(200).send(res.rows).end();
	})
	.catch(error => {
		console.log(error);
		response.status(500).send({ error : "error reading patients"}).end();
	})
});

//post un patient nuevo
router.post('/postPatient',function(request,response){
	response = setHeaders(response);
	console.log("post patient");
	console.log("body", request.body);
	var patient = JSON.parse(JSON.stringify(request.body));
	//console.log("query",request.query);
	//var patient = JSON.parse(JSON.stringify(request.query));
	console.log("patient",patient);
	(async () => {		
		try {
			await postgres.executeQuery('BEGIN')
			console.log("transaction begin");
			const insertpatientValues = [patient.document, patient.firstname, patient.lastname, parseInt(patient.age),parseFloat( patient.weight).toFixed(2), parseFloat(patient.height).toFixed(2)]
			const { rows } = await postgres.executeQuery('INSERT INTO patient(document,firstname,lastname,age,weight,height) VALUES($1,$2,$3,$4,$5,$6) RETURNING id', insertpatientValues)
			console.log("insert patient");
       		const insertcontactVaules = [rows[0].id, patient.mail, patient.phone, patient.address]
			await postgres.executeQuery('INSERT INTO contact(patient,mail,phone,address) VALUES($1,$2,$3,$4)', insertcontactVaules)
			console.log("insert contact");
			await postgres.executeQuery('COMMIT')
			console.log("commit");
			response.status(200).send({result: "user successfully inserted"}).end();
		} catch (error) {
			await postgres.executeQuery('ROLLBACK')
			console.log(error);
			response.status(500).send({ error : "error inserting user"}).end();
		} finally {

		}
	})().catch(error => {
		console.log(error);
		response.status(500).send({ error : "error inserting user"}).end();
	})	
});

//get diagnosiss de un user
//recibe document del usario
router.get('/getDiagnosis', function (request, response) {
	response = setHeaders(response);
	console.log("query",request.query);
	var params = [request.query.document];
	var sql = "select * from diagnosis where patient = (select id from patient where document like $1)";
	postgres.executeQuery(sql,params)
	.then(res => {
		console.log(res.rows);
		response.status(200).send(res.rows).end();
	})
	.catch(error => {
		console.log(error);
		response.status(500).send({ error : "error reading diagnosis"}).end();
	})
});

//post diagnosis a un user
//recibe document del user
router.post('/postDiagnosis', function (request, response) {
	response = setHeaders(response);
	console.log("post diagnosis");
	//console.log("body", request.body);
	//var diagnosis = JSON.parse(JSON.stringify(request.body));
	console.log("query",request.body);
	var diagnosis = JSON.parse(JSON.stringify(request.body));
	console.log("diagnosis",diagnosis);
	(async () => {		
		try {
			await postgres.executeQuery('BEGIN')
			console.log("transaction begin");
			const insertDiagnosisValues = [diagnosis.document,new Date(diagnosis.date),diagnosis.diagnosis]
			await postgres.executeQuery('insert into diagnosis(patient,date,diagnosis) values ((select id from patient where document like $1),$2,$3)', insertDiagnosisValues)
			console.log("insert diagnosis");
			await postgres.executeQuery('COMMIT')
			console.log("commit");
			response.status(200).send({result: "diagnosis successfully inserted"}).end();
		} catch (error) {
			await postgres.executeQuery('ROLLBACK')
			console.log(error);
			response.status(500).send({ error : "error inserting diagnosis"}).end();
		} finally {

		}
	})().catch(error => {
		console.log(error);
		response.status(500).send({ error : "error inserting diagnosis"}).end();
	})	
});


//post diagnosis a un user
//recibe document del user
router.get('/makeDiagnosis', function (request, response) {
	response = setHeaders(response);
	console.log("make diagnosis");
	//console.log("body", request.body);
	//var diagnosis = JSON.parse(JSON.stringify(request.body));
	//console.log("query",request.body);
	//var document = JSON.parse(JSON.stringify(request.body));
	console.log("query",request.query);
	var document = request.query.document;
	console.log("document",document);
	(async () => {		
		try {
			console.log("Creating temporary table datos_diagnostico_usuario_"+document+" with user data");
			await postgres.executeQuery("DROP TABLE IF EXISTS datos_diagnostico_usuario_"+document,[]);
			const userTableParameters = [document,document];
			const queryTempTable = "CREATE TEMPORARY TABLE datos_diagnostico_usuario_"+ document + " "+
				"AS (" +
				"SELECT "  +
					"id," +
					"patient," +
					"value," +
					"date," +
					"time " +
				"FROM " +
					"heart_rate_measurement " +
				"WHERE " +
					"value != 0 " +
					"AND " +
					"patient = (SELECT id FROM patient WHERE document = $1) " +
					"AND " +
					"date >= (SELECT (MAX(DATE) - interval '21 hour') FROM heart_rate_measurement WHERE patient = (SELECT id FROM patient WHERE document = $2))" +	
				")";
			console.log(queryTempTable);
			await postgres.executeQuery(queryTempTable,userTableParameters)
			console.log("Temporary table created");
			console.log("Getting data");
			//var {rows} = await postgres.executeQuery('select min(value) from datos',[]);
			var {rows} = await postgres.executeQuery('select min(value) from datos_diagnostico_usuario_'+ document,[]);
			const min = rows[0].min;
			console.log("min",min);
			//var {rows} = await postgres.executeQuery('select max(value) from datos',[]);
			var {rows} = await postgres.executeQuery('select max(value) from datos_diagnostico_usuario_'+ document,[]);
			const max = rows[0].max;
			console.log("max",max);
			//var {rows} = await postgres.executeQuery('select count(*) from datos',[]);
			var {rows} = await postgres.executeQuery('select count(*) from datos_diagnostico_usuario_'+ document,[]);
			const total = rows[0].count;
			console.log("total",total);
			var initialRange = 0;
			var finalRange = 0;
			if (min % 5 < 3){
				initialRange = min - (min % 5);
			} else {
				initialRange = min - (min % 5) + 5;
			}
			if (max % 5 < 3){
				finalRange = max - (max % 5);
			} else {
				finalRange = max - (max % 5) + 5;
			}
			console.log("initialRange", initialRange);
			console.log("finalRange",finalRange)
			var range5 = [];
			for(var i = initialRange; i <= finalRange ; i=i+5){
				console.log("consulting from "+(i-2)+" a "+(i+2));
				//var {rows} = await postgres.executeQuery('select count(*) from datos where value between $1 and $2',[(i-2),(i+2)]);
				var {rows} = await postgres.executeQuery('select count(*) from datos_diagnostico_usuario_'+document+' where value between $1 and $2',[(i-2),(i+2)]);
				range5.push({
					"range": i,
					"quantity": rows[0].count,
					"probability": parseFloat(rows[0].count/total)
				});
			}
			console.log("range5", range5);

			//pulsaciones
			/*console.log("Consultando pulsacions");
			const minHeartRatees = min*60;
			console.log("min",minHeartRatees);
			const maxHeartRatees = max*60;
			console.log("max",maxHeartRatees);
			console.log("total",total);
			var initialRangePulsaciones = 0;
			var finalRangePulsaciones = 0;
			if (minHeartRatees % 250 < 126){
				initialRangePulsaciones = minHeartRatees - (minHeartRatees % 250);
			} else {
				initialRangePulsaciones = minHeartRatees - (minHeartRatees % 250) + 250;
			}
			if (maxHeartRatees % 250 < 126){
				finalRangePulsaciones = maxHeartRatees - (maxHeartRatees % 250);
			} else {
				finalRangePulsaciones = maxHeartRatees - (maxHeartRatees % 250) + 250;
			}
			console.log("initialRangePulsaciones", initialRangePulsaciones);
			console.log("finalRangePulsaciones",finalRangePulsaciones)
			var quantityPulsaciones = [];
			for(var i = initialRangePulsaciones; i <= finalRangePulsaciones ; i=i+250){
				console.log("consultando pulsaciones de "+(i-124)+" a "+(i+125));
				var {rows} = await postgres.executeQuery('select count(*) from datos where value*60 between $1 and $2',[(i-124),(i+125)]);
				quantityPulsaciones.push({
					"rango": i,
					"quantity": rows[0].count,
					"probabilidad": parseFloat(rows[0].count/total)
				});
			}
			console.log("quantityPulsaciones", quantityPulsaciones);

			response.status(200).send(quantityPulsaciones).end();
			*/
			//var dia = 4;
			//var hour = 17;
			//se fijan valores para las horas...
			var {rows} = await postgres.executeQuery('select min(date) as date from datos_diagnostico_usuario_'+document);
			var minDate = rows[0].date;
			var {rows} = await postgres.executeQuery('select max(date) as date from datos_diagnostico_usuario_'+document);
			var maxDate = rows[0].date;
			var temporalDate = new Date(minDate);
			console.log("Initial Date: ", minDate.toString());
			console.log("Final Date: ", maxDate.toString());
			console
			var minHeartRate = 10000000;
			var maxHeartRate = 0;
			var pulsaciones=[];
			while(temporalDate < maxDate){
				var temporalInitialDate = new Date(temporalDate);
				var temporalFinalDate = new Date(temporalDate);
				temporalFinalDate.setHours(temporalFinalDate.getHours() + 1);
				//var initialDate = new Date('2018-06-'+dia+' '+hour+':00:00');
				//var finalDate = new Date('2018-06-'+dia+' '+hour+':59:59');
				console.log("consultado pulsaciones de "+temporalInitialDate.toString()+" a "+temporalFinalDate.toString());
				//var {rows} = await postgres.executeQuery('select avg(value)*60 as promedio_hour from datos where date between $1 and $2',[initialDate,finalDate]);
				var {rows} = await postgres.executeQuery('select avg(value)*60 as promedio_hour from datos_diagnostico_usuario_'+document+' where date between $1 and $2',[temporalInitialDate,temporalFinalDate]);
				console.log(rows);
				if(rows[0].promedio_hour != null){
					minHeartRate = (rows[0].promedio_hour<minHeartRate)?rows[0].promedio_hour:minHeartRate;
					maxHeartRate = (rows[0].promedio_hour>maxHeartRate)?rows[0].promedio_hour:maxHeartRate;
					pulsaciones.push({
					hour: temporalInitialDate.toString(),
					quantity: parseFloat(rows[0].promedio_hour)
				})
				}
				/*if(hour+1 == 24){
					hour = 0;
					dia= dia + 1;
				}else{
					hour = hour + 1;
				}
				console.log("dia ",dia, " hour ", hour);
				*/
				temporalDate.setHours(temporalDate.getHours() + 1);
			}
			console.log(pulsaciones);
			console.log("maxHeartRate", maxHeartRate);
			console.log("minHeartRate",minHeartRate);
			var initialRangePulsacion = 0;
			var finalRangePulsacion = 0;
			if (minHeartRate % 250 < 126){
				initialRangePulsacion = minHeartRate - (minHeartRate % 250);
			} else {
				initialRangePulsacion = minHeartRate - (minHeartRate % 250) + 250;
			}
			if (maxHeartRate % 250 < 126){
				finalRangePulsacion = maxHeartRate - (maxHeartRate % 250);
			} else {
				finalRangePulsacion = maxHeartRate - (maxHeartRate % 250) + 250;
			}
			console.log("initialRangePulsacion", initialRangePulsacion);
			console.log("finalRangePulsacion",finalRangePulsacion)
			var quantityPulsaciones = [];
			for(var i = initialRangePulsacion; i <= finalRangePulsacion ; i=i+250){
				console.log("consultando pulsaciones de "+(i-124)+" a "+(i+125));
				var num = 0;
				for(var j=0;j<pulsaciones.length;j++){
					if(i-124<=pulsaciones[j].quantity && pulsaciones[j].quantity<i+125 ){
						console.log(pulsaciones[j].quantity);
						num += 1;
					}
				}
				quantityPulsaciones.push({
					"range": i,
					"quantity": num,
					"probability": parseFloat(num/pulsaciones.length)
				});
			}

			var string1Punto = "";
			var string2Punto = "";
			var string3Punto = "Inconclusive";

			//Primera validacion
			if(range5.length >17){
				string1Punto = "Characteristic of normality"
			} else if(range5.length < 14){
				string1Punto = "Characteristic of disease"
			} else {
				string1Punto = "Inconclusive"
			}

			console.log("range5", range5);
			console.log("quantityPulsaciones",quantityPulsaciones);

			//Segunda validacion
			var compataratorProbabilidad = function(a,b){
				return b.probability - a.probability; 
			}		
			range5.sort(compataratorProbabilidad);
			quantityPulsaciones.sort(compataratorProbabilidad);

			var range5max1 = range5[0];
			var range5max2 = range5[1];

			var criterioa = false;
			var criteriob = false;
			if(range5max1.range-range5max2.range>=15){
				var criterioa = true;
			}

			if(quantityPulsaciones[0].probability<0.217 || quantityPulsaciones[0].probability>0.304){
				var criteriob = true;
			}

			var numeroLatidosEnRango = false;
			for (var i = 0; i<pulsaciones.length; i++){
				if(3000>pulsaciones[i].quantity && pulsaciones[i].quantity>6250){
					numeroLatidosEnRango = true;
				}
			}

			if(criterioa || (criterioa && criteriob)){
				string2Punto = "Characteristic of disease by first test";
			} 
			if(!criterioa && criteriob && numeroLatidosEnRango){
				string2Punto += "Characteristic of disease by second test"
			}
			if(!criterioa && criteriob){
				string2Punto += "Characteristic of disease in evolution by third test"
			} 
			if(!criterioa && !criteriob){
				string2Punto = "Healthy"
			}

			//tercera validacion
			var holtersEnfermos = false;
			var sumamaxesProbabilidades = range5max1.probability + range5max2.probability;
			if(sumamaxesProbabilidades > 0.319){
				holtersEnfermos = true;
			}

			if(criterioa && criteriob && holtersEnfermos){
				string3Punto = "Characteristic of disease by first test"
			}
			if(criteriob && holtersEnfermos){
				string3Punto = "Characteristic of disease by second test"
			}
			if(criteriob && holtersEnfermos && numeroLatidosEnRango){
				string3Punto = "Characteristic of disease by third test"
			}
			if(holtersEnfermos && !criterioa && !criteriob){
				string3Punto = "Healthy"
			}

			console.log("1 conclusión",string1Punto);
			console.log("2 conclusión",string2Punto);
			console.log("3 conclusión",string3Punto);

			var responseAnalisis = {
				"First analysis":string1Punto,
				"Second analysis":string2Punto,
				"Third analysis":string3Punto,
				"Diagnosis":(string1Punto.includes("disease") || string2Punto.includes("disease") || string3Punto.includes("Disease"))?"Not healthy, please consult your doctor":"Healthy",
			}

			var diagnosis = {
				"document": document,
				"date": new Date(),
				"diagnosis": "First Analysis:"+string1Punto+", Second Analysis:"+string2Punto+", Third Analysis: "+string2Punto+", Diagnosis: "+responseAnalisis.Diagnosis
			}

			await postgres.executeQuery('BEGIN')
			console.log("transaction begin: Inserting diagnosis");
			const insertDiagnosisValues = [diagnosis.document,new Date(diagnosis.date),diagnosis.diagnosis]
			await postgres.executeQuery('insert into diagnosis(patient,date,diagnosis) values ((select id from patient where document like $1),$2,$3)', insertDiagnosisValues)
			console.log("diagnosis inserted");
			await postgres.executeQuery('COMMIT')
			console.log("transaction ended: commit");
			console.log("drop temporary table datos_diagnostico_usuario_"+document+" with user data");
			await postgres.executeQuery("DROP TABLE IF EXISTS datos_diagnostico_usuario_"+document,[]);
			console.log("table dropped");

			console.log("Sending response");
			response.status(200).send(responseAnalisis).end();


			//response.status(200).send({result: "diagnosis successfully inserted"}).end();
		} catch (error) {
			console.log(error);
			response.status(500).send({ error : "error making diagnosis"}).end();
		} finally {

		}
	})().catch(error => {
		console.log(error);
		response.status(500).send({ error : "error making diagnosis"}).end();
	})	
});

router.get('/', function (request, response) {
	response = setHeaders(response);
	response.status(200).send({ status : "ok", app : "Heart rate app"}).end();
});

app.use(router);

postgres.connect()
.then(()=>{
	console.log("Postgres connected");
	var server = app.listen(process.env.APP_PORT, function () {
		"use strict";
		
		var host = process.env.APP_HOST,
			port = server.address().port;
		
		console.log(' Server is listening at http://%s:%s', host, port);
	});
	  
})
.catch(()=>{
	console.log("ERROR: Couldn't connect, please verify the env file");
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