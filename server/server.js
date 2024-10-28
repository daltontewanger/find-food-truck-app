// Module-alias used to removed deprecation warnings for punycode
const moduleAlias = require('module-alias');
moduleAlias.addAlias('punycode', 'punycode/');

const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const dotenv = require('dotenv');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const foodTruckRoutes = require('./routes/foodTruckRoutes');
const { initSocket } = require('./utils/socket');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN,
    methods: ['GET', 'POST'],
  },
});
initSocket(io);

// Middleware
app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/foodtruck', foodTruckRoutes);

// Mongoose Connection Setup with Stable API version options
const clientOptions = {
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true,
  },
};

async function connectToDatabase() {
  try {
    // Create a Mongoose connection using the recommended Stable API version
    await mongoose.connect(process.env.MONGO_URI, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // Start the server after a successful database connection
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1); // Exit the process if the database connection fails
  }
}

connectToDatabase();

// Ensure the client will close when the process is terminated
process.on('SIGINT', async () => {
  await mongoose.disconnect();
  console.log('MongoDB connection closed');
  process.exit(0);
});