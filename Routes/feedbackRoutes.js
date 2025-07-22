import express from 'express';
const FeedbackRouter = express.Router();
import * as FeedbackController from '../Controllers/FeedbackController.js';
import { AuthMiddelware } from '../Middlewares/AuthMiddelware.js';
import { RoleAuthMiddleware } from '../Middlewares/RoleAuthMiddelware.js';

// Public routes (require authentication)
FeedbackRouter.post('/', AuthMiddelware, FeedbackController.CreateFeedback);
FeedbackRouter.get('/my-feedback', AuthMiddelware, FeedbackController.GetMyFeedback);
FeedbackRouter.get('/:id', AuthMiddelware, FeedbackController.GetFeedbackById);
FeedbackRouter.put('/:id', AuthMiddelware, FeedbackController.UpdateFeedback);
FeedbackRouter.delete('/:id', AuthMiddelware, FeedbackController.DeleteFeedback);

// Admin-only routes
FeedbackRouter.get('/', RoleAuthMiddleware("admin", "executive"), FeedbackController.GetAllFeedback);
FeedbackRouter.post('/:id/respond', RoleAuthMiddleware("admin", "executive"), FeedbackController.RespondToFeedback);
FeedbackRouter.put('/:id/status', RoleAuthMiddleware("admin", "executive"), FeedbackController.UpdateFeedbackStatus);
FeedbackRouter.get('/analytics/summary', RoleAuthMiddleware("admin", "executive"), FeedbackController.GetFeedbackSummary);
FeedbackRouter.get('/analytics/detailed', RoleAuthMiddleware("admin", "executive"), FeedbackController.GetFeedbackAnalytics);

export default FeedbackRouter; 