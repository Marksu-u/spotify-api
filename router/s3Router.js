import express from 'express';
import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const s3 = new AWS.S3();

router.get('/list-s3-objects', async (req, res) => {
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
});

router.get('/get-s3-object/:key', async (req, res) => {
  const bucketName = process.env.AWS_BUCKET_NAME;
  const objectKey = decodeURIComponent(req.params.key);

  try {
    const params = {
      Bucket: bucketName,
      Key: decodeURIComponent(objectKey),
    };

    const headCode = await s3.headObject(params).promise();
    if (headCode) {
      const url = s3.getSignedUrl('getObject', {
        Bucket: bucketName,
        Key: objectKey,
        Expires: 60, // URL expires in 60 seconds
      });

      res.json({url});
    }
  } catch (err) {
    if (err.code === 'NotFound') {
      res.status(404).send('Song not found');
    } else {
      console.error(err);
      res.status(500).send('Error fetching object from S3');
    }
  }
});

// https://d1sivx0xa3w3jl.cloudfront.net

export default router;
