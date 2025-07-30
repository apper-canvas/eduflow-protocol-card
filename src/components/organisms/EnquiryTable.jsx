import React from 'react';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

const EnquiryTable = ({ enquiries, onEnquiryClick, onConvertToApplication, onSort, sortField, sortOrder }) => {
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
      'New': { variant: 'info', icon: 'Plus' },
      'Contacted': { variant: 'warning', icon: 'Phone' },
      'Interested': { variant: 'success', icon: 'Heart' },
      'Not Interested': { variant: 'danger', icon: 'X' },
      'Converted': { variant: 'purple', icon: 'ArrowRight' }
    };

    const config = statusConfig[status] || { variant: 'default', icon: 'Circle' };
    
    return (
      <Badge variant={config.variant}>
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

  if (!enquiries || enquiries.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200">
        <div className="p-12 text-center">
          <ApperIcon name="Users" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No enquiries found</h3>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Enquiry ID
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact Number
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                onClick={() => handleSort('enquiryDate')}
              >
                <div className="flex items-center space-x-1">
                  <span>Enquiry Date</span>
                  <SortIcon field="enquiryDate" />
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
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {enquiries.map((enquiry) => (
              <tr 
                key={enquiry.Id}
                className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                onClick={() => onEnquiryClick(enquiry)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  ENQ{String(enquiry.Id).padStart(3, '0')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {enquiry.studentName.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{enquiry.studentName}</div>
                      <div className="text-sm text-gray-500">Class {enquiry.preferredClass}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {enquiry.parentName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {enquiry.contactNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(enquiry.enquiryDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(enquiry.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {enquiry.status === 'Interested' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onConvertToApplication(enquiry);
                        }}
                      >
                        <ApperIcon name="ArrowRight" className="w-3 h-3 mr-1" />
                        Convert
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEnquiryClick(enquiry);
                      }}
                    >
                      <ApperIcon name="Eye" className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EnquiryTable;