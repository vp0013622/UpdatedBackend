import { FeedbackModel } from '../Models/FeedbackModel.js';
import { UsersModel } from '../Models/UsersModel.js';

// Create new feedback
const CreateFeedback = async (req, res) => {
  try {
    const {
      salesPersonUserId,
      overallExperience,
      salesPersonRating,
      companyRating,
      whatUserLiked,
      whatToImprove,
      isAnonymous = false
    } = req.body;

    // Validate required fields
    if (!salesPersonUserId) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Sales person ID is required',
        data: null
      });
    }

    if (!overallExperience || overallExperience < 1 || overallExperience > 5) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Overall experience rating is required and must be between 1 and 5',
        data: null
      });
    }

    if (!salesPersonRating || salesPersonRating < 1 || salesPersonRating > 5) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Sales person rating is required and must be between 1 and 5',
        data: null
      });
    }

    if (!companyRating || companyRating < 1 || companyRating > 5) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Company rating is required and must be between 1 and 5',
        data: null
      });
    }

    if (!whatUserLiked) {
      return res.status(400).json({
        statusCode: 400,
        message: 'What you liked field is required',
        data: null
      });
    }

    // Create feedback object
    const feedbackData = {
      salesPersonUserId,
      customerId: req.user._id,
      overallExperience,
      salesPersonRating,
      companyRating,
      whatUserLiked,
      whatToImprove,
      isAnonymous,
      createdByUserId: req.user._id,
      updatedByUserId: req.user._id
    };

    const feedback = new FeedbackModel(feedbackData);
    await feedback.save();

    // Populate user information if not anonymous
    if (!isAnonymous) {
      await feedback.populate('feedbackGiverUserId', 'firstName lastName email');
    }

    res.status(201).json({
      statusCode: 201,
      message: 'Feedback submitted successfully',
      data: feedback
    });

  } catch (error) {
    console.error('CreateFeedback Error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      data: null
    });
  }
};

// Get all feedback (admin only)
const GetAllFeedback = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      rating,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;
    const query = {};

    // Apply filters
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (rating) query.overallRating = { $gte: parseInt(rating) };

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const feedback = await FeedbackModel.find(query)
      .populate('salesPersonUserId', 'firstName lastName email')
      .populate('customerId', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await FeedbackModel.countDocuments(query);

    res.status(200).json({
      statusCode: 200,
      message: 'All feedback retrieved successfully',
      data: feedback,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('GetAllFeedback Error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      data: null
    });
  }
};

// Get feedback by ID
const GetFeedbackById = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await FeedbackModel.findById(id)
      .populate('salesPersonUserId', 'firstName lastName email')
      .populate('customerId', 'firstName lastName email');

    if (!feedback) {
      return res.status(404).json({
        statusCode: 404,
        message: 'Feedback not found',
        data: null
      });
    }

    res.status(200).json({
      statusCode: 200,
      message: 'Feedback retrieved successfully',
      data: feedback
    });

  } catch (error) {
    console.error('GetFeedbackById Error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      data: null
    });
  }
};

// Get user's own feedback
const GetMyFeedback = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const feedback = await FeedbackModel.find({ customerId: userId })
      .populate('salesPersonUserId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await FeedbackModel.countDocuments({ customerId: userId });

    res.status(200).json({
      statusCode: 200,
      message: 'Your feedback retrieved successfully',
      data: feedback,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('GetMyFeedback Error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      data: null
    });
  }
};

// Update feedback (user can only update their own feedback if status is pending)
const UpdateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const updateData = req.body;

    const feedback = await FeedbackModel.findById(id);

    if (!feedback) {
      return res.status(404).json({
        statusCode: 404,
        message: 'Feedback not found',
        data: null
      });
    }

    // Check if user owns this feedback or is admin
    if (feedback.customerId.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        statusCode: 403,
        message: 'You can only update your own feedback',
        data: null
      });
    }

    // Users can only update if status is pending
    if (feedback.customerId.toString() === userId.toString() && feedback.status !== 'pending') {
      return res.status(400).json({
        statusCode: 400,
        message: 'Cannot update feedback that has been viewed',
        data: null
      });
    }

    // Remove fields that shouldn't be updated by users
    if (req.user.role !== 'admin') {
      delete updateData.status;
      delete updateData.priority;
      delete updateData.adminResponse;
    }

    updateData.updatedByUserId = userId;
    updateData.updatedAt = new Date();

    const updatedFeedback = await FeedbackModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('feedbackGiverUserId', 'firstName lastName email');

    res.status(200).json({
      statusCode: 200,
      message: 'Feedback updated successfully',
      data: updatedFeedback
    });

  } catch (error) {
    console.error('UpdateFeedback Error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      data: null
    });
  }
};

// Delete feedback (admin only or user can delete their own pending feedback)
const DeleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const feedback = await FeedbackModel.findById(id);

    if (!feedback) {
      return res.status(404).json({
        statusCode: 404,
        message: 'Feedback not found',
        data: null
      });
    }

    // Check permissions
    if (feedback.customerId.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        statusCode: 403,
        message: 'You can only delete your own feedback',
        data: null
      });
    }

    // Users can only delete pending feedback
    if (feedback.customerId.toString() === userId.toString() && feedback.status !== 'pending') {
      return res.status(400).json({
        statusCode: 400,
        message: 'Cannot delete feedback that has been viewed',
        data: null
      });
    }

    await FeedbackModel.findByIdAndDelete(id);

    res.status(200).json({
      statusCode: 200,
      message: 'Feedback deleted successfully',
      data: null
    });

  } catch (error) {
    console.error('DeleteFeedback Error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      data: null
    });
  }
};

// Update feedback status (admin only)
const UpdateFeedbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const feedback = await FeedbackModel.findById(id);

    if (!feedback) {
      return res.status(404).json({
        statusCode: 404,
        message: 'Feedback not found',
        data: null
      });
    }

    const updateData = {
      updatedByUserId: req.user._id,
      updatedAt: new Date()
    };

    if (status) updateData.status = status;

    const updatedFeedback = await FeedbackModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('salesPersonUserId', 'firstName lastName email')
     .populate('customerId', 'firstName lastName email');

    res.status(200).json({
      statusCode: 200,
      message: 'Feedback status updated successfully',
      data: updatedFeedback
    });

  } catch (error) {
    console.error('UpdateFeedbackStatus Error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      data: null
    });
  }
};

// Get feedback analytics (admin only)
const GetFeedbackAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {};
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Overall statistics
    const totalFeedback = await FeedbackModel.countDocuments(query);
    
    // Average ratings
    const averageRatings = await FeedbackModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          avgOverallExperience: { $avg: '$overallExperience' },
          avgSalesPersonRating: { $avg: '$salesPersonRating' },
          avgCompanyRating: { $avg: '$companyRating' }
        }
      }
    ]);

    // Rating distribution for overall experience
    const overallExperienceDistribution = await FeedbackModel.aggregate([
      { $match: query },
      { $group: { _id: '$overallExperience', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Sales person rating distribution
    const salesPersonDistribution = await FeedbackModel.aggregate([
      { $match: query },
      { $group: { _id: '$salesPersonRating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Company rating distribution
    const companyRatingDistribution = await FeedbackModel.aggregate([
      { $match: query },
      { $group: { _id: '$companyRating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Status distribution
    const statusDistribution = await FeedbackModel.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Priority distribution
    const priorityDistribution = await FeedbackModel.aggregate([
      { $match: query },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // Recent feedback (last 10)
    const recentFeedback = await FeedbackModel.find(query)
      .populate('feedbackGiverUserId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      statusCode: 200,
      message: 'Feedback analytics retrieved successfully',
      data: {
        totalFeedback,
        averageRatings: averageRatings[0] || {},
        overallExperienceDistribution,
        salesPersonDistribution,
        companyRatingDistribution,
        statusDistribution,
        priorityDistribution,
        recentFeedback
      }
    });

  } catch (error) {
    console.error('GetFeedbackAnalytics Error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      data: null
    });
  }
};

// Get feedback summary for dashboard
const GetFeedbackSummary = async (req, res) => {
  try {
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Today's feedback
    const todayFeedback = await FeedbackModel.countDocuments({
      createdAt: { $gte: today.setHours(0, 0, 0, 0) }
    });

    // This week's feedback
    const weekFeedback = await FeedbackModel.countDocuments({
      createdAt: { $gte: lastWeek }
    });

    // This month's feedback
    const monthFeedback = await FeedbackModel.countDocuments({
      createdAt: { $gte: lastMonth }
    });

    // Pending feedback
    const pendingFeedback = await FeedbackModel.countDocuments({ status: 'pending' });

    // High priority feedback
    const highPriorityFeedback = await FeedbackModel.countDocuments({
      priority: { $in: ['high', 'critical'] }
    });

    // Average ratings this month
    const monthlyAverageRatings = await FeedbackModel.aggregate([
      { $match: { createdAt: { $gte: lastMonth } } },
      {
        $group: {
          _id: null,
          avgOverallExperience: { $avg: '$overallExperience' },
          avgSalesPersonRating: { $avg: '$salesPersonRating' },
          avgCompanyRating: { $avg: '$companyRating' }
        }
      }
    ]);

    res.status(200).json({
      statusCode: 200,
      message: 'Feedback summary retrieved successfully',
      data: {
        todayFeedback,
        weekFeedback,
        monthFeedback,
        pendingFeedback,
        highPriorityFeedback,
        monthlyAverageRatings: monthlyAverageRatings[0] || {}
      }
    });

  } catch (error) {
    console.error('GetFeedbackSummary Error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      data: null
    });
  }
};

export {
  CreateFeedback,
  GetAllFeedback,
  GetFeedbackById,
  GetMyFeedback,
  UpdateFeedback,
  DeleteFeedback,
  UpdateFeedbackStatus,
  GetFeedbackAnalytics,
  GetFeedbackSummary
}; 