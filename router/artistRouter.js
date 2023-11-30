import express from 'express';
import * as artistController from '../controllers/artists';

const artistRouter = express.Router();

artistRouter.get('/artists', artistController.listArtists);
artistRouter.get('/artists/:id', artistController.getArtist);
artistRouter.post('/artists', artistController.createArtist);
artistRouter.put('/artists/:id', artistController.updateArtist);
artistRouter.delete('/artists/:id', artistController.deleteArtist);

export default artistRouter;
