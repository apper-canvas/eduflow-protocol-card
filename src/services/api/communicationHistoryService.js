import historyData from '@/services/mockData/communicationHistory.json';

let history = [...historyData];
let nextId = Math.max(...history.map(h => h.Id)) + 1;

export const communicationHistoryService = {
  // Get all communication history
  getAll: () => {
    return [...history].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  // Get history by type
  getByType: (type) => {
    return history.filter(h => h.type === type).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  // Get history by performer
  getByPerformer: (performerId) => {
    return history.filter(h => h.performedBy === performerId).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  // Get history by recipient
  getByRecipient: (recipient) => {
    return history.filter(h => h.recipient === recipient).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  // Get history by channel
  getByChannel: (channel) => {
    return history.filter(h => h.channel === channel).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  // Get history by date range
  getByDateRange: (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return history.filter(h => {
      const historyDate = new Date(h.timestamp);
      return historyDate >= start && historyDate <= end;
    }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  // Get history item by ID
  getById: (id) => {
    const historyId = parseInt(id);
    if (isNaN(historyId)) {
      throw new Error('Invalid history ID');
    }
    return history.find(h => h.Id === historyId);
  },

  // Add history entry
  create: (historyData) => {
    const newEntry = {
      Id: nextId++,
      type: historyData.type,
      action: historyData.action,
      title: historyData.title,
      description: historyData.description,
      performedBy: historyData.performedBy,
      performedByType: historyData.performedByType || 'user',
      timestamp: new Date().toISOString(),
      recipient: historyData.recipient,
      recipientType: historyData.recipientType,
      status: historyData.status || 'completed',
      channel: historyData.channel || 'internal'
    };

    history.push(newEntry);
    return newEntry;
  },

  // Search history
  search: (query) => {
    const searchTerm = query.toLowerCase();
    return history.filter(h => 
      h.title.toLowerCase().includes(searchTerm) ||
      h.description.toLowerCase().includes(searchTerm) ||
      h.performedBy.toLowerCase().includes(searchTerm) ||
      h.recipient.toLowerCase().includes(searchTerm)
    ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  // Get filtered history with pagination
  getFiltered: (filters = {}, page = 1, limit = 20) => {
    let filteredHistory = [...history];

    // Apply filters
    if (filters.type) {
      filteredHistory = filteredHistory.filter(h => h.type === filters.type);
    }
    if (filters.action) {
      filteredHistory = filteredHistory.filter(h => h.action === filters.action);
    }
    if (filters.performedBy) {
      filteredHistory = filteredHistory.filter(h => h.performedBy === filters.performedBy);
    }
    if (filters.recipient) {
      filteredHistory = filteredHistory.filter(h => h.recipient === filters.recipient);
    }
    if (filters.channel) {
      filteredHistory = filteredHistory.filter(h => h.channel === filters.channel);
    }
    if (filters.status) {
      filteredHistory = filteredHistory.filter(h => h.status === filters.status);
    }
    if (filters.dateFrom) {
      filteredHistory = filteredHistory.filter(h => new Date(h.timestamp) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      filteredHistory = filteredHistory.filter(h => new Date(h.timestamp) <= new Date(filters.dateTo));
    }
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredHistory = filteredHistory.filter(h => 
        h.title.toLowerCase().includes(searchTerm) ||
        h.description.toLowerCase().includes(searchTerm) ||
        h.performedBy.toLowerCase().includes(searchTerm) ||
        h.recipient.toLowerCase().includes(searchTerm)
      );
    }

    // Sort by timestamp (newest first)
    filteredHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Apply pagination
    const total = filteredHistory.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedHistory = filteredHistory.slice(startIndex, endIndex);

    return {
      data: paginatedHistory,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: endIndex < total,
        hasPrev: page > 1
      }
    };
  },

  // Get communication statistics
  getStats: (timeframe = 'month') => {
    const now = new Date();
    let startDate;

    switch (timeframe) {
      case 'day':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(0); // All time
    }

    const periodHistory = history.filter(h => new Date(h.timestamp) >= startDate);

    const stats = {
      total: periodHistory.length,
      byType: {},
      byChannel: {},
      byStatus: {},
      byPerformerType: {}
    };

    periodHistory.forEach(h => {
      // By type
      stats.byType[h.type] = (stats.byType[h.type] || 0) + 1;
      
      // By channel
      stats.byChannel[h.channel] = (stats.byChannel[h.channel] || 0) + 1;
      
      // By status
      stats.byStatus[h.status] = (stats.byStatus[h.status] || 0) + 1;
      
      // By performer type
      stats.byPerformerType[h.performedByType] = (stats.byPerformerType[h.performedByType] || 0) + 1;
    });

    return stats;
  },

  // Delete history entry
  delete: (id) => {
    const historyId = parseInt(id);
    if (isNaN(historyId)) {
      throw new Error('Invalid history ID');
    }

    const index = history.findIndex(h => h.Id === historyId);
    if (index === -1) {
      throw new Error('History entry not found');
    }

    history.splice(index, 1);
    return true;
  }
};

export default communicationHistoryService;