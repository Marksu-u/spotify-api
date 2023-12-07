import express from 'express';
import {getAWSaudio} from '../controllers/s3.controller.js';

const router = express.Router();

router.get('/list-s3-objects', getAWSaudio);

// https://d1sivx0xa3w3jl.cloudfront.net

export default router;
