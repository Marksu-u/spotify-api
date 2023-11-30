import express from 'express';
import * as albumController from '../controllers/albums';

const albumRouter = express.Router();

albumRouter.get('/albums', albumController.listAlbums);
albumRouter.get('/albums/:id', albumController.getAlbums);
albumRouter.post('/albums', albumController.createAlbum);
albumRouter.put('/albums/:id', albumController.updateAlbum);
albumRouter.delete('/albums/:id', albumController.deleteAlbum);

export default albumRouter;
