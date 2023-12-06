import fs from 'fs';
import path from 'path';
import mm from 'music-metadata';
import winston from 'winston';

// Créez un répertoire pour stocker les logs s'il n'existe pas déjà
const logsDirectory = './logs';
if (!fs.existsSync(logsDirectory)) {
  fs.mkdirSync(logsDirectory);
}

// Configuration de winston pour enregistrer les logs dans un fichier
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({
      filename: `${logsDirectory}/error.log`,
      level: 'error',
    }),
    new winston.transports.File({filename: `${logsDirectory}/combined.log`}),
  ],
});

// Répertoire contenant vos fichiers musicaux
const rootDirectory =
  'data/1001/0001. Frank Sinatra - In The Wee Small Hours (1955)/1/';

// Fonction récursive pour parcourir tous les fichiers audio
const extractMusicMetadataRecursive = async directoryPath => {
  try {
    const files = fs.readdirSync(directoryPath);
    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        await extractMusicMetadataRecursive(filePath); // Utilisez await pour la récursion
      } else if (file.endsWith('.mp3') || file.endsWith('.m4a')) {
        const metadata = await mm.parseFile(filePath);
        logger.info(`Fichier : ${file}`);
        logger.info('Métadonnées extraites:');
        logger.info(metadata);
        logger.info('---------------------------------------');
      }
    }
  } catch (error) {
    logger.error("Erreur lors de l'extraction des métadonnées:", error);
  }
};

// Appel de la fonction pour extraire toutes les métadonnées de manière récursive
extractMusicMetadataRecursive(rootDirectory);
