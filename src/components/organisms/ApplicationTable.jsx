import React from 'react';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

const ApplicationTable = ({ applications, onApplicationClick, onSort, sortField, sortOrder }) => {
  const handleSort = (field) => {
    if (onSort) {
      onSort(field);
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return <ApperIcon name="ArrowUpDown" className="w-4 h-4 text-gray-300" />;
    }
    return sortOrder === 'asc' 
      ? <ApperIcon name="ArrowUp" className="w-4 h-4 text-primary-500" />
      : <ApperIcon name="ArrowDown" className="w-4 h-4 text-primary-500" />;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Under Review': { variant: 'warning', icon: 'Clock' },
      'Approved': { variant: 'success', icon: 'CheckCircle' },
      'Rejected': { variant: 'danger', icon: 'XCircle' },
      'Waitlisted': { variant: 'info', icon: 'Pause' }
    };

    const config = statusConfig[status] || { variant: 'default', icon: 'Circle' };
    
    return (
      <Badge variant={config.variant}>
        <ApperIcon name={config.icon} className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const getInterviewStatusBadge = (status) => {
    const statusConfig = {
      'Pending': { variant: 'warning', icon: 'Clock' },
      'Scheduled': { variant: 'info', icon: 'Calendar' },
      'Completed': { variant: 'success', icon: 'CheckCircle' }
    };

    const config = statusConfig[status] || { variant: 'default', icon: 'Circle' };
    
    return (
      <Badge variant={config.variant} size="sm">
        <ApperIcon name={config.icon} className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (!applications || applications.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200">
        <div className="p-12 text-center">
          <ApperIcon name="FileText" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                onClick={() => handleSort('applicationNumber')}
              >
                <div className="flex items-center space-x-1">
                  <span>Application #</span>
                  <SortIcon field="applicationNumber" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                onClick={() => handleSort('studentName')}
              >
                <div className="flex items-center space-x-1">
                  <span>Student Name</span>
                  <SortIcon field="studentName" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                onClick={() => handleSort('parentName')}
              >
                <div className="flex items-center space-x-1">
                  <span>Parent Name</span>
                  <SortIcon field="parentName" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                onClick={() => handleSort('applicationDate')}
              >
                <div className="flex items-center space-x-1">
                  <span>Application Date</span>
                  <SortIcon field="applicationDate" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  <SortIcon field="status" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Interview
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applications.map((application) => (
              <tr 
                key={application.Id}
                className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                onClick={() => onApplicationClick(application)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {application.applicationNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {application.studentName.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{application.studentName}</div>
                      <div className="text-sm text-gray-500">Class {application.preferredClass}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {application.parentName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(application.applicationDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(application.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    {getInterviewStatusBadge(application.interviewStatus)}
                    {application.interviewDate && (
                      <div className="text-xs text-gray-500">
                        {formatDate(application.interviewDate)}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onApplicationClick(application);
                    }}
                  >
                    <ApperIcon name="Eye" className="w-3 h-3 mr-1" />
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApplicationTable;