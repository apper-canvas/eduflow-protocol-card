import React from 'react';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import Card from '@/components/atoms/Card';
import ApperIcon from '@/components/ApperIcon';

const EnquiryDetails = ({ enquiry, onEdit, onConvert, onClose }) => {
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
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg mr-3">
                <ApperIcon name="UserPlus" className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 font-display">
                  Enquiry Details - ENQ{String(enquiry.Id).padStart(3, '0')}
                </h2>
                <p className="text-sm text-gray-600">
                  {enquiry.studentName} • {formatDate(enquiry.enquiryDate)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {enquiry.status === 'Interested' && (
                <Button
                  variant="primary"
                  onClick={() => onConvert(enquiry)}
                >
                  <ApperIcon name="ArrowRight" className="w-4 h-4 mr-2" />
                  Convert to Application
                </Button>
              )}
              <Button variant="outline" onClick={() => onEdit(enquiry)}>
                <ApperIcon name="Edit" className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="ghost" onClick={onClose}>
                <ApperIcon name="X" className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status and Basic Info */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 font-display">Enquiry Status</h3>
              {getStatusBadge(enquiry.status)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Enquiry Date</label>
                <p className="text-gray-900">{formatDate(enquiry.enquiryDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Follow-up Date</label>
                <p className="text-gray-900">{formatDate(enquiry.followUpDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Preferred Class</label>
                <p className="text-gray-900">{enquiry.preferredClass}</p>
              </div>
            </div>
          </Card>

          {/* Student Information */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg mr-3">
                <ApperIcon name="User" className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 font-display">Student Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">Student Name</label>
                <p className="text-gray-900 font-medium">{enquiry.studentName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                <p className="text-gray-900">{formatDate(enquiry.studentDateOfBirth)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Gender</label>
                <p className="text-gray-900">{enquiry.studentGender}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Previous School</label>
                <p className="text-gray-900">{enquiry.previousSchool || 'Not provided'}</p>
              </div>
            </div>
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-500">Address</label>
              <p className="text-gray-900">{enquiry.address}</p>
            </div>
          </Card>

          {/* Parent Information */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-gradient-to-br from-accent-500 to-accent-600 rounded-lg mr-3">
                <ApperIcon name="Users" className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 font-display">Parent Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">Primary Contact (Parent)</label>
                <p className="text-gray-900 font-medium">{enquiry.parentName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Contact Number</label>
                <p className="text-gray-900">
                  <a href={`tel:${enquiry.contactNumber}`} className="text-primary-600 hover:text-primary-700">
                    {enquiry.contactNumber}
                  </a>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900">
                  <a href={`mailto:${enquiry.email}`} className="text-primary-600 hover:text-primary-700">
                    {enquiry.email}
                  </a>
                </p>
              </div>
              <div></div>
              <div>
                <label className="text-sm font-medium text-gray-500">Father's Name</label>
                <p className="text-gray-900">{enquiry.fatherName || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Mother's Name</label>
                <p className="text-gray-900">{enquiry.motherName || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Father's Occupation</label>
                <p className="text-gray-900">{enquiry.fatherOccupation || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Mother's Occupation</label>
                <p className="text-gray-900">{enquiry.motherOccupation || 'Not provided'}</p>
              </div>
            </div>
          </Card>

          {/* Notes */}
          {enquiry.notes && (
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg mr-3">
                  <ApperIcon name="MessageSquare" className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 font-display">Notes</h3>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{enquiry.notes}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnquiryDetails;