const dbConfig = require('./config.json').postgres; 
const pg = require('pg');

const connectionString = `postgres://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.db}`;

const client = new pg.Client(connectionString);

var connect = function(){
    return client.connect();
}

var end = function(){
    return client.end();
}

exports.connect = connect;
exports.end = end;
