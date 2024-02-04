import express from 'express';
import {
  getAudios,
  getLastAudio,
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

const router = express.Router();

router.get('/', getAudios);
router.get('/last', getLastAudio);
router.get('/by/:id', getAudiosByArtist);
router.get('/from/:id', getAudiosByAlbum);
router.get('/:id', getSingleAudio);
router.put('/:id', editAudio);
router.put('/:id', editAudio);
router.post('/upload', upload.single('filename'), uploadAudio);
router.delete('/:id', deleteAudio);
router.get('/stream/:id', streamAudio);
router.get('/streamed/:id', getStreamingCount);

export default router;
