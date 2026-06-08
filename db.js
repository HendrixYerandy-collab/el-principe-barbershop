require('dotenv').config();
const sql = require('mssql');

const config = {
  server:   'localhost',
  database: 'El Principe Barbershop',
  user:     'sa',
  password: 'Admin1234!',
  port:     1433,
  options: {
    encrypt:                false,
    trustServerCertificate: true,
    enableArithAbort:       true,
  }
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('✅ Conectado a SQL Server — El Príncipe Barbershop');
    return pool;
  })
  .catch(err => {
    console.error('❌ Error de conexión a SQL Server:', err.message);
    process.exit(1);
  });

module.exports = { sql, poolPromise };