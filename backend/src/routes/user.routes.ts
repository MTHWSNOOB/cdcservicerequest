import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { upload } from '../middleware/upload.middleware';

const router = Router();
const controller = new UserController();

router.get('/', (req, res) => controller.getAll(req, res));
router.post('/', upload.single('avatar'), (req, res) => controller.create(req, res));
router.put('/:id', upload.single('avatar'), (req, res) => controller.update(req, res));
router.patch('/:id/reset-password', (req, res) => controller.resetPassword(req, res));
router.delete('/:id', (req, res) => controller.delete(req, res));

export default router;
