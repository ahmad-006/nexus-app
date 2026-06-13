import express from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController.js';
import { protect } from '../controllers/authController.js';

const router = express.Router();

// Require authentication for all notification endpoints
router.use(protect);

router.route('/').get(getNotifications);
router.route('/read-all').patch(markAllAsRead);
router.route('/:id/read').patch(markAsRead);

// Development / Testing route to trigger live WebSocket notification to current user
router.route('/test-live').post(async (req, res) => {
  const { createNotification } = await import('../util/notificationService.js');
  const notification = await createNotification({
    recipientId: req.user.id,
    senderId: '6a8af4f8a30d085f03b42021', // Ahmad Aamir
    type: 'TICKET_ASSIGNED',
    message: '⚡ LIVE ALERT: Ahmad Aamir assigned you to ticket: Alpha Platform Task #1',
    resourceId: '6a8af6b571b31e966f316482',
  });

  res.status(200).json({
    status: 'success',
    data: { notification },
  });
});

export const notificationRouter = router;
