const { Pool } = require('pg')

const pool = new Pool({
  user: 'deming',
  host: 'localhost',
  database: 'dev2102',
  password: 'password',
  port: 5432,
});

module.exports = {
  query: (text, params, callback) => {
    return pool.query(text, params, callback)
  }
}