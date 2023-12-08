import express from 'express';
import {
  uploadAudio,
  getAudios,
  deleteAudio,
  streamAudio,
  getSingleAudio,
  getStreamingCount,
} from '../controllers/audio.controller.js';
import upload from '../middlewares/uploadAudio.middleware.js';

const router = express.Router();

router.post('/upload', upload.single('audioFile'), uploadAudio);
router.get('/audio', getAudios);
router.get('/track/:id', getSingleAudio);
router.get('/track/streamed/:id', getStreamingCount);
router.delete('/audio/:id', deleteAudio);
router.get('/stream/:id', streamAudio);

export default router;
