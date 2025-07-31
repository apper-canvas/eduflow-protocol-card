import React, { useState } from 'react';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import GradeBookTab from '@/components/organisms/GradeBookTab';
import HomeworkTab from '@/components/organisms/HomeworkTab';

const TabButton = ({ active, onClick, icon, children }) => (
  <Button
    variant={active ? "default" : "outline"}
    onClick={onClick}
    className={`flex items-center gap-2 ${active ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-blue-600'}`}
  >
    <ApperIcon name={icon} size={16} />
    {children}
  </Button>
);

const PlaceholderTab = ({ title, description, icon, features }) => (
  <div className="text-center py-12">
    <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
      <ApperIcon name={icon} size={40} className="text-blue-600" />
    </div>
    
    <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600 mb-8 max-w-2xl mx-auto">{description}</p>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
      {features?.map((feature, index) => (
        <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <ApperIcon name={feature.icon} size={24} className="text-blue-600" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
          <p className="text-sm text-gray-600">{feature.description}</p>
        </div>
      ))}
    </div>
    
    <div className="mt-8">
      <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
        <ApperIcon name="Clock" size={16} className="mr-2" />
        Coming Soon
      </span>
    </div>
  </div>
);

const Academics = () => {
  const [activeTab, setActiveTab] = useState('gradebook');

  const tabs = [
    { id: 'gradebook', label: 'Grade Book', icon: 'GraduationCap' },
    { id: 'homework', label: 'Homework', icon: 'FileText' },
    { id: 'reportcards', label: 'Report Cards', icon: 'FileBarChart' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'gradebook':
        return <GradeBookTab />;
      
case 'homework':
        return <HomeworkTab />;
      
      case 'reportcards':
        return (
          <PlaceholderTab
            title="Report Cards"
            description="Generate comprehensive report cards with grades, attendance, and behavioral assessments."
            icon="FileBarChart"
            features={[
              {
                icon: "FileText",
                title: "Auto Generation",
                description: "Automatically generate report cards from grade book data"
              },
              {
                icon: "Layout",
                title: "Custom Templates",
                description: "Design custom report card templates matching school branding"
              },
              {
                icon: "TrendingUp",
                title: "Progress Tracking",
                description: "Show student progress trends across multiple terms"
              },
              {
                icon: "MessageSquare",
                title: "Teacher Comments",
                description: "Include personalized teacher comments and recommendations"
              },
              {
                icon: "Download",
                title: "Digital Distribution",
                description: "Email report cards directly to parents and students"
              },
              {
                icon: "Archive",
                title: "Historical Records",
                description: "Maintain comprehensive academic history for all students"
              }
            ]}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <ApperIcon name="BookOpen" size={24} className="text-white" />
            </div>
            Academic Management
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive academic management system for grades, assignments, and assessments
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <Card className="p-1">
        <div className="flex flex-wrap gap-1">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              icon={tab.icon}
            >
              {tab.label}
            </TabButton>
          ))}
        </div>
      </Card>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Academics;