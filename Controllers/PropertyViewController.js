import { PropertyViewModel } from '../Models/PropertyViewModel.js';

/**
 * Track a property view
 * Creates a new view record when a user views a property
 */
export const TrackPropertyView = async (req, res) => {
    try {
        const { propertyId } = req.body;
        const userId = req.user?.id || req.user?._id || req.user?.userId;

        if (!propertyId) {
            return res.status(400).json({
                message: 'Property ID is required',
                data: null
            });
        }

        if (!userId) {
            // Allow tracking even without user (for anonymous views)
            // But we'll still create a record if possible
            return res.status(401).json({
                message: 'User authentication required to track views',
                data: null
            });
        }

        // Create a new view record
        const newView = new PropertyViewModel({
            propertyId,
            userId,
            createdByUserId: userId,
            updatedByUserId: userId
        });

        await newView.save();

        return res.status(201).json({
            message: 'Property view tracked successfully',
            data: newView
        });
    } catch (error) {
        console.error('PropertyViewController: Track view error:', error);
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Get view count for a specific user
 * Returns the total number of unique properties viewed by a user
 */
export const GetUserViewCount = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                message: 'User ID is required',
                data: null
            });
        }

        // Count distinct properties viewed by this user
        const viewCount = await PropertyViewModel.distinct('propertyId', {
            userId: userId,
            published: true
        });

        return res.status(200).json({
            message: 'User view count retrieved successfully',
            count: viewCount.length,
            data: viewCount
        });
    } catch (error) {
        console.error('PropertyViewController: Get view count error:', error);
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Get all views for a specific user
 * Returns all property views with property details
 */
export const GetUserViews = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                message: 'User ID is required',
                data: null
            });
        }

        const views = await PropertyViewModel.find({
            userId: userId,
            published: true
        })
        .populate('propertyId', 'name price propertyAddress')
        .sort({ viewedAt: -1 });

        return res.status(200).json({
            message: 'User views retrieved successfully',
            count: views.length,
            data: views
        });
    } catch (error) {
        console.error('PropertyViewController: Get user views error:', error);
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

