import express from 'express';
import {getAWSaudio, getAudioURL} from '../controllers/s3.controller.js';

const router = express.Router();

router.get('/list-s3-objects', getAWSaudio);
router.get('/get-s3-object/:key', getAudioURL);

// https://d1sivx0xa3w3jl.cloudfront.net

export default router;
