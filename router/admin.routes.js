import express from 'express';
import verifyToken from '../middlewares/auth.middleware.js';
import {
  getAdmins,
  getSingleAdmin,
  addAdmin,
  updateAdmin,
  deleteAdmin,
  loginAdmin,
} from '../controllers/admin.controller.js';

const router = express.Router();

router.post('/log', loginAdmin);
router.get('/', verifyToken, getAdmins);
router.get('/:id', verifyToken, getSingleAdmin);
router.post('/', verifyToken, addAdmin);
router.put('/:id', verifyToken, updateAdmin);
router.delete('/:id', verifyToken, deleteAdmin);

export default router;
