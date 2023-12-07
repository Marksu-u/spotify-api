import express from 'express';
import {
  uploadAudio,
  getAudios,
  deleteAudio,
  streamAudio,
} from '../controllers/audio.controller.js';
import upload from '../middlewares/uploadAudio.middleware.js';

const router = express.Router();

router.post('/upload', upload.single('audioFile'), uploadAudio);
router.get('/audios', getAudios);
router.delete('/audio/:id', deleteAudio);
router.get('/stream/:id', streamAudio);

export default router;
