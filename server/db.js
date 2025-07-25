import mysql from "mysql2/promise";
import { config } from "dotenv";

// Load environment variables
config();

// Parse database URL
const parseDbUrl = (url) => {
  const pattern = /^mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/;
  const matches = url.match(pattern);

  if (!matches) {
    throw new Error("Invalid database URL format");
  }

  const [, user, password, host, port, database] = matches;
  return {
    host,
    user,
    password,
    database,
    port: parseInt(port, 10),
  };
};

// Get database config from URL
const dbConfig = {
  ...parseDbUrl(process.env.DATABASE_URL),
  waitForConnections: true,
  connectionLimit: 100, // Adjusted for better performance
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  ssl: {
    rejectUnauthorized: true, // Set to false if you want to ignore self-signed certificates
  },
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Check database connection
const checkConnection = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.ping(); // Check if the connection is alive
    connection.release();
    console.log("Database connection successful");
    return true;
  } catch (error) {
    console.error("Database connection error:", error);
    return false;
  }
};

// Initialize database tables
const initDb = async () => {
  try {
    // Uncomment and modify the following queries as needed
    //await pool.query(`...`);
    await pool.query('SELECT VERSION() as version');
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
};

// Run database initialization
initDb().catch(console.error);

// Helper for running queries with retry mechanism
const query = async (sql, params, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    let connection;
    try {
      connection = await pool.getConnection();
      const [results] = await connection.query(sql, params);
      return results;
    } catch (error) {
      if (attempt === retries) {
        console.error("Database query error:", error);
        throw error;
      }
      // Wait before retrying (exponential backoff)
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempt) * 500)
      );
    } finally {
      if (connection) {
        connection.release(); // Ensure the connection is released
      }
    }
  }
};

export default {
  query,
  checkConnection,
  pool,
};
