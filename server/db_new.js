import mysql from "mysql2/promise";
import { config } from "dotenv";
import { fileURLToPath } from 'url';
import path from 'path';
import { promises as fs } from 'fs';

// Enhanced environment loading
config({
  path: path.join(path.dirname(fileURLToPath(import.meta.url)), '../.env')
});

/**
 * Parses database URL into connection config
 * @param {string} url - Database URL in format mysql://user:password@host:port/database
 * @returns {object} Connection config object
 */
const parseDbUrl = (url) => {
  if (!url) throw new Error("DATABASE_URL is required");
  
  try {
    const pattern = /^mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/;
    const matches = url.match(pattern);

    if (!matches) throw new Error("Invalid database URL format");
    
    const [, user, password, host, port, database] = matches;
    return {
      host,
      user,
      password,
      database,
      port: parseInt(port, 10),
      namedPlaceholders: true // Enable named parameters
    };
  } catch (error) {
    throw new Error(`Failed to parse DATABASE_URL: ${error.message}`);
  }
};

// Database configuration with sensible defaults
const dbConfig = {
  ...parseDbUrl(process.env.DATABASE_URL),
  waitForConnections: true,
  connectionLimit: process.env.DB_POOL_SIZE || 10,
  queueLimit: 1000,
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
    ...(process.env.DB_SSL_CA && { ca: await fs.readFile(process.env.DB_SSL_CA) }),
    ...(process.env.DB_SSL_CERT && { cert: await fs.readFile(process.env.DB_SSL_CERT) }),
    ...(process.env.DB_SSL_KEY && { key: await fs.readFile(process.env.DB_SSL_KEY) })
  } : false,
  timezone: 'Z', // Use UTC
  charset: 'utf8mb4',
  connectTimeout: 10000,
  multipleStatements: false // Security best practice
};

const pool = mysql.createPool(dbConfig);

// Add health monitoring listeners
pool.on('connection', (connection) => {
  connection.socket.setKeepAlive(true, 30000); // 30s keepalive interval
  connection.socket.setTimeout(60000); // 1min timeout
  
  console.log('New connection established:', connection.threadId);
});

pool.on('acquire', (connection) => {
  console.log('Connection acquired:', connection.threadId);
});

pool.on('release', (connection) => {
  console.log('Connection released:', connection.threadId);
});

pool.on('enqueue', () => {
  console.log('Waiting for available connection slot...');
});

/**
 * Checks database connection health
 * @returns {Promise<boolean>} True if connection is healthy
 */
const checkConnection = async () => {
  try {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query('SELECT 1');
      return rows.length === 1;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
};

/**
 * Executes a database query with retries
 * @param {string} sql - SQL query
 * @param {object} [params] - Query parameters
 * @param {number} [retries=3] - Max retry attempts
 * @param {number} [baseDelay=1000] - Base retry delay in ms
 * @returns {Promise<*>} Query results
 */
const query = async (sql, params, retries = 3, baseDelay = 1000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const [results] = await pool.query(sql, params);
      return results;
    } catch (error) {
      if (attempt === retries) {
        error.message = `Failed after ${retries} attempts: ${error.message}`;
        throw error;
      }

      if (isConnectionError(error)) {
        console.warn(`Connection error (attempt ${attempt}/${retries}), retrying...`);
        await new Promise(resolve => setTimeout(resolve, baseDelay * Math.pow(2, attempt - 1)));
      } else {
        // Non-retryable error
        throw error;
      }
    }
  }
};

// Detect connection-related errors
const isConnectionError = (error) => {
  return [
    'PROTOCOL_CONNECTION_LOST',
    'ER_CON_COUNT_ERROR',
    'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR',
    'PROTOCOL_ENQUEUE_HANDSHAKE',
    'ETIMEDOUT'
  ].includes(error.code);
};

/**
 * Initializes database schema
 * @returns {Promise<void>}
 */
const initDb = async () => {
  const queries = [
    // `CREATE TABLE IF NOT EXISTS inventory (
    //   id INT AUTO_INCREMENT PRIMARY KEY,
    //   name VARCHAR(255) NOT NULL,
    //   description TEXT,
    //   price DECIMAL(10,2) NOT NULL,
    //   stock INT NOT NULL DEFAULT 0,
    //   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    //   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    //   INDEX idx_name (name),
    //   INDEX idx_stock (stock)
    // ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    
    // `CREATE TABLE IF NOT EXISTS inbound (
    //   id INT AUTO_INCREMENT PRIMARY KEY,
    //   product_id INT NOT NULL,
    //   quantity INT NOT NULL,
    //   received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    //   notes TEXT,
    //   FOREIGN KEY (product_id) REFERENCES inventory(id) ON DELETE CASCADE,
    //   INDEX idx_product_id (product_id),
    //   INDEX idx_received_at (received_at)
    // )`,
    
    // `CREATE TABLE IF NOT EXISTS outbound (
    //   id INT AUTO_INCREMENT PRIMARY KEY,
    //   product_id INT NOT NULL,
    //   quantity INT NOT NULL,
    //   shipped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    //   destination VARCHAR(255),
    //   FOREIGN KEY (product_id) REFERENCES inventory(id) ON DELETE CASCADE,
    //   INDEX idx_product_id (product_id),
    //   INDEX idx_shipped_at (shipped_at)
    // )`
  ];

  try {
    for (const sql of queries) {
      await pool.query(sql);
    }
    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

// Graceful shutdown handler
const shutdown = async () => {
  try {
    console.log('Closing database pool...');
    await pool.end();
    console.log('Database pool closed');
    process.exit(0);
  } catch (error) {
    console.error('Failed to close pool gracefully:', error);
    process.exit(1);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export default {
  pool,
  query,
  checkConnection,
  initDb,
  shutdown
};
