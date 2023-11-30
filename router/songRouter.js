import express from 'express';
import * as songController from '../controllers/songs';

const songRouter = express.Router();

songRouter.get('/songs', songController.listSongs);
songRouter.get('/songs/:id', songController.getSong);
songRouter.post('/songs', songController.createSong);
songRouter.put('/songs/:id', songController.updateSong);
songRouter.delete('/songs/:id', songController.deleteSong);

export default songRouter;
