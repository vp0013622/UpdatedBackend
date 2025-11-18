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

// User-specific operations (use current authenticated user) - MUST BE BEFORE /:id ROUTE
NotificationRouter.get('/my-notifications', RoleAuthMiddleware("admin", "sales", "executive", "saller", "user"), GetUserNotifications);
NotificationRouter.get('/unread-count', RoleAuthMiddleware("admin", "sales", "executive", "saller", "user"), GetUnreadCount);
NotificationRouter.put('/read-all', RoleAuthMiddleware("admin", "sales", "executive", "saller", "user"), MarkAllNotificationsAsRead);
NotificationRouter.put('/read/:notificationId', RoleAuthMiddleware("admin", "sales", "executive", "saller", "user"), MarkNotificationAsRead);
NotificationRouter.put('/unread/:notificationId', RoleAuthMiddleware("admin", "sales", "executive", "saller", "user"), MarkNotificationAsUnread);
NotificationRouter.delete('/delete/:notificationId', RoleAuthMiddleware("admin", "sales", "executive", "saller", "user"), DeleteNotification);

// Standard CRUD operations (admin only)
NotificationRouter.post('/create', RoleAuthMiddleware("admin"), CreateNotification);
NotificationRouter.get('/', RoleAuthMiddleware("admin", "executive"), GetAll);
NotificationRouter.get('/notpublished', RoleAuthMiddleware("admin"), GetAllNotPublished);
NotificationRouter.post('/withparams', RoleAuthMiddleware("admin", "executive"), GetAllWithParams);
NotificationRouter.post('/test/create', RoleAuthMiddleware("admin"), CreateTestNotification);
NotificationRouter.post('/meeting-reminders', RoleAuthMiddleware("admin"), CreateMeetingReminders);
NotificationRouter.put('/edit/:id', RoleAuthMiddleware("admin"), Update);
NotificationRouter.delete('/delete/:id', RoleAuthMiddleware("admin"), DeleteById);

// Parameterized routes MUST BE LAST
NotificationRouter.get('/:id', RoleAuthMiddleware("admin", "executive"), GetById);

export default NotificationRouter; 