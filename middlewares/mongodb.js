import mongoose from 'mongoose';

const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_ACCESS);
    console.log("t'es connect à MongoDB zig");
  } catch (error) {
    console.log('sale zig, ça marche pas', error);
  }
};

export default connectToDatabase;
