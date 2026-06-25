const Pool = require("pg").Pool;
const p1 = new Pool({
    user:     process.env.DB_USER     || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME     || "coop_babmansour",
    host:     process.env.DB_HOST     || "localhost",
    port:     parseInt(process.env.DB_PORT || "5432"),
});
module.exports = p1;
