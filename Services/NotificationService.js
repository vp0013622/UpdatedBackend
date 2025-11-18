import { NotificationModel } from '../Models/NotificationModel.js';
import { UsersModel } from '../Models/UsersModel.js';
import { MeetingScheduleModel } from '../Models/MeetingScheduleModel.js';

class NotificationService {
  // Create meeting schedule notification (filtered by role)
  static async createMeetingNotification(meetingData, action = 'created') {
    try {
      const { RolesModel } = await import('../Models/RolesModel.js');
      const { _id, title, date, time, description, customerId, salesPersonId, executiveId, scheduledByUserId } = meetingData;
      
      const actionText = action === 'created' ? 'scheduled' : 
                        action === 'updated' ? 'updated' : 
                        action === 'deleted' ? 'cancelled' : 'modified';

      const notifications = [];

      // Get all admin users (they get all meeting notifications)
      const adminRole = await RolesModel.findOne({ 
        published: true,
        $or: [
          { name: { $regex: /^admin$/i } }
        ]
      });
      
      if (adminRole) {
        const adminUsers = await UsersModel.find({ 
          role: adminRole._id,
          published: true 
        });
        
        for (const admin of adminUsers) {
          const notification = new NotificationModel({
            recipientIds: [admin._id],
            type: 'meeting_schedule',
            title: `Meeting ${actionText}`,
            message: `A meeting "${title}" has been ${actionText} for ${date} at ${time}.`,
            relatedId: _id,
            relatedModel: 'MeetingScheduleModel',
            data: {
              meetingTitle: title,
              date: date,
              time: time,
              description: description,
              action: action
            },
            priority: action === 'deleted' ? 'high' : 'medium',
            createdByUserId: meetingData.createdByUserId || scheduledByUserId || admin._id,
            updatedByUserId: meetingData.updatedByUserId || scheduledByUserId || admin._id,
            published: true
          });
          await notification.save();
          notifications.push(notification);
        }
      }

      // Get executive and sales roles
      const executiveRole = await RolesModel.findOne({ 
        published: true,
        $or: [
          { name: { $regex: /^executive$/i } }
        ]
      });
      
      const salesRole = await RolesModel.findOne({ 
        published: true,
        $or: [
          { name: { $regex: /^sales$/i } }
        ]
      });

      // Notify customer
      if (customerId) {
        const customer = await UsersModel.findById(customerId);
        if (customer) {
          const notification = new NotificationModel({
            recipientIds: [customerId],
            type: 'meeting_schedule',
            title: `Meeting ${actionText}`,
            message: `Your meeting "${title}" has been ${actionText} for ${date} at ${time}.`,
            relatedId: _id,
            relatedModel: 'MeetingScheduleModel',
            data: {
              meetingTitle: title,
              date: date,
              time: time,
              description: description,
              action: action
            },
            priority: action === 'deleted' ? 'high' : 'medium',
            createdByUserId: meetingData.createdByUserId || scheduledByUserId || customerId,
            updatedByUserId: meetingData.updatedByUserId || scheduledByUserId || customerId,
            published: true
          });
          await notification.save();
          notifications.push(notification);
        }
      }

      // Notify assigned sales person (if exists and is executive/sales role)
      if (salesPersonId) {
        const salesPerson = await UsersModel.findById(salesPersonId);
        if (salesPerson && (salesPerson.role?.toString() === executiveRole?._id?.toString() || salesPerson.role?.toString() === salesRole?._id?.toString())) {
          const notification = new NotificationModel({
            recipientIds: [salesPersonId],
            type: 'meeting_schedule',
            title: `Meeting ${actionText}`,
            message: `A meeting "${title}" has been ${actionText} for ${date} at ${time}.`,
            relatedId: _id,
            relatedModel: 'MeetingScheduleModel',
            data: {
              meetingTitle: title,
              date: date,
              time: time,
              description: description,
              action: action
            },
            priority: action === 'deleted' ? 'high' : 'medium',
            createdByUserId: meetingData.createdByUserId || scheduledByUserId || salesPersonId,
            updatedByUserId: meetingData.updatedByUserId || scheduledByUserId || salesPersonId,
            published: true
          });
          await notification.save();
          notifications.push(notification);
        }
      }

      // Notify assigned executive (if exists and is executive/sales role)
      if (executiveId) {
        const executive = await UsersModel.findById(executiveId);
        if (executive && (executive.role?.toString() === executiveRole?._id?.toString() || executive.role?.toString() === salesRole?._id?.toString())) {
          const notification = new NotificationModel({
            recipientIds: [executiveId],
            type: 'meeting_schedule',
            title: `Meeting ${actionText}`,
            message: `A meeting "${title}" has been ${actionText} for ${date} at ${time}.`,
            relatedId: _id,
            relatedModel: 'MeetingScheduleModel',
            data: {
              meetingTitle: title,
              date: date,
              time: time,
              description: description,
              action: action
            },
            priority: action === 'deleted' ? 'high' : 'medium',
            createdByUserId: meetingData.createdByUserId || scheduledByUserId || executiveId,
            updatedByUserId: meetingData.updatedByUserId || scheduledByUserId || executiveId,
            published: true
          });
          await notification.save();
          notifications.push(notification);
        }
      }

      return notifications.length === 1 ? notifications[0] : notifications;
    } catch (error) {
      console.error('Error creating meeting notification:', error);
      throw error;
    }
  }

  // Create lead assignment notification
  static async createLeadAssignmentNotification(leadData) {
    try {
      const { assignedTo, customerName, propertyName, leadId } = leadData;
      
      // Get assigned user details
      const assignedUser = await UsersModel.findById(assignedTo);
      if (!assignedUser) {
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
      return notification;
    } catch (error) {
      console.error('Error creating lead assignment notification:', error);
    }
  }

  // Create lead created notification for all roles except user
  static async createLeadCreatedNotification(leadData) {
    try {
      const { RolesModel } = await import('../Models/RolesModel.js');
      
      // Get USER role to exclude it
      const userRole = await RolesModel.findOne({ 
        published: true,
        $or: [
          { name: { $regex: /^user$/i } }
        ]
      });

      // Get all roles except USER
      const roleQuery = { published: true };
      if (userRole) {
        roleQuery._id = { $ne: userRole._id };
      }

      const roles = await RolesModel.find(roleQuery);

      if (roles.length === 0) {
        return [];
      }

      // Get all users with these roles (except USER role)
      const roleIds = roles.map(role => role._id);
      const users = await UsersModel.find({ 
        role: { $in: roleIds },
        published: true
      });

      if (users.length === 0) {
        return [];
      }

      const notifications = [];
      const customerName = leadData.userId?.firstName && leadData.userId?.lastName 
        ? `${leadData.userId.firstName} ${leadData.userId.lastName}`
        : leadData.leadAltEmail || 'New Customer';
      const propertyName = leadData.leadInterestedPropertyId?.name || 'Property Inquiry';

      for (const user of users) {
        const notification = new NotificationModel({
          recipientIds: [user._id],
          type: 'lead_created',
          title: 'New Lead Created',
          message: `A new lead has been created for ${customerName} regarding ${propertyName}.`,
          relatedId: leadData._id || leadData.leadId,
          relatedModel: 'LeadsModel',
          data: {
            customerName: customerName,
            propertyName: propertyName,
            leadId: leadData._id || leadData.leadId
          },
          priority: 'high',
          createdByUserId: leadData.createdByUserId || user._id,
          updatedByUserId: leadData.updatedByUserId || user._id,
          published: true
        });

        await notification.save();
        notifications.push(notification);
      }

      return notifications;
    } catch (error) {
      console.error('Error creating lead created notification:', error);
      return [];
    }
  }

  // Create contact us notification for admins
  static async createContactUsNotification(contactData) {
    try {
      // Get all admin users
      const adminUsers = await UsersModel.find({ role: 'admin' });
      
      if (adminUsers.length === 0) {
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
        // Contact us notification created for admin
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
      return notification;
    } catch (error) {
      // Error creating general notification
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
      throw error;
    }
  }

  // Create meeting reminder notifications for today's meetings (filtered by role)
  static async createMeetingReminderNotifications() {
    try {
      const { RolesModel } = await import('../Models/RolesModel.js');
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1); // Start of tomorrow

      // Find all meetings scheduled for today
      const todaysMeetings = await MeetingScheduleModel.find({
        meetingDate: {
          $gte: today,
          $lt: tomorrow
        },
        published: true
      }).populate('scheduledByUserId', '_id firstName lastName email role')
        .populate('customerId', '_id firstName lastName email')
        .populate('salesPersonId', '_id firstName lastName email role')
        .populate('executiveId', '_id firstName lastName email role');

      const createdNotifications = [];

      // Get roles
      const adminRole = await RolesModel.findOne({ 
        published: true,
        $or: [
          { name: { $regex: /^admin$/i } }
        ]
      });
      
      const executiveRole = await RolesModel.findOne({ 
        published: true,
        $or: [
          { name: { $regex: /^executive$/i } }
        ]
      });
      
      const salesRole = await RolesModel.findOne({ 
        published: true,
        $or: [
          { name: { $regex: /^sales$/i } }
        ]
      });

      for (const meeting of todaysMeetings) {
        const recipients = [];

        // Add all admin users (they get all meeting reminders)
        if (adminRole) {
          const adminUsers = await UsersModel.find({ 
            role: adminRole._id,
            published: true 
          });
          adminUsers.forEach(admin => {
            if (!recipients.includes(admin._id.toString())) {
              recipients.push(admin._id.toString());
            }
          });
        }

        // Add customer
        if (meeting.customerId && !recipients.includes(meeting.customerId._id.toString())) {
          recipients.push(meeting.customerId._id.toString());
        }

        // Add assigned sales person (if executive/sales role)
        if (meeting.salesPersonId) {
          const salesPerson = await UsersModel.findById(meeting.salesPersonId._id || meeting.salesPersonId);
          if (salesPerson && (salesPerson.role?.toString() === executiveRole?._id?.toString() || salesPerson.role?.toString() === salesRole?._id?.toString())) {
            if (!recipients.includes(salesPerson._id.toString())) {
              recipients.push(salesPerson._id.toString());
            }
          }
        }

        // Add assigned executive (if executive/sales role)
        if (meeting.executiveId) {
          const executive = await UsersModel.findById(meeting.executiveId._id || meeting.executiveId);
          if (executive && (executive.role?.toString() === executiveRole?._id?.toString() || executive.role?.toString() === salesRole?._id?.toString())) {
            if (!recipients.includes(executive._id.toString())) {
              recipients.push(executive._id.toString());
            }
          }
        }

        // Create reminder notification for each recipient
        for (const recipientId of recipients) {
          // Check if reminder notification already exists for this meeting and recipient
          const existingReminder = await NotificationModel.findOne({
            recipientIds: recipientId,
            type: 'meeting_reminder',
            'data.meetingId': meeting._id.toString(),
            'data.reminderDate': today.toISOString().split('T')[0] // Today's date as string
          });

          if (!existingReminder) {
            // Get system user for createdByUserId/updatedByUserId
            let systemUser = null;
            if (adminRole) {
              systemUser = await UsersModel.findOne({ 
                role: adminRole._id,
                published: true 
              }).sort({ createdAt: 1 });
            }
            if (!systemUser) {
              systemUser = await UsersModel.findOne({ published: true }).sort({ createdAt: 1 });
            }

            const notification = new NotificationModel({
              recipientIds: [recipientId],
              type: 'meeting_reminder',
              title: 'Meeting Reminder',
              message: `Reminder: You have a meeting "${meeting.title}" scheduled for today at ${meeting.startTime}${meeting.endTime ? ` - ${meeting.endTime}` : ''}.`,
              relatedId: meeting._id,
              relatedModel: 'MeetingScheduleModel',
              data: {
                meetingId: meeting._id.toString(),
                meetingTitle: meeting.title,
                date: meeting.meetingDate,
                time: `${meeting.startTime}${meeting.endTime ? ` - ${meeting.endTime}` : ''}`,
                description: meeting.description,
                reminderDate: today.toISOString().split('T')[0],
                action: 'reminder'
              },
              priority: 'high',
              createdByUserId: systemUser?._id || recipientId,
              updatedByUserId: systemUser?._id || recipientId,
              published: true
            });

            await notification.save();
            createdNotifications.push(notification);
          }
        }
      }

      return createdNotifications;
    } catch (error) {
      console.error('Error creating meeting reminder notifications:', error);
      throw error;
    }
  }
}

export default NotificationService; 