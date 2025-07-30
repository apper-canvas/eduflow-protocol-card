import React from 'react';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

const Error = ({ 
  message = 'Something went wrong', 
  onRetry, 
  title = 'Oops!',
  type = 'general' 
}) => {
  const getIcon = () => {
    switch (type) {
      case 'network':
        return 'WifiOff';
      case 'notFound':
        return 'FileSearch';
      default:
        return 'AlertTriangle';
    }
  };

  const getGradient = () => {
    switch (type) {
      case 'network':
        return 'from-blue-500 to-purple-600';
      case 'notFound':
        return 'from-gray-500 to-gray-600';
      default:
        return 'from-red-500 to-pink-600';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className={`p-4 rounded-full bg-gradient-to-br ${getGradient()} mb-6 shadow-lg`}>
        <ApperIcon name={getIcon()} className="w-8 h-8 text-white" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2 font-display">{title}</h3>
      <p className="text-gray-600 text-center max-w-md mb-6">{message}</p>
      
      {onRetry && (
        <Button
          variant="primary"
          onClick={onRetry}
          className="flex items-center"
        >
          <ApperIcon name="RefreshCw" className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
};

export default Error;