import mongoose from 'mongoose';

const connectToDatabase = async () => {
  const connectionParams = {
    useNewUrlParser: true, // Utilise un nouvel analyseur d'URL MongoDB
    useUnifiedTopology: true, // Utilise la nouvelle logique de surveillance du serveur
  };

  try {
    await mongoose.connect(process.env.DB, connectionParams);
    console.log("t'es connect à MongoDB zig");
  } catch (error) {
    console.log('sale zig, ça marche pas', error);
  }
};

export default connectToDatabase;
