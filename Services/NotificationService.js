import { NotificationModel } from '../Models/NotificationModel.js';
import { UsersModel } from '../Models/UsersModel.js';

class NotificationService {
  // Create meeting schedule notification
  static async createMeetingNotification(meetingData, action = 'created') {
    try {
      const { userId, title, date, time, description } = meetingData;
      
      // Get user details
      const user = await UsersModel.findById(userId);
      if (!user) {
        console.error('User not found for notification:', userId);
        return;
      }

      const actionText = action === 'created' ? 'scheduled' : 
                        action === 'updated' ? 'updated' : 
                        action === 'deleted' ? 'cancelled' : 'modified';

      const notification = new NotificationModel({
        recipientIds: [userId],
        type: 'meeting_schedule',
        title: `Meeting ${actionText}`,
        message: `Your meeting "${title}" has been ${actionText} for ${date} at ${time}.`,
        relatedId: meetingData._id,
        relatedModel: 'MeetingScheduleModel',
        data: {
          meetingTitle: title,
          date: date,
          time: time,
          description: description,
          action: action
        },
        priority: action === 'deleted' ? 'high' : 'medium',
        createdByUserId: meetingData.createdByUserId || meetingData.scheduledByUserId,
        updatedByUserId: meetingData.updatedByUserId || meetingData.scheduledByUserId,
        published: true
      });

      await notification.save();
      console.log(`Meeting notification created for user: ${userId}`);
      return notification;
    } catch (error) {
      console.error('Error creating meeting notification:', error);
    }
  }

  // Create lead assignment notification
  static async createLeadAssignmentNotification(leadData) {
    try {
      const { assignedTo, customerName, propertyName, leadId } = leadData;
      
      // Get assigned user details
      const assignedUser = await UsersModel.findById(assignedTo);
      if (!assignedUser) {
        console.error('Assigned user not found for notification:', assignedTo);
        return;
      }

      const notification = new NotificationModel({
        recipientIds: [assignedTo],
        type: 'lead_assignment',
        title: 'New Lead Assigned',
        message: `You have been assigned a new lead for ${customerName} regarding ${propertyName}.`,
        relatedId: leadId,
        relatedModel: 'LeadsModel',
        data: {
          customerName: customerName,
          propertyName: propertyName,
          leadId: leadId
        },
        priority: 'high',
        createdByUserId: leadData.createdByUserId,
        updatedByUserId: leadData.updatedByUserId,
        published: true
      });

      await notification.save();
      console.log(`Lead assignment notification created for user: ${assignedTo}`);
      return notification;
    } catch (error) {
      console.error('Error creating lead assignment notification:', error);
    }
  }

  // Create contact us notification for admins
  static async createContactUsNotification(contactData) {
    try {
      // Get all admin users
      const adminUsers = await UsersModel.find({ role: 'admin' });
      
      if (adminUsers.length === 0) {
        console.error('No admin users found for contact us notification');
        return;
      }

      const { name, email, subject, message, contactId } = contactData;

      // Create notification for each admin
      const notifications = [];
      for (const admin of adminUsers) {
        const notification = new NotificationModel({
          recipientIds: [admin._id],
          type: 'contact_us',
          title: 'New Contact Form Submission',
          message: `New contact form submission from ${name} (${email}): ${subject}`,
          relatedId: contactId,
          relatedModel: 'ContactUsModel',
          data: {
            customerName: name,
            customerEmail: email,
            subject: subject,
            message: message,
            contactId: contactId
          },
          priority: 'medium',
          createdByUserId: contactData.createdByUserId || contactData._id,
          updatedByUserId: contactData.updatedByUserId || contactData._id,
          published: true
        });

        await notification.save();
        notifications.push(notification);
        console.log(`Contact us notification created for admin: ${admin._id}`);
      }

      return notifications;
    } catch (error) {
      console.error('Error creating contact us notification:', error);
    }
  }

  // Create general notification
  static async createGeneralNotification(recipientId, title, message, data = {}) {
    try {
      const notification = new NotificationModel({
        recipientIds: [recipientId],
        type: 'general',
        title: title,
        message: message,
        data: data,
        priority: 'medium',
        createdByUserId: data.createdByUserId || recipientId,
        updatedByUserId: data.updatedByUserId || recipientId,
        published: true
      });

      await notification.save();
      console.log(`General notification created for user: ${recipientId}`);
      return notification;
    } catch (error) {
      console.error('Error creating general notification:', error);
    }
  }

  // Get notifications for user with pagination
  static async getUserNotifications(userId, page = 1, limit = 20, unreadOnly = false) {
    try {
      const query = { recipientIds: userId };
      if (unreadOnly) {
        query.isRead = false;
      }

      const notifications = await NotificationModel.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit)
        .populate('recipientIds', 'firstName lastName email')
        .populate('relatedId', 'name email')
        .exec();

      const total = await NotificationModel.countDocuments(query);

      return {
        notifications,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      };
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

  // Get unread count for user
  static async getUnreadCount(userId) {
    try {
      const count = await NotificationModel.countDocuments({
        recipientIds: userId,
        isRead: false
      });
      return count;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId) {
    try {
      const notification = await NotificationModel.findByIdAndUpdate(
        notificationId,
        { isRead: true },
        { new: true }
      );
      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read for user
  static async markAllAsRead(userId) {
    try {
      const result = await NotificationModel.updateMany(
        { recipientIds: userId, isRead: false },
        { isRead: true }
      );
      return result.modifiedCount;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
}

export default NotificationService; 