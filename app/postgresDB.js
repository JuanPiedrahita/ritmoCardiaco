const dotenv = require('dotenv')
dotenv.config()
const pg = require('pg');

const connectionString = `postgres://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const client = new pg.Client(connectionString);

var connect = function(){
    return client.connect();
}

var executeQuery = function(query,params){
    if(params !== undefined){
        return client.query(query,params)
    }
    return client.query(query);
}

var end = function(){
    return client.end();
}

exports.connect = connect;
exports.end = end;
exports.executeQuery = executeQuery;
