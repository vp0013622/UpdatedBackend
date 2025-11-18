import express from 'express';
import { TrackPropertyView, GetUserViewCount, GetUserViews } from '../Controllers/PropertyViewController.js';
import { AuthMiddelware } from '../Middlewares/AuthMiddelware.js';
import { RoleAuthMiddleware } from '../Middlewares/RoleAuthMiddelware.js';

const PropertyViewRouter = express.Router();

// Track a property view (requires authentication)
PropertyViewRouter.post('/track', AuthMiddelware, TrackPropertyView);

// Get view count for a user (requires authentication)
PropertyViewRouter.get('/user/:userId/count', AuthMiddelware, GetUserViewCount);

// Get all views for a user (requires authentication)
PropertyViewRouter.get('/user/:userId', AuthMiddelware, GetUserViews);

export default PropertyViewRouter;

