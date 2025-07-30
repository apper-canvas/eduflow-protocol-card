import notificationsData from '@/services/mockData/notifications.json';

let notifications = [...notificationsData];
let nextId = Math.max(...notifications.map(n => n.Id)) + 1;

export const notificationService = {
  // Get all notifications
  getAll: () => {
    return [...notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  // Get unread notifications
  getUnread: (recipientId = null) => {
    let unread = notifications.filter(n => !n.isRead);
    if (recipientId) {
      unread = unread.filter(n => n.recipientId === recipientId);
    }
    return unread.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  // Get notifications by type
  getByType: (type) => {
    return notifications.filter(n => n.type === type);
  },

  // Get notifications by priority
  getByPriority: (priority) => {
    return notifications.filter(n => n.priority === priority);
  },

  // Get notifications by recipient
  getByRecipient: (recipientId) => {
    return notifications.filter(n => n.recipientId === recipientId);
  },

  // Get notification by ID
  getById: (id) => {
    const notificationId = parseInt(id);
    if (isNaN(notificationId)) {
      throw new Error('Invalid notification ID');
    }
    return notifications.find(n => n.Id === notificationId);
  },

  // Create notification
  create: (notificationData) => {
    const newNotification = {
      Id: nextId++,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type || 'general',
      priority: notificationData.priority || 'medium',
      recipientId: notificationData.recipientId,
      recipientName: notificationData.recipientName,
      recipientType: notificationData.recipientType || 'user',
      createdAt: new Date().toISOString(),
      readAt: null,
      isRead: false,
      actionRequired: notificationData.actionRequired || false,
      actionUrl: notificationData.actionUrl || null
    };

    notifications.push(newNotification);
    return newNotification;
  },

  // Mark notification as read
  markAsRead: (id) => {
    const notificationId = parseInt(id);
    if (isNaN(notificationId)) {
      throw new Error('Invalid notification ID');
    }

    const notification = notifications.find(n => n.Id === notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.isRead = true;
    notification.readAt = new Date().toISOString();
    return notification;
  },

  // Mark multiple notifications as read
  markMultipleAsRead: (ids) => {
    const notificationIds = ids.map(id => parseInt(id)).filter(id => !isNaN(id));
    const updatedNotifications = [];

    notificationIds.forEach(id => {
      const notification = notifications.find(n => n.Id === id);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        notification.readAt = new Date().toISOString();
        updatedNotifications.push(notification);
      }
    });

    return updatedNotifications;
  },

  // Mark all notifications as read for a recipient
  markAllAsRead: (recipientId = null) => {
    let targetNotifications = notifications.filter(n => !n.isRead);
    
    if (recipientId) {
      targetNotifications = targetNotifications.filter(n => n.recipientId === recipientId);
    }

    targetNotifications.forEach(notification => {
      notification.isRead = true;
      notification.readAt = new Date().toISOString();
    });

    return targetNotifications;
  },

  // Delete notification
  delete: (id) => {
    const notificationId = parseInt(id);
    if (isNaN(notificationId)) {
      throw new Error('Invalid notification ID');
    }

    const index = notifications.findIndex(n => n.Id === notificationId);
    if (index === -1) {
      throw new Error('Notification not found');
    }

    notifications.splice(index, 1);
    return true;
  },

  // Delete multiple notifications
  deleteMultiple: (ids) => {
    const notificationIds = ids.map(id => parseInt(id)).filter(id => !isNaN(id));
    let deletedCount = 0;

    notificationIds.forEach(id => {
      const index = notifications.findIndex(n => n.Id === id);
      if (index !== -1) {
        notifications.splice(index, 1);
        deletedCount++;
      }
    });

    return deletedCount;
  },

  // Get notification statistics
  getStats: (recipientId = null) => {
    let targetNotifications = notifications;
    
    if (recipientId) {
      targetNotifications = targetNotifications.filter(n => n.recipientId === recipientId);
    }

    const total = targetNotifications.length;
    const unread = targetNotifications.filter(n => !n.isRead).length;
    const highPriority = targetNotifications.filter(n => n.priority === 'high').length;
    const actionRequired = targetNotifications.filter(n => n.actionRequired && !n.isRead).length;

    const byType = targetNotifications.reduce((acc, notification) => {
      acc[notification.type] = (acc[notification.type] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      unread,
      highPriority,
      actionRequired,
      byType
    };
  },

  // Send bulk notifications
  sendBulk: (notificationData, recipients) => {
    const createdNotifications = [];

    recipients.forEach(recipient => {
      const notification = {
        ...notificationData,
        recipientId: recipient.id,
        recipientName: recipient.name,
        recipientType: recipient.type
      };
      
      const createdNotification = notificationService.create(notification);
      createdNotifications.push(createdNotification);
    });

    return createdNotifications;
  }
};

export default notificationService;