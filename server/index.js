import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import db from './db.js';
import queryRoutes from './routes/query.js';
import os from 'os';

// Load environment variables from .env file
config();

const app = express();
const PORT_LOCALHOST = 3001;
const PORT_LAN = 3002;

app.use(express.json());

// Function to get the first non-internal IPv4 address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost'; // fallback
}

const localIP = getLocalIP();
const frontendPort = 5173; // Your Vite port

// Enable CORS with dynamic origin
app.use(cors({
  origin: [
    `http://${localIP}:${frontendPort}`,   // Local network access
    'http://localhost:5173'                // Localhost access
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization']
}));



app.listen(PORT_LOCALHOST, '0.0.0.0', () => {
  console.log(`Server running on:
  - http://localhost:${PORT_LOCALHOST} (localhost)`);
});

app.listen(PORT_LAN, '0.0.0.0', () => {
  console.log(`Server running on:
  - http://${localIP}:${PORT_LAN} (localarea)`);
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Check database connection
    const connection = await db.checkConnection();
    res.json({ connected: true, message: 'Database connection successful' });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ connected: false, error: error.message });
  }
});

// Your routes
app.get('/api/stats', (req, res) => {
  res.json({ 
    status: 'OK',
    message: `Backend is accessible from ${localIP}:${PORT_LAN}`
  });
});

// Routes Query
app.use('/api/query', queryRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Server error',
    message: err.message
  });
});



// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});