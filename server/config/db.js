const mysql = require("mysql2/promise");
require("dotenv").config();

/**
 * Jewelora Cloud-Ready MySQL Connection Pool
 * Supports local MySQL (XAMPP / native) and Cloud MySQL (Aiven, TiDB Cloud, Railway, PlanetScale).
 */
let poolConfig;

if (process.env.DATABASE_URL) {
  poolConfig = {
    uri: process.env.DATABASE_URL,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: process.env.DB_SSL === "true" || process.env.DATABASE_URL.includes("ssl")
      ? { rejectUnauthorized: false }
      : undefined
  };
} else {
  poolConfig = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "jewelora_db",
    port: Number(process.env.DB_PORT || 3306),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined
  };
}

const pool = mysql.createPool(poolConfig);

module.exports = pool;
