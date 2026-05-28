import express from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController.js';
import { protect } from '../controllers/authController.js';

const router = express.Router();

// Require authentication for all notification endpoints
router.use(protect);

router.route('/').get(getNotifications);
router.route('/read-all').patch(markAllAsRead);
router.route('/:id/read').patch(markAsRead);

export const notificationRouter = router;
