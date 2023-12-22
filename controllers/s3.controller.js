import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

const s3 = new AWS.S3();

export const getAWSaudio = async (req, res) => {
  const bucketName = process.env.AWS_BUCKET_NAME;
  const cloudfrontURL = process.env.AWS_CLOUDFRONT;

  try {
    const params = {Bucket: bucketName};
    const data = await s3.listObjectsV2(params).promise();

    const objects = data.Contents.map(obj => {
      return {
        ...obj,
        url: `https://${cloudfrontURL}/${encodeURIComponent(obj.Key)}`,
      };
    });

    res.json(objects);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching objects from S3/Cloudfront');
  }
};
