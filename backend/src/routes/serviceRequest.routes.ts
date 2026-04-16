import { Router } from 'express';
import { ServiceRequestController } from '../controllers/serviceRequest.controller';
import { authorizeRoles } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();
const controller = new ServiceRequestController();

// All authenticated users can view and create requests
router.get('/', (req, res) => controller.getAll(req as any, res));
router.post('/', upload.array('attachments', 5), (req, res) => controller.create(req as any, res));

// Owner can edit/delete their own requests (guards in service check NEW status)
router.patch('/:id/request-delete', (req, res) => controller.requestDeletion(req as any, res));
router.post('/:id/rate', (req, res) => controller.submitRating(req as any, res));
router.put('/:id', upload.array('attachments', 5), (req, res) => controller.update(req as any, res));
router.delete('/:id', (req, res) => controller.delete(req as any, res));

// Only admins and technical staff can change status
router.patch('/:id/status', authorizeRoles('ADMIN', 'TECHNICAL'), (req, res) => controller.updateStatus(req as any, res));

export default router;
