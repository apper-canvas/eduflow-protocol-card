import React from 'react';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

const Empty = ({ 
  title = 'No data found',
  message = 'Get started by adding your first item.',
  icon = 'Inbox',
  actionLabel,
  onAction,
  type = 'default'
}) => {
  const getGradient = () => {
    switch (type) {
      case 'students':
        return 'from-primary-500 to-secondary-600';
      case 'search':
        return 'from-accent-500 to-orange-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className={`p-6 rounded-full bg-gradient-to-br ${getGradient()} mb-6 shadow-xl`}>
        <ApperIcon name={icon} className="w-12 h-12 text-white" />
      </div>
      
      <h3 className="text-2xl font-bold gradient-text mb-3 font-display">{title}</h3>
      <p className="text-gray-600 text-center max-w-md mb-8 text-lg">{message}</p>
      
      {actionLabel && onAction && (
        <Button
          variant="primary"
          onClick={onAction}
          size="lg"
          className="flex items-center shadow-lg"
        >
          <ApperIcon name="Plus" className="w-5 h-5 mr-2" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default Empty;