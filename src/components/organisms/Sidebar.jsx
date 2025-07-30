import React from 'react';
import { cn } from '@/utils/cn';
import SidebarItem from '@/components/molecules/SidebarItem';
import ApperIcon from '@/components/ApperIcon';

const Sidebar = ({ isOpen, onClose }) => {
  const menuItems = [
    { to: '/', icon: 'LayoutDashboard', label: 'Dashboard' },
    { to: '/students', icon: 'Users', label: 'Students' },
    { to: '/admissions', icon: 'UserPlus', label: 'Admissions', badge: '23' },
    { to: '/academics', icon: 'BookOpen', label: 'Academics' },
    { to: '/attendance', icon: 'Calendar', label: 'Attendance' },
    { to: '/communications', icon: 'MessageSquare', label: 'Communications' },
    { to: '/timetable', icon: 'Clock', label: 'Timetable' },
    { to: '/examinations', icon: 'FileText', label: 'Examinations' },
    { to: '/finance', icon: 'CreditCard', label: 'Finance' },
    { to: '/transport', icon: 'Bus', label: 'Transport' },
    { to: '/reports', icon: 'BarChart3', label: 'Reports' }
  ];

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <div className="hidden lg:flex lg:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1 bg-white shadow-lg border-r border-gray-200">
          {/* Logo */}
          <div className="flex items-center h-16 flex-shrink-0 px-6 bg-gradient-to-r from-primary-600 to-secondary-600">
            <div className="flex items-center">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <ApperIcon name="GraduationCap" className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-white font-display">EduFlow</h1>
                <p className="text-xs text-white/80">Pro</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-4 py-6 space-y-2">
              {menuItems.map((item) => (
                <SidebarItem
                  key={item.to}
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                  badge={item.badge}
                />
              ))}
            </nav>

            {/* User Profile */}
            <div className="flex-shrink-0 p-4 border-t border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                    <ApperIcon name="User" className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">Admin User</p>
                  <p className="text-xs text-gray-500">School Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Mobile Sidebar
  const MobileSidebar = () => (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 flex-shrink-0 px-6 bg-gradient-to-r from-primary-600 to-secondary-600">
            <div className="flex items-center">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <ApperIcon name="GraduationCap" className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-white font-display">EduFlow</h1>
                <p className="text-xs text-white/80">Pro</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-white hover:bg-white/20 transition-colors duration-200"
            >
              <ApperIcon name="X" className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-4 py-6 space-y-2">
              {menuItems.map((item) => (
                <SidebarItem
                  key={item.to}
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                  badge={item.badge}
                />
              ))}
            </nav>

            {/* User Profile */}
            <div className="flex-shrink-0 p-4 border-t border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                    <ApperIcon name="User" className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">Admin User</p>
                  <p className="text-xs text-gray-500">School Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
};

export default Sidebar;