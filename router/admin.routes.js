import express from 'express';
import {
  getAdmins,
  getLastAdmin,
  getSingleAdmin,
  addAdmin,
  updateAdmin,
  deleteAdmin,
  loginAdmin,
} from '../controllers/admin.controller.js';
import verifyToken from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/log', loginAdmin);
router.get('/', verifyToken, getAdmins);
router.get('/last', verifyToken, getLastAdmin);
router.get('/:id', verifyToken, getSingleAdmin);
router.post('/', verifyToken, addAdmin);
router.put('/:id', verifyToken, updateAdmin);
router.delete('/:id', verifyToken, deleteAdmin);

export default router;
