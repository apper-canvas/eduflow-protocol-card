import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/utils/cn';
import ApperIcon from '@/components/ApperIcon';

const SidebarItem = ({ to, icon, label, badge }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group",
          isActive
            ? "bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg"
            : "text-gray-600 hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 hover:text-primary-600"
        )
      }
    >
      {({ isActive }) => (
        <>
          <ApperIcon 
            name={icon} 
            className={cn(
              "w-5 h-5 mr-3 transition-colors duration-200",
              isActive ? "text-white" : "text-gray-400 group-hover:text-primary-500"
            )} 
          />
          <span className="flex-1">{label}</span>
          {badge && (
            <span className={cn(
              "px-2 py-0.5 text-xs font-medium rounded-full",
              isActive 
                ? "bg-white/20 text-white" 
                : "bg-accent-100 text-accent-800"
            )}>
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
};

export default SidebarItem;