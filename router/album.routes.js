import express from 'express';
import {
  getAlbums,
  getSingleAlbum,
  editAlbum,
  createAlbum,
  deleteAlbum,
} from '../controllers/album.controller.js';

const router = express.Router();

router.get('/', getAlbums);
router.get('/:id', getSingleAlbum);
router.post('/', createAlbum);
router.put('/:id', editAlbum);
router.delete('/:id', deleteAlbum);

export default router;
