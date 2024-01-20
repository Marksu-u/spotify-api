import express from 'express';
import {
  getAudios,
  getAudiosByArtist,
  getAudiosByAlbum,
  getSingleAudio,
  editAudio,
  uploadAudio,
  deleteAudio,
  streamAudio,
  getStreamingCount,
} from '../controllers/audio.controller.js';
import upload from '../middlewares/upload.middleware.js';
import verifyToken from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getAudios);
router.get('/by/:id', getAudiosByArtist);
router.get('/from/:id', getAudiosByAlbum);
router.get('/:id', getSingleAudio);
router.put('/:id', verifyToken, editAudio);
router.put('/:id', verifyToken, editAudio);
router.post('/upload', verifyToken, upload.single('audioFile'), uploadAudio);
router.delete('/:id', verifyToken, deleteAudio);
router.get('/stream/:id', streamAudio);
router.get('/streamed/:id', getStreamingCount);

export default router;
