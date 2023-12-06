import express from 'express';
import {uploadAudio} from '../controllers/audio.controller.js';
import upload from '../middlewares/uploadAudio.middleware.js';

const router = express.Router();

router.post('/upload', upload.single('audioFile'), uploadAudio);

export default router;
