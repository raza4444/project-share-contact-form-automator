const util = require( 'util' );
const mysql = require( 'mysql' );
const dotenv = require('dotenv');
const result = dotenv.config({path: `${__dirname}/../../.env`});

if (result.error) {
  throw result.error
}
class Database {
    
    connection;
    
    constructor( config ) {
        this.connection = this.mysqlConnection();
    }
    query( sql, args ) {
        return util.promisify( this.connection.query )
        .call( this.connection, sql, args );
    }
    close() {
        return;
    }

     mysqlConnection() {
        const connection =  mysql.createConnection({
            host: process.env.DB_HOSTNAME,
            user: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE
          });
          connection.connect((err) => {
            if (err) throw err;
          });
          return connection;
    }
}

module.exports = database = new Database();