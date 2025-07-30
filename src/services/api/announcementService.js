import announcementsData from '@/services/mockData/announcements.json';

let announcements = [...announcementsData];
let nextId = Math.max(...announcements.map(a => a.Id)) + 1;

export const announcementService = {
  // Get all announcements
  getAll: () => {
    return [...announcements].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  // Get published announcements
  getPublished: () => {
    return announcements
      .filter(a => a.status === 'published' && new Date(a.expiresAt) > new Date())
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  },

  // Get announcements by priority
  getByPriority: (priority) => {
    return announcements.filter(a => a.priority === priority && a.status === 'published');
  },

  // Get announcements by target audience
  getByAudience: (audience) => {
    return announcements.filter(a => a.targetAudience === audience || a.targetAudience === 'all');
  },

  // Get announcement by ID
  getById: (id) => {
    const announcementId = parseInt(id);
    if (isNaN(announcementId)) {
      throw new Error('Invalid announcement ID');
    }
    return announcements.find(a => a.Id === announcementId);
  },

  // Create announcement
  create: (announcementData) => {
    const newAnnouncement = {
      Id: nextId++,
      title: announcementData.title,
      content: announcementData.content,
      priority: announcementData.priority || 'medium',
      targetAudience: announcementData.targetAudience || 'all',
      createdBy: announcementData.createdBy || 'Admin',
      createdAt: new Date().toISOString(),
      publishedAt: announcementData.publishNow ? new Date().toISOString() : null,
      expiresAt: announcementData.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days default
      status: announcementData.publishNow ? 'published' : 'draft',
      readBy: 0,
      totalRecipients: announcementData.totalRecipients || 0,
      attachments: announcementData.attachments || []
    };

    announcements.push(newAnnouncement);
    return newAnnouncement;
  },

  // Update announcement
  update: (id, updates) => {
    const announcementId = parseInt(id);
    if (isNaN(announcementId)) {
      throw new Error('Invalid announcement ID');
    }

    const index = announcements.findIndex(a => a.Id === announcementId);
    if (index === -1) {
      throw new Error('Announcement not found');
    }

    announcements[index] = {
      ...announcements[index],
      ...updates,
      Id: announcementId // Preserve ID
    };

    return announcements[index];
  },

  // Publish announcement
  publish: (id) => {
    const announcement = announcementService.getById(id);
    if (!announcement) {
      throw new Error('Announcement not found');
    }

    announcement.status = 'published';
    announcement.publishedAt = new Date().toISOString();
    
    return announcement;
  },

  // Archive announcement
  archive: (id) => {
    const announcement = announcementService.getById(id);
    if (!announcement) {
      throw new Error('Announcement not found');
    }

    announcement.status = 'archived';
    return announcement;
  },

  // Delete announcement
  delete: (id) => {
    const announcementId = parseInt(id);
    if (isNaN(announcementId)) {
      throw new Error('Invalid announcement ID');
    }

    const index = announcements.findIndex(a => a.Id === announcementId);
    if (index === -1) {
      throw new Error('Announcement not found');
    }

    announcements.splice(index, 1);
    return true;
  },

  // Mark as read by user
  markAsRead: (id, userId) => {
    const announcement = announcementService.getById(id);
    if (!announcement) {
      throw new Error('Announcement not found');
    }

    // In a real app, this would track individual user reads
    announcement.readBy += 1;
    return announcement;
  },

  // Get announcement statistics
  getStats: () => {
    const total = announcements.length;
    const published = announcements.filter(a => a.status === 'published').length;
    const drafts = announcements.filter(a => a.status === 'draft').length;
    const archived = announcements.filter(a => a.status === 'archived').length;
    const highPriority = announcements.filter(a => a.priority === 'high').length;

    return {
      total,
      published,
      drafts,
      archived,
      highPriority
    };
  }
};

export default announcementService;