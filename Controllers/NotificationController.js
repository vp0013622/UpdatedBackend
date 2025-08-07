import { NotificationModel } from '../Models/NotificationModel.js';
import { UsersModel } from '../Models/UsersModel.js';

// Create notification
export const CreateNotification = async (req, res) => {
  try {
    const {
      recipientIds,
      type,
      title,
      message,
      relatedId,
      relatedModel,
      data,
      priority = 'medium'
    } = req.body;

    // Ensure recipientIds is an array
    const recipientIdsArray = Array.isArray(recipientIds) ? recipientIds : [recipientIds];

    // Create notification for each recipient
    const notifications = [];
    for (const recipientId of recipientIdsArray) {
      const notification = new NotificationModel({
        recipientIds: [recipientId], // Store as array for consistency
        type,
        title,
        message,
        relatedId,
        relatedModel,
        data,
        priority,
        createdByUserId: req.user.id,
        updatedByUserId: req.user.id,
        published: true
      });

      await notification.save();
      notifications.push(notification);
    }

    res.status(201).json({
      success: true,
      message: notifications.length === 1 
        ? 'Notification created successfully' 
        : `${notifications.length} notifications created successfully`,
      data: notifications.length === 1 ? notifications[0] : notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating notification',
      error: error.message
    });
  }
};

// Get notifications for a user
export const GetUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const query = { recipientIds: userId };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await NotificationModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('recipientIds', 'firstName lastName email')
      .populate('relatedId', 'name email')
      .populate('createdByUserId', 'firstName lastName')
      .populate('updatedByUserId', 'firstName lastName')
      .exec();

    const total = await NotificationModel.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: notifications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving notifications',
      error: error.message
    });
  }
};

// Mark notification as read
export const MarkNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await NotificationModel.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
      error: error.message
    });
  }
};

// Mark notification as unread
export const MarkNotificationAsUnread = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await NotificationModel.findByIdAndUpdate(
      notificationId,
      { isRead: false },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as unread',
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking notification as unread',
      error: error.message
    });
  }
};

// Mark all notifications as read for a user
export const MarkAllNotificationsAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await NotificationModel.updateMany(
      { recipientId: userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      data: { updatedCount: result.modifiedCount }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking notifications as read',
      error: error.message
    });
  }
};

// Delete notification
export const DeleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await NotificationModel.findByIdAndDelete(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting notification',
      error: error.message
    });
  }
};

// Get unread count for a user
export const GetUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;

    const count = await NotificationModel.countDocuments({
      recipientIds: userId,
      isRead: false
    });

    res.status(200).json({
      success: true,
      message: 'Unread count retrieved',
      data: { unreadCount: count }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting unread count',
      error: error.message
    });
  }
};

// Get all notifications (admin only)
export const GetAll = async (req, res) => {
  try {
    const notifications = await NotificationModel.find({ published: true })
      .populate('recipientIds', 'firstName lastName email')
      .populate('createdByUserId', 'firstName lastName')
      .populate('updatedByUserId', 'firstName lastName')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: 'All notifications retrieved successfully',
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all not published notifications (admin only)
export const GetAllNotPublished = async (req, res) => {
  try {
    const notifications = await NotificationModel.find({ published: false })
      .populate('recipientId', 'firstName lastName email')
      .populate('createdByUserId', 'firstName lastName')
      .populate('updatedByUserId', 'firstName lastName')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: 'All not published notifications retrieved successfully',
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get notifications with parameters
export const GetAllWithParams = async (req, res) => {
  try {
    const { 
      recipientId = null, 
      type = null, 
      isRead = null, 
      priority = null, 
      published = null 
    } = req.body;
    
    let filter = {};

    if (recipientId) filter.recipientId = recipientId;
    if (type) filter.type = type;
    if (isRead !== null) filter.isRead = isRead;
    if (priority) filter.priority = priority;
    if (published !== null) filter.published = published;

    const notifications = await NotificationModel.find(filter)
      .populate('recipientId', 'firstName lastName email')
      .populate('createdByUserId', 'firstName lastName')
      .populate('updatedByUserId', 'firstName lastName')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: 'Notifications retrieved successfully',
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get notification by ID
export const GetById = async (req, res) => {
  try {
    const notification = await NotificationModel.findById(req.params.id)
      .populate('recipientId', 'firstName lastName email')
      .populate('createdByUserId', 'firstName lastName')
      .populate('updatedByUserId', 'firstName lastName');

    if (!notification) {
      return res.status(404).json({
        message: 'Notification not found',
        data: {}
      });
    }

    return res.status(200).json({
      message: 'Notification retrieved successfully',
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update notification
export const Update = async (req, res) => {
  try {
    const { 
      title, 
      message, 
      type, 
      priority, 
      isRead, 
      published 
    } = req.body;
    
    const notification = await NotificationModel.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        message: 'Notification not found',
        data: {}
      });
    }

    notification.title = title || notification.title;
    notification.message = message || notification.message;
    notification.type = type || notification.type;
    notification.priority = priority || notification.priority;
    notification.isRead = isRead !== undefined ? isRead : notification.isRead;
    notification.published = published !== undefined ? published : notification.published;
    notification.updatedByUserId = req.user.id;

    await notification.save();
    
    return res.status(200).json({
      message: 'Notification updated successfully',
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete notification (soft delete)
export const DeleteById = async (req, res) => {
  try {
    const notification = await NotificationModel.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        message: 'Notification not found',
        data: {}
      });
    }

    notification.published = false;
    notification.updatedByUserId = req.user.id;
    await notification.save();

    return res.status(200).json({
      message: 'Notification deleted successfully',
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Test endpoint to create sample notifications
export const CreateTestNotification = async (req, res) => {
  try {
    const { userId, type = 'general' } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const testNotifications = [
      {
        recipientIds: [userId],
        type: 'meeting_schedule',
        title: 'Meeting Scheduled',
        message: 'Your meeting "Property Discussion" has been scheduled for tomorrow at 2:00 PM.',
        priority: 'medium',
        data: {
          meetingTitle: 'Property Discussion',
          date: '2024-01-15',
          time: '14:00',
          description: 'Discussion about property details'
        },
        createdByUserId: req.user.id,
        updatedByUserId: req.user.id,
        published: true
      },
      {
        recipientIds: [userId],
        type: 'lead_assignment',
        title: 'New Lead Assigned',
        message: 'You have been assigned a new lead for John Doe regarding Luxury Villa.',
        priority: 'high',
        data: {
          customerName: 'John Doe',
          propertyName: 'Luxury Villa',
          leadId: 'test-lead-id'
        },
        createdByUserId: req.user.id,
        updatedByUserId: req.user.id,
        published: true
      },
      {
        recipientIds: [userId],
        type: 'contact_us',
        title: 'New Contact Form',
        message: 'New contact form submission from jane@example.com: Property Inquiry',
        priority: 'medium',
        data: {
          customerName: 'Jane Smith',
          customerEmail: 'jane@example.com',
          subject: 'Property Inquiry',
          message: 'I would like to know more about your properties.'
        },
        createdByUserId: req.user.id,
        updatedByUserId: req.user.id,
        published: true
      },
      {
        recipientIds: [userId],
        type: 'general',
        title: 'Welcome to Inhabit Realties',
        message: 'Thank you for joining our platform. We hope you find your dream property!',
        priority: 'low',
        data: {
          welcome: true
        },
        createdByUserId: req.user.id,
        updatedByUserId: req.user.id,
        published: true
      }
    ];

    const createdNotifications = [];
    for (const notificationData of testNotifications) {
      const notification = new NotificationModel(notificationData);
      await notification.save();
      createdNotifications.push(notification);
    }

    res.status(201).json({
      success: true,
      message: 'Test notifications created successfully',
      data: createdNotifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating test notifications',
      error: error.message
    });
  }
};

// Create meeting reminder notifications for today
export const CreateMeetingReminders = async (req, res) => {
  try {
    const createdNotifications = await NotificationService.createMeetingReminderNotifications();

    res.status(200).json({
      success: true,
      message: 'Meeting reminder notifications created successfully',
      data: {
        createdCount: createdNotifications.length,
        notifications: createdNotifications
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating meeting reminder notifications',
      error: error.message
    });
  }
}; 