import mongoose from 'mongoose';

// MongoDB connection configuration
// Default to local MongoDB for development
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/posthumous-notification-system';

let isConnected = false;

export const connectMongoDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// Graceful disconnection
export const disconnectMongoDB = async () => {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('MongoDB disconnected');
  }
};

export default mongoose;