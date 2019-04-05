const { Pool } = require('pg');

const pool = new Pool({
    user: 'deming',
    host: 'localhost',
    database: 'dev2102',
    password: 'password',
    port: 5432
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    client: async () => {
        return new Promise((resolve, reject) => {
            pool.connect(function(err, client, done) {
                if (err) return reject(new Error(err));
                resolve({
                    client: client,
                    done: done
                });
            });
        });
    }
};
