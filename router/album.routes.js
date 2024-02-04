import express from 'express';
import {
  getAlbums,
  getLastAlbum,
  getAlbumWithAudios,
  getSingleAlbum,
  editAlbum,
  createAlbum,
  deleteAlbum,
} from '../controllers/album.controller.js';
import upload from '../middlewares/upload.middleware.js';
import verifyToken from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getAlbums);
router.get('/last', getLastAlbum);
router.get('/audio/:id', getAlbumWithAudios);
router.get('/:id', getSingleAlbum);
router.post('/', verifyToken, upload.single('picture'), createAlbum);
router.put('/:id', verifyToken, upload.single('picture'), editAlbum);
router.delete('/:id', verifyToken, deleteAlbum);

export default router;
