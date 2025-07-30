import React from 'react';
import { cn } from '@/utils/cn';
import Card from '@/components/atoms/Card';
import ApperIcon from '@/components/ApperIcon';

const MetricCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'positive',
  icon, 
  gradient = 'from-primary-500 to-primary-600',
  className 
}) => {
  const changeColor = changeType === 'positive' ? 'text-green-600' : 'text-red-600';
  const changeIcon = changeType === 'positive' ? 'TrendingUp' : 'TrendingDown';

  return (
    <Card className={cn("p-6 relative overflow-hidden", className)}>
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradient} opacity-10 rounded-full transform translate-x-8 -translate-y-8`}></div>
      
      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold gradient-text mb-2">{value}</p>
          {change && (
            <div className={cn("flex items-center text-sm", changeColor)}>
              <ApperIcon name={changeIcon} className="w-4 h-4 mr-1" />
              <span>{change}</span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
            <ApperIcon name={icon} className="w-6 h-6 text-white" />
          </div>
        )}
      </div>
    </Card>
  );
};

export default MetricCard;