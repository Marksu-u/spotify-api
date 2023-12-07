import express from 'express';
import {uploadAudio, getAudios} from '../controllers/audio.controller.js';
import upload from '../middlewares/uploadAudio.middleware.js';

const router = express.Router();

router.post('/upload', upload.single('audioFile'), uploadAudio);
router.get('/audios', getAudios);

export default router;
