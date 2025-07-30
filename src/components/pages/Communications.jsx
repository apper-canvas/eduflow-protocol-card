import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import { messageService, conversationService, templateService } from '@/services/api/messageService';
import announcementService from '@/services/api/announcementService';
import notificationService from '@/services/api/notificationService';
import communicationHistoryService from '@/services/api/communicationHistoryService';
import { parentService } from '@/services/api/parentService';

const Communications = () => {
  const [activeTab, setActiveTab] = useState('messages');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Common data
  const [parents, setParents] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const parentsData = await parentService.getAll();
      setParents(parentsData);
      setError(null);
    } catch (err) {
      setError('Failed to load communications data');
      toast.error('Failed to load communications data');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'messages', label: 'Messages', icon: 'MessageSquare' },
    { id: 'announcements', label: 'Announcements', icon: 'Megaphone' },
    { id: 'notifications', label: 'Notifications', icon: 'Bell' },
    { id: 'history', label: 'Communication History', icon: 'History' }
  ];

  if (loading) {
    return <Loading message="Loading communications..." />;
  }

  if (error) {
    return <Error message={error} onRetry={loadInitialData} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Communications Hub</h1>
          <p className="text-gray-600 mt-1">
            Manage all school communications in one place
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ApperIcon name={tab.icon} size={18} className="mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'messages' && <MessagesTab parents={parents} />}
        {activeTab === 'announcements' && <AnnouncementsTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
        {activeTab === 'history' && <CommunicationHistoryTab />}
      </div>
    </div>
  );
};

// Messages Tab Component
const MessagesTab = ({ parents }) => {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newMessageModal, setNewMessageModal] = useState(false);
  const [templateModal, setTemplateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadMessagesData();
  }, []);

  const loadMessagesData = async () => {
    try {
      setLoading(true);
      const [conversationsData, templatesData] = await Promise.all([
        conversationService.getAll(),
        templateService.getAll()
      ]);
      
      setConversations(conversationsData);
      setTemplates(templatesData);
      
      if (conversationsData.length > 0) {
        setSelectedConversation(conversationsData[0]);
        const messagesData = messageService.getByConversation(conversationsData[0].Id);
        setMessages(messagesData);
      }
    } catch (err) {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    const conversationMessages = messageService.getByConversation(conversation.Id);
    setMessages(conversationMessages);
    
    // Mark conversation as read
    conversationService.markAsRead(conversation.Id);
    
    // Update conversations list
    const updatedConversations = conversations.map(c => 
      c.Id === conversation.Id ? { ...c, unreadCount: 0 } : c
    );
    setConversations(updatedConversations);
  };

  const handleSendMessage = async (messageData) => {
    try {
      const newMessage = messageService.create({
        ...messageData,
        conversationId: selectedConversation?.Id
      });

      // Add to communication history
      communicationHistoryService.create({
        type: 'message',
        action: 'sent',
        title: messageData.subject,
        description: `Message sent to ${messageData.recipientName}`,
        performedBy: messageData.senderName,
        performedByType: messageData.senderType,
        recipient: messageData.recipientName,
        recipientType: messageData.recipientType,
        status: 'delivered',
        channel: 'internal'
      });

      // Refresh data
      await loadMessagesData();
      
      toast.success('Message sent successfully');
      setNewMessageModal(false);
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participants.some(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading) {
    return <Loading message="Loading messages..." />;
  }

  return (
    <div className="grid grid-cols-12 gap-6 h-[calc(100vh-300px)]">
      {/* Conversations List - 35% */}
      <div className="col-span-12 lg:col-span-4 space-y-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Conversations</h3>
            <Button
              onClick={() => setNewMessageModal(true)}
              size="sm"
              className="flex items-center gap-2"
            >
              <ApperIcon name="Plus" size={16} />
              New Message
            </Button>
          </div>

          <div className="mb-4">
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon="Search"
            />
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <Empty message="No conversations found" />
            ) : (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.Id}
                  onClick={() => handleConversationSelect(conversation)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                    selectedConversation?.Id === conversation.Id
                      ? 'bg-primary-50 border border-primary-200'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                        <ApperIcon 
                          name={conversation.participants[0]?.type === 'group' ? 'Users' : 'User'} 
                          size={16} 
                          className="text-white" 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {conversation.participants.find(p => p.name !== 'Current User')?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {conversation.lastMessage}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {new Date(conversation.lastMessageTime).toLocaleDateString()}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <span className="inline-block w-5 h-5 bg-red-500 text-white text-xs rounded-full text-center leading-5 mt-1">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Quick Templates */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Quick Templates</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTemplateModal(true)}
            >
              View All
            </Button>
          </div>
          <div className="space-y-2">
            {templates.slice(0, 3).map((template) => (
              <button
                key={template.Id}
                className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded transition-colors duration-200"
                onClick={() => {
                  // Open new message modal with template
                  setNewMessageModal(true);
                }}
              >
                {template.name}
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Message Thread - 65% */}
      <div className="col-span-12 lg:col-span-8">
        <Card className="h-full flex flex-col">
          {selectedConversation ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                      <ApperIcon 
                        name={selectedConversation.participants[0]?.type === 'group' ? 'Users' : 'User'} 
                        size={16} 
                        className="text-white" 
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {selectedConversation.participants.find(p => p.name !== 'Current User')?.name || 'Unknown'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {selectedConversation.participants.find(p => p.name !== 'Current User')?.type || 'user'}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Last active: {new Date(selectedConversation.lastMessageTime).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.length === 0 ? (
                  <Empty message="No messages in this conversation" />
                ) : (
                  messages.map((message) => (
                    <div key={message.Id} className="flex space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <ApperIcon name="User" size={14} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">{message.senderName}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(message.timestamp).toLocaleString()}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            message.status === 'read' 
                              ? 'bg-green-100 text-green-800'
                              : message.status === 'delivered'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {message.status}
                          </span>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          {message.subject && (
                            <div className="font-medium mb-2">{message.subject}</div>
                          )}
                          <p className="text-sm text-gray-700">{message.content}</p>
                          {message.hasAttachment && message.attachments.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {message.attachments.map((attachment, index) => (
                                <div key={index} className="flex items-center space-x-2 text-sm">
                                  <ApperIcon name="Paperclip" size={14} />
                                  <span>{attachment.name}</span>
                                  <span className="text-gray-500">({attachment.size})</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <MessageComposer
                  recipientId={selectedConversation.participants.find(p => p.name !== 'Current User')?.id}
                  recipientName={selectedConversation.participants.find(p => p.name !== 'Current User')?.name}
                  recipientType={selectedConversation.participants.find(p => p.name !== 'Current User')?.type}
                  onSend={handleSendMessage}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ApperIcon name="MessageSquare" size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* New Message Modal */}
      {newMessageModal && (
        <NewMessageModal
          parents={parents}
          templates={templates}
          onClose={() => setNewMessageModal(false)}
          onSend={handleSendMessage}
        />
      )}

      {/* Template Modal */}
      {templateModal && (
        <TemplateModal
          templates={templates}
          onClose={() => setTemplateModal(false)}
          onSelect={(template) => {
            setTemplateModal(false);
            setNewMessageModal(true);
          }}
        />
      )}
    </div>
  );
};

// Message Composer Component
const MessageComposer = ({ recipientId, recipientName, recipientType, onSend }) => {
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    onSend({
      recipientId,
      recipientName,
      recipientType,
      subject: subject || 'Quick Message',
      content: message,
      senderId: 1, // Current user
      senderName: 'Current User',
      senderType: 'teacher'
    });

    setMessage('');
    setSubject('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        placeholder="Subject (optional)"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
      <div className="flex space-x-2">
        <textarea
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          rows={3}
        />
        <div className="flex flex-col space-y-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="p-2"
            title="Attach file"
          >
            <ApperIcon name="Paperclip" size={16} />
          </Button>
          <Button
            type="submit"
            size="sm"
            className="p-2"
            disabled={!message.trim()}
          >
            <ApperIcon name="Send" size={16} />
          </Button>
        </div>
      </div>
    </form>
  );
};

// New Message Modal Component
const NewMessageModal = ({ parents, templates, onClose, onSend }) => {
  const [formData, setFormData] = useState({
    recipientType: 'parent',
    recipientId: '',
    recipientName: '',
    subject: '',
    content: '',
    attachments: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.recipientId || !formData.content.trim()) return;

    onSend({
      ...formData,
      senderId: 1,
      senderName: 'Current User',
      senderType: 'teacher'
    });
  };

  const recipientOptions = parents.map(parent => ({
    value: parent.Id,
    label: parent.name
  }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">New Message</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <ApperIcon name="X" size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Recipient Type"
                value={formData.recipientType}
                onChange={(e) => setFormData({ ...formData, recipientType: e.target.value })}
                options={[
                  { value: 'parent', label: 'Parent' },
                  { value: 'group', label: 'Group' }
                ]}
              />

              <Select
                label="Recipient"
                value={formData.recipientId}
                onChange={(e) => {
                  const selectedParent = parents.find(p => p.Id === parseInt(e.target.value));
                  setFormData({
                    ...formData,
                    recipientId: e.target.value,
                    recipientName: selectedParent?.name || ''
                  });
                }}
                options={recipientOptions}
              />
            </div>

            <Input
              label="Subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={6}
                required
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="flex space-x-2">
                <Button type="button" variant="outline" size="sm">
                  <ApperIcon name="Paperclip" size={16} className="mr-2" />
                  Attach File
                </Button>
                <Button type="button" variant="outline" size="sm">
                  <ApperIcon name="FileText" size={16} className="mr-2" />
                  Use Template
                </Button>
              </div>
              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  Send Message
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Template Modal Component
const TemplateModal = ({ templates, onClose, onSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', ...new Set(templates.map(t => t.category))];
  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Message Templates</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <ApperIcon name="X" size={24} />
            </button>
          </div>

          <div className="mb-4">
            <Select
              label="Category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              options={categories.map(cat => ({
                value: cat,
                label: cat.charAt(0).toUpperCase() + cat.slice(1)
              }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((template) => (
              <Card key={template.Id} className="p-4 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{template.name}</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {template.category}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{template.subject}</p>
                <p className="text-xs text-gray-500 mb-4 line-clamp-3">
                  {template.content}
                </p>
                <Button
                  size="sm"
                  onClick={() => onSelect(template)}
                  className="w-full"
                >
                  Use Template
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Announcements Tab Component
const AnnouncementsTab = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const data = announcementService.getAll();
      setAnnouncements(data);
    } catch (err) {
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (announcementData) => {
    try {
      const newAnnouncement = announcementService.create(announcementData);
      
      // Add to communication history
      communicationHistoryService.create({
        type: 'announcement',
        action: announcementData.publishNow ? 'published' : 'created',
        title: announcementData.title,
        description: `Announcement ${announcementData.publishNow ? 'published' : 'created'}: ${announcementData.title}`,
        performedBy: announcementData.createdBy || 'Current User',
        performedByType: 'admin',
        recipient: announcementData.targetAudience === 'all' ? 'All Users' : announcementData.targetAudience,
        recipientType: 'group',
        status: announcementData.publishNow ? 'published' : 'draft',
        channel: 'internal'
      });

      await loadAnnouncements();
      setShowForm(false);
      toast.success(`Announcement ${announcementData.publishNow ? 'published' : 'created'} successfully`);
    } catch (err) {
      toast.error('Failed to create announcement');
    }
  };

  const handlePublish = async (id) => {
    try {
      announcementService.publish(id);
      await loadAnnouncements();
      toast.success('Announcement published successfully');
    } catch (err) {
      toast.error('Failed to publish announcement');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;

    try {
      announcementService.delete(id);
      await loadAnnouncements();
      toast.success('Announcement deleted successfully');
    } catch (err) {
      toast.error('Failed to delete announcement');
    }
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'all' || announcement.priority === filterPriority;
    
    return matchesSearch && matchesPriority;
  });

  if (loading) {
    return <Loading message="Loading announcements..." />;
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <Input
            placeholder="Search announcements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon="Search"
            className="sm:max-w-xs"
          />
          <Select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            options={[
              { value: 'all', label: 'All Priorities' },
              { value: 'high', label: 'High Priority' },
              { value: 'medium', label: 'Medium Priority' },
              { value: 'low', label: 'Low Priority' }
            ]}
            className="sm:max-w-xs"
          />
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2"
        >
          <ApperIcon name="Plus" size={16} />
          New Announcement
        </Button>
      </div>

      {/* Announcements List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAnnouncements.length === 0 ? (
          <div className="col-span-full">
            <Empty message="No announcements found" />
          </div>
        ) : (
          filteredAnnouncements.map((announcement) => (
            <Card key={announcement.Id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    announcement.priority === 'high'
                      ? 'bg-red-100 text-red-800'
                      : announcement.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {announcement.priority}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    announcement.status === 'published'
                      ? 'bg-green-100 text-green-800'
                      : announcement.status === 'draft'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {announcement.status}
                  </span>
                </div>
                <div className="flex space-x-1">
                  {announcement.status === 'draft' && (
                    <button
                      onClick={() => handlePublish(announcement.Id)}
                      className="text-green-600 hover:text-green-800"
                      title="Publish"
                    >
                      <ApperIcon name="Send" size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedAnnouncement(announcement)}
                    className="text-blue-600 hover:text-blue-800"
                    title="View Details"
                  >
                    <ApperIcon name="Eye" size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(announcement.Id)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete"
                  >
                    <ApperIcon name="Trash2" size={16} />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-lg mb-2">{announcement.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {announcement.content}
              </p>

              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center justify-between">
                  <span>Target: {announcement.targetAudience}</span>
                  <span>By: {announcement.createdBy}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Created: {new Date(announcement.createdAt).toLocaleDateString()}</span>
                  {announcement.publishedAt && (
                    <span>Published: {new Date(announcement.publishedAt).toLocaleDateString()}</span>
                  )}
                </div>
                {announcement.status === 'published' && (
                  <div className="flex items-center justify-between">
                    <span>Read by: {announcement.readBy}/{announcement.totalRecipients}</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{
                          width: `${announcement.totalRecipients > 0 
                            ? (announcement.readBy / announcement.totalRecipients) * 100 
                            : 0}%`
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* New Announcement Form */}
      {showForm && (
        <AnnouncementForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Announcement Details Modal */}
      {selectedAnnouncement && (
        <AnnouncementDetailsModal
          announcement={selectedAnnouncement}
          onClose={() => setSelectedAnnouncement(null)}
        />
      )}
    </div>
  );
};

// Announcement Form Component
const AnnouncementForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'medium',
    targetAudience: 'all',
    publishNow: false,
    expiresAt: '',
    totalRecipients: 200
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      createdBy: 'Current User'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">New Announcement</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <ApperIcon name="X" size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={6}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                options={[
                  { value: 'low', label: 'Low Priority' },
                  { value: 'medium', label: 'Medium Priority' },
                  { value: 'high', label: 'High Priority' }
                ]}
              />

              <Select
                label="Target Audience"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                options={[
                  { value: 'all', label: 'All Users' },
                  { value: 'parents', label: 'Parents Only' },
                  { value: 'students', label: 'Students Only' },
                  { value: 'teachers', label: 'Teachers Only' }
                ]}
              />
            </div>

            <Input
              label="Expires At"
              type="date"
              value={formData.expiresAt}
              onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
            />

            <div className="flex items-center">
              <input
                type="checkbox"
                id="publishNow"
                checked={formData.publishNow}
                onChange={(e) => setFormData({ ...formData, publishNow: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="publishNow" className="ml-2 block text-sm text-gray-900">
                Publish immediately
              </label>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
                {formData.publishNow ? 'Publish' : 'Save Draft'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Announcement Details Modal Component
const AnnouncementDetailsModal = ({ announcement, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Announcement Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <ApperIcon name="X" size={24} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                announcement.priority === 'high'
                  ? 'bg-red-100 text-red-800'
                  : announcement.priority === 'medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {announcement.priority} priority
              </span>
              <span className={`px-2 py-1 text-xs rounded-full ${
                announcement.status === 'published'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {announcement.status}
              </span>
            </div>

            <h3 className="text-xl font-semibold mb-4">{announcement.title}</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Created by:</span> {announcement.createdBy}
              </div>
              <div>
                <span className="font-medium">Target audience:</span> {announcement.targetAudience}
              </div>
              <div>
                <span className="font-medium">Created:</span> {new Date(announcement.createdAt).toLocaleString()}
              </div>
              {announcement.publishedAt && (
                <div>
                  <span className="font-medium">Published:</span> {new Date(announcement.publishedAt).toLocaleString()}
                </div>
              )}
              <div>
                <span className="font-medium">Expires:</span> {new Date(announcement.expiresAt).toLocaleDateString()}
              </div>
              {announcement.status === 'published' && (
                <div>
                  <span className="font-medium">Read by:</span> {announcement.readBy} of {announcement.totalRecipients} recipients
                </div>
              )}
            </div>

            {announcement.attachments && announcement.attachments.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Attachments:</h4>
                <div className="space-y-2">
                  {announcement.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <ApperIcon name="Paperclip" size={14} />
                      <span>{attachment.name}</span>
                      <span className="text-gray-500">({attachment.size})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-6">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Notifications Tab Component
const NotificationsTab = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = notificationService.getAll();
      setNotifications(data);
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      notificationService.markAsRead(id);
      await loadNotifications();
      toast.success('Notification marked as read');
    } catch (err) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      notificationService.markAllAsRead();
      await loadNotifications();
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark notifications as read');
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedNotifications.length === 0) return;
    if (!window.confirm(`Delete ${selectedNotifications.length} selected notifications?`)) return;

    try {
      notificationService.deleteMultiple(selectedNotifications);
      setSelectedNotifications([]);
      await loadNotifications();
      toast.success('Selected notifications deleted');
    } catch (err) {
      toast.error('Failed to delete notifications');
    }
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.Id));
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'read' && notification.isRead) ||
                         (filterStatus === 'unread' && !notification.isRead);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return <Loading message="Loading notifications..." />;
  }

  const stats = notificationService.getStats();

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ApperIcon name="Bell" size={20} className="text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-2xl font-semibold">{stats.total}</p>
              <p className="text-sm text-gray-500">Total</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <ApperIcon name="AlertCircle" size={20} className="text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-2xl font-semibold">{stats.unread}</p>
              <p className="text-sm text-gray-500">Unread</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ApperIcon name="AlertTriangle" size={20} className="text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-2xl font-semibold">{stats.highPriority}</p>
              <p className="text-sm text-gray-500">High Priority</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <ApperIcon name="CheckCircle" size={20} className="text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-2xl font-semibold">{stats.actionRequired}</p>
              <p className="text-sm text-gray-500">Action Required</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <Input
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon="Search"
            className="sm:max-w-xs"
          />
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'reminder', label: 'Reminders' },
              { value: 'payment', label: 'Payments' },
              { value: 'academic', label: 'Academic' },
              { value: 'transport', label: 'Transport' },
              { value: 'health', label: 'Health' }
            ]}
            className="sm:max-w-xs"
          />
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'unread', label: 'Unread' },
              { value: 'read', label: 'Read' }
            ]}
            className="sm:max-w-xs"
          />
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2"
          >
            <ApperIcon name="CheckCircle" size={16} />
            Mark All as Read
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedNotifications.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {selectedNotifications.length} notification(s) selected
            </span>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => notificationService.markMultipleAsRead(selectedNotifications)}
              >
                Mark as Read
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteSelected}
                className="text-red-600 hover:text-red-800"
              >
                Delete Selected
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Notifications List */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
              onChange={handleSelectAll}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm font-medium">Select All</span>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredNotifications.length === 0 ? (
            <div className="p-8">
              <Empty message="No notifications found" />
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.Id}
                className={`p-4 hover:bg-gray-50 transition-colors duration-200 ${
                  !notification.isRead ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notification.Id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedNotifications([...selectedNotifications, notification.Id]);
                      } else {
                        setSelectedNotifications(selectedNotifications.filter(id => id !== notification.Id));
                      }
                    }}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
                  />

                  <div className={`p-2 rounded-lg ${
                    notification.type === 'payment' ? 'bg-green-100' :
                    notification.type === 'reminder' ? 'bg-yellow-100' :
                    notification.type === 'academic' ? 'bg-blue-100' :
                    notification.type === 'transport' ? 'bg-orange-100' :
                    notification.type === 'health' ? 'bg-purple-100' :
                    'bg-gray-100'
                  }`}>
                    <ApperIcon 
                      name={
                        notification.type === 'payment' ? 'CreditCard' :
                        notification.type === 'reminder' ? 'Clock' :
                        notification.type === 'academic' ? 'BookOpen' :
                        notification.type === 'transport' ? 'Bus' :
                        notification.type === 'health' ? 'Heart' :
                        'Bell'
                      } 
                      size={16} 
                      className={
                        notification.type === 'payment' ? 'text-green-600' :
                        notification.type === 'reminder' ? 'text-yellow-600' :
                        notification.type === 'academic' ? 'text-blue-600' :
                        notification.type === 'transport' ? 'text-orange-600' :
                        notification.type === 'health' ? 'text-purple-600' :
                        'text-gray-600'
                      }
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                        {notification.title}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          notification.priority === 'high'
                            ? 'bg-red-100 text-red-800'
                            : notification.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {notification.priority}
                        </span>
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                    </div>
                    <p className={`text-sm mt-1 ${!notification.isRead ? 'text-gray-700' : 'text-gray-500'}`}>
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center text-xs text-gray-500 space-x-4">
                        <span>To: {notification.recipientName}</span>
                        <span>{new Date(notification.createdAt).toLocaleString()}</span>
                        {notification.actionRequired && (
                          <span className="text-orange-600 font-medium">Action Required</span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification.Id)}
                            className="text-blue-600 hover:text-blue-800 text-xs"
                          >
                            Mark as Read
                          </button>
                        )}
                        {notification.actionUrl && (
                          <button className="text-primary-600 hover:text-primary-800 text-xs">
                            Take Action
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

// Communication History Tab Component
const CommunicationHistoryTab = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterChannel, setFilterChannel] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    loadHistory();
  }, [currentPage, searchTerm, filterType, filterChannel, filterStatus]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const filters = {
        search: searchTerm,
        type: filterType !== 'all' ? filterType : undefined,
        channel: filterChannel !== 'all' ? filterChannel : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined
      };

      const result = communicationHistoryService.getFiltered(filters, currentPage, 20);
      setHistory(result.data);
      setPagination(result.pagination);
    } catch (err) {
      toast.error('Failed to load communication history');
    } finally {
      setLoading(false);
    }
  };

  const stats = communicationHistoryService.getStats('month');

  if (loading && currentPage === 1) {
    return <Loading message="Loading communication history..." />;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ApperIcon name="Activity" size={20} className="text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-2xl font-semibold">{stats.total}</p>
              <p className="text-sm text-gray-500">Total Activities</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <ApperIcon name="MessageSquare" size={20} className="text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-2xl font-semibold">{stats.byType.message || 0}</p>
              <p className="text-sm text-gray-500">Messages</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ApperIcon name="Megaphone" size={20} className="text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-2xl font-semibold">{stats.byType.announcement || 0}</p>
              <p className="text-sm text-gray-500">Announcements</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ApperIcon name="Bell" size={20} className="text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-2xl font-semibold">{stats.byType.notification || 0}</p>
              <p className="text-sm text-gray-500">Notifications</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <Input
          placeholder="Search history..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon="Search"
          className="sm:max-w-xs"
        />
        <Select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          options={[
            { value: 'all', label: 'All Types' },
            { value: 'message', label: 'Messages' },
            { value: 'announcement', label: 'Announcements' },
            { value: 'notification', label: 'Notifications' },
            { value: 'sms', label: 'SMS' },
            { value: 'email', label: 'Email' }
          ]}
          className="sm:max-w-xs"
        />
        <Select
          value={filterChannel}
          onChange={(e) => setFilterChannel(e.target.value)}
          options={[
            { value: 'all', label: 'All Channels' },
            { value: 'internal', label: 'Internal' },
            { value: 'sms', label: 'SMS' },
            { value: 'email', label: 'Email' }
          ]}
          className="sm:max-w-xs"
        />
        <Select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          options={[
            { value: 'all', label: 'All Status' },
            { value: 'delivered', label: 'Delivered' },
            { value: 'pending', label: 'Pending' },
            { value: 'failed', label: 'Failed' }
          ]}
          className="sm:max-w-xs"
        />
      </div>

      {/* History List */}
      <Card className="overflow-hidden">
        <div className="divide-y divide-gray-200">
          {history.length === 0 ? (
            <div className="p-8">
              <Empty message="No communication history found" />
            </div>
          ) : (
            history.map((entry) => (
              <div key={entry.Id} className="p-4 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-lg ${
                    entry.type === 'message' ? 'bg-blue-100' :
                    entry.type === 'announcement' ? 'bg-purple-100' :
                    entry.type === 'notification' ? 'bg-orange-100' :
                    entry.type === 'sms' ? 'bg-green-100' :
                    entry.type === 'email' ? 'bg-yellow-100' :
                    'bg-gray-100'
                  }`}>
                    <ApperIcon 
                      name={
                        entry.type === 'message' ? 'MessageSquare' :
                        entry.type === 'announcement' ? 'Megaphone' :
                        entry.type === 'notification' ? 'Bell' :
                        entry.type === 'sms' ? 'Smartphone' :
                        entry.type === 'email' ? 'Mail' :
                        'Activity'
                      } 
                      size={16} 
                      className={
                        entry.type === 'message' ? 'text-blue-600' :
                        entry.type === 'announcement' ? 'text-purple-600' :
                        entry.type === 'notification' ? 'text-orange-600' :
                        entry.type === 'sms' ? 'text-green-600' :
                        entry.type === 'email' ? 'text-yellow-600' :
                        'text-gray-600'
                      }
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">
                        {entry.title}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          entry.status === 'delivered'
                            ? 'bg-green-100 text-green-800'
                            : entry.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : entry.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {entry.status}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          entry.channel === 'internal' ? 'bg-blue-100 text-blue-800' :
                          entry.channel === 'sms' ? 'bg-green-100 text-green-800' :
                          entry.channel === 'email' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {entry.channel}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {entry.description}
                    </p>
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>By: {entry.performedBy}</span>
                        <span>To: {entry.recipient}</span>
                        <span>{new Date(entry.timestamp).toLocaleString()}</span>
                      </div>
                      <span className="capitalize">{entry.action}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={!pagination.hasPrev}
                >
                  Previous
                </Button>
                <span className="px-3 py-1 text-sm">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!pagination.hasNext}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Communications;