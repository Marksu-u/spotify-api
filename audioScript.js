import dotenv from 'dotenv';
import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Configurer le SDK AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();
const bucketName = process.env.AWS_BUCKET_NAME;
const directoryPath = 'data/1001';

const uploadFileToS3 = filePath => {
  const fileContent = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);

  const params = {
    Bucket: bucketName,
    Key: `path/in/bucket/${fileName}`,
    Body: fileContent,
    ContentType: 'audio/m4a',
  };

  s3.upload(params, function (err, data) {
    if (err) {
      throw err;
    }
    console.log(`Fichier téléchargé avec succès. URL S3 : ${data.Location}`);
  });
};

// Lire et envoyer les fichiers .m4a
fs.readdir(directoryPath, (err, files) => {
  if (err) {
    throw err;
  }

  files
    .filter(file => file.endsWith('.m4a'))
    .forEach(file => {
      uploadFileToS3(path.join(directoryPath, file));
    });
});
