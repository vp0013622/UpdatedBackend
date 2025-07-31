import express from 'express';
import {
  CreateNotification,
  GetAll,
  GetAllNotPublished,
  GetAllWithParams,
  GetById,
  Update,
  DeleteById,
  GetUserNotifications,
  MarkNotificationAsRead,
  MarkNotificationAsUnread,
  MarkAllNotificationsAsRead,
  DeleteNotification,
  GetUnreadCount,
  CreateTestNotification,
  CreateMeetingReminders
} from '../Controllers/NotificationController.js';
import { RoleAuthMiddleware } from '../Middlewares/RoleAuthMiddelware.js';

const NotificationRouter = express.Router();

// Standard CRUD operations (admin only)
NotificationRouter.post('/create', RoleAuthMiddleware("admin"), CreateNotification);
NotificationRouter.get('/', RoleAuthMiddleware("admin", "executive"), GetAll);
NotificationRouter.get('/notpublished', RoleAuthMiddleware("admin"), GetAllNotPublished);
NotificationRouter.post('/withparams', RoleAuthMiddleware("admin", "executive"), GetAllWithParams);
NotificationRouter.get('/:id', RoleAuthMiddleware("admin", "executive"), GetById);
NotificationRouter.put('/edit/:id', RoleAuthMiddleware("admin"), Update);
NotificationRouter.delete('/delete/:id', RoleAuthMiddleware("admin"), DeleteById);

// User-specific operations
NotificationRouter.get('/user/:userId', RoleAuthMiddleware("admin", "sales", "executive", "saller", "user"), GetUserNotifications);
NotificationRouter.put('/read/:notificationId', RoleAuthMiddleware("admin", "sales", "executive", "saller", "user"), MarkNotificationAsRead);
NotificationRouter.put('/unread/:notificationId', RoleAuthMiddleware("admin", "sales", "executive", "saller", "user"), MarkNotificationAsUnread);
NotificationRouter.put('/read-all/:userId', RoleAuthMiddleware("admin", "sales", "executive", "saller", "user"), MarkAllNotificationsAsRead);
NotificationRouter.delete('/delete/:notificationId', RoleAuthMiddleware("admin", "sales", "executive", "saller", "user"), DeleteNotification);
NotificationRouter.get('/unread-count/:userId', RoleAuthMiddleware("admin", "sales", "executive", "saller", "user"), GetUnreadCount);

// Test endpoint to create sample notifications
NotificationRouter.post('/test/create', RoleAuthMiddleware("admin"), CreateTestNotification);

// Meeting reminder endpoint
NotificationRouter.post('/meeting-reminders', RoleAuthMiddleware("admin"), CreateMeetingReminders);

export default NotificationRouter; 