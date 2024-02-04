import mongoose from 'mongoose';

const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_ACCESS);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.log('Failed to connect to MongoDB: ', error);
  }
};

export default connectToDatabase;
