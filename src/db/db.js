const mongoose = require('mongoose');
 

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_HOST);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

const getDB = () => {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('MongoDB connection not established');
  }
  return mongoose.connection.db;
};

module.exports = { connectDB, getDB };
