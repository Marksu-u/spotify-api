import express from 'express';
import {
  getArtists,
  getLastArtist,
  getAllArtists,
  getSingleArtist,
  editArtist,
  createArtist,
  deleteArtist,
} from '../controllers/artist.controller.js';
import verifyToken from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getArtists);
router.get('/last', getLastArtist);
router.get('/all', getAllArtists);
router.get('/:id', getSingleArtist);
router.put('/:id', verifyToken, editArtist);
router.post('/', verifyToken, createArtist);
router.delete('/:id', verifyToken, deleteArtist);

export default router;
