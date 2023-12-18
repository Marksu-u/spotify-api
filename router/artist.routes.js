import express from 'express';
import {
  getArtists,
  getSingleArtist,
  editArtist,
  createArtist,
  deleteArtist,
} from '../controllers/artist.controller.js';

const router = express.Router();

router.get('/', getArtists);
router.get('/:id', getSingleArtist);
router.put('/:id', editArtist);
router.post('/', createArtist);
router.delete('/:id', deleteArtist);

export default router;
