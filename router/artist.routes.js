import express from 'express';
import {getArtists} from '../controllers/artist.controller.js';

const router = express.Router();

router.get('/artists', getArtists);

export default router;
