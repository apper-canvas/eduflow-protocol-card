import messagesData from '@/services/mockData/messages.json';
import conversationsData from '@/services/mockData/conversations.json';
import templatesData from '@/services/mockData/messageTemplates.json';

let messages = [...messagesData];
let conversations = [...conversationsData];
let templates = [...templatesData];
let nextMessageId = Math.max(...messages.map(m => m.Id)) + 1;
let nextConversationId = Math.max(...conversations.map(c => c.Id)) + 1;

// Message operations
export const messageService = {
  // Get all messages
  getAll: () => {
    return [...messages];
  },

  // Get messages by conversation
  getByConversation: (conversationId) => {
    return messages.filter(m => m.conversationId === parseInt(conversationId));
  },

  // Get message by ID
  getById: (id) => {
    const messageId = parseInt(id);
    if (isNaN(messageId)) {
      throw new Error('Invalid message ID');
    }
    return messages.find(m => m.Id === messageId);
  },

  // Send message
  create: (messageData) => {
    const newMessage = {
      Id: nextMessageId++,
      conversationId: messageData.conversationId || nextConversationId,
      senderId: messageData.senderId,
      senderName: messageData.senderName,
      senderType: messageData.senderType,
      recipientId: messageData.recipientId,
      recipientName: messageData.recipientName,
      recipientType: messageData.recipientType,
      subject: messageData.subject,
      content: messageData.content,
      timestamp: new Date().toISOString(),
      status: 'sent',
      hasAttachment: messageData.attachments?.length > 0 || false,
      attachments: messageData.attachments || [],
      isTemplate: messageData.isTemplate || false
    };

    messages.push(newMessage);

    // Update or create conversation
    let conversation = conversations.find(c => c.Id === newMessage.conversationId);
    if (!conversation) {
      conversation = {
        Id: nextConversationId++,
        participants: [
          {
            id: newMessage.senderId,
            name: newMessage.senderName,
            type: newMessage.senderType,
            avatar: null
          },
          {
            id: newMessage.recipientId,
            name: newMessage.recipientName,
            type: newMessage.recipientType,
            avatar: null
          }
        ],
        lastMessage: newMessage.content.substring(0, 50) + (newMessage.content.length > 50 ? '...' : ''),
        lastMessageTime: newMessage.timestamp,
        unreadCount: 1,
        status: 'active'
      };
      conversations.push(conversation);
    } else {
      conversation.lastMessage = newMessage.content.substring(0, 50) + (newMessage.content.length > 50 ? '...' : '');
      conversation.lastMessageTime = newMessage.timestamp;
      conversation.unreadCount += 1;
    }

    return newMessage;
  },

  // Update message status
  updateStatus: (id, status) => {
    const messageId = parseInt(id);
    if (isNaN(messageId)) {
      throw new Error('Invalid message ID');
    }

    const message = messages.find(m => m.Id === messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    message.status = status;
    return message;
  },

  // Delete message
  delete: (id) => {
    const messageId = parseInt(id);
    if (isNaN(messageId)) {
      throw new Error('Invalid message ID');
    }

    const index = messages.findIndex(m => m.Id === messageId);
    if (index === -1) {
      throw new Error('Message not found');
    }

    messages.splice(index, 1);
    return true;
  }
};

// Conversation operations
export const conversationService = {
  // Get all conversations
  getAll: () => {
    return [...conversations].sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
  },

  // Get conversation by ID
  getById: (id) => {
    const conversationId = parseInt(id);
    if (isNaN(conversationId)) {
      throw new Error('Invalid conversation ID');
    }
    return conversations.find(c => c.Id === conversationId);
  },

  // Create new conversation
  create: (participants) => {
    const newConversation = {
      Id: nextConversationId++,
      participants: participants,
      lastMessage: '',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0,
      status: 'active'
    };

    conversations.push(newConversation);
    return newConversation;
  },

  // Mark conversation as read
  markAsRead: (id) => {
    const conversationId = parseInt(id);
    if (isNaN(conversationId)) {
      throw new Error('Invalid conversation ID');
    }

    const conversation = conversations.find(c => c.Id === conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    conversation.unreadCount = 0;
    
    // Mark all messages in conversation as read
    messages
      .filter(m => m.conversationId === conversationId)
      .forEach(m => m.status = 'read');

    return conversation;
  }
};

// Template operations
export const templateService = {
  // Get all templates
  getAll: () => {
    return [...templates].filter(t => t.isActive);
  },

  // Get templates by category
  getByCategory: (category) => {
    return templates.filter(t => t.category === category && t.isActive);
  },

  // Get template by ID
  getById: (id) => {
    const templateId = parseInt(id);
    if (isNaN(templateId)) {
      throw new Error('Invalid template ID');
    }
    return templates.find(t => t.Id === templateId);
  },

  // Process template with variables
  processTemplate: (templateId, variables) => {
    const template = templateService.getById(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    let processedSubject = template.subject;
    let processedContent = template.content;

    // Replace variables in subject and content
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `[${key}]`;
      processedSubject = processedSubject.replace(new RegExp(placeholder, 'g'), value);
      processedContent = processedContent.replace(new RegExp(placeholder, 'g'), value);
    });

    return {
      subject: processedSubject,
      content: processedContent
    };
  }
};

export default messageService;