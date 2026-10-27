const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: process.env.DB_USER,"root",
    password: "process.env.DB_PASSWORD",
    database: process.env.DB_NAME||"mini_crm"
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err.message);
        return;
    }

    console.log("MySQL database connected successfully!");
});

module.exports = db;