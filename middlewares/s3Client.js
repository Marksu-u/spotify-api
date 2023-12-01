import dotenv from 'dotenv';
import AWS from 'aws-sdk';

dotenv.config();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3Client = new AWS.S3();

export default s3Client;
