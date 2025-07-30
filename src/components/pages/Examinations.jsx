import React, { useState } from 'react';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import ExamScheduleTab from '@/components/organisms/ExamScheduleTab';

const Examinations = () => {
  const [activeTab, setActiveTab] = useState('schedule');

  const tabs = [
    {
      id: 'schedule',
      name: 'Exam Schedule',
      icon: 'Calendar',
      description: 'Create and manage exam schedules'
    },
    {
      id: 'halltickets',
      name: 'Hall Tickets',
      icon: 'CreditCard',
      description: 'Generate and manage hall tickets'
    },
    {
      id: 'results',
      name: 'Results',
      icon: 'FileText',
      description: 'Enter and process exam results'
    },
    {
      id: 'grading',
      name: 'Grade Processing',
      icon: 'Award',
      description: 'Process grades and generate reports'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'schedule':
        return <ExamScheduleTab />;
      case 'halltickets':
        return <ComingSoonContent title="Hall Tickets" description="Hall ticket generation and management system coming soon." />;
      case 'results':
        return <ComingSoonContent title="Results Processing" description="Exam result entry and processing system coming soon." />;
      case 'grading':
        return <ComingSoonContent title="Grade Processing" description="Grade calculation and report generation system coming soon." />;
      default:
        return <ExamScheduleTab />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">
            Examination Management
          </h1>
          <p className="text-gray-600 mt-2">
            Complete examination management system from scheduling to result processing
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <ApperIcon name="FileText" size={32} className="text-red-500" />
        </div>
      </div>

      {/* Tab Navigation */}
      <Card className="p-0">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <ApperIcon name={tab.icon} size={16} />
                  <span>{tab.name}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </Card>
    </div>
  );
};

const ComingSoonContent = ({ title, description }) => (
  <div className="text-center py-12">
    <div className="max-w-md mx-auto">
      <div className="bg-gradient-to-br from-red-500 to-pink-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <ApperIcon name="Clock" size={24} className="text-white" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-4 border border-red-100">
        <p className="text-sm text-red-700 font-medium">Coming Soon</p>
        <p className="text-xs text-red-600 mt-1">This feature is under development</p>
      </div>
    </div>
  </div>
);

export default Examinations;