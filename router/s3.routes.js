import express from 'express';
import {getAWSaudio} from '../controllers/s3.controller.js';

const router = express.Router();

router.get('/list-s3-objects', getAWSaudio);

export default router;
