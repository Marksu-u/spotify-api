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
import upload from '../middlewares/uploadAudio.middleware.js';

const router = express.Router();

router.get('/', getAudios);
router.get('/by/:id', getAudiosByArtist);
router.get('/from/:id', getAudiosByAlbum);
router.get('/:id', getSingleAudio);
router.put('/:id', editAudio);
router.put('/:id', upload.single('audioFile'), editAudio);
router.post('/upload', upload.single('audioFile'), uploadAudio);
router.delete('/:id', deleteAudio);
router.get('/stream/:id', streamAudio);
router.get('/streamed/:id', getStreamingCount);

export default router;
