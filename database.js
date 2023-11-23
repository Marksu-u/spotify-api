const mongoose = require("mongoose");

// Exporte une fonction asynchrone qui établit la connexion à la base de données MongoDB
module.exports = async () => {
    // Options de connexion à la base de données
    const connectionParams = {
        useNewUrlParser: true, // Utilise un nouvel analyseur d'URL MongoDB
        useUnifiedTopology: true // Utilise la nouvelle logique de surveillance du serveur
    };

    try {
        await mongoose.connect(process.env.DB, connectionParams);
        console.log("connecté à MongoDB !");
    } catch (error) {
        console.log("sale zig, ça marche pas", error); 
    }
};
