import pkg from "pg";
const { Pool } = pkg;

export const pool = new Pool({
    user: "YOUR_USER",
    host: "YOUR_AWS_HOST",
    database: "YOUR_DB",
    password: "YOUR_PASSWORD",
    port: 5432,
});
