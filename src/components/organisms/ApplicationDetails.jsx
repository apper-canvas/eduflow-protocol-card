import React from 'react';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import Card from '@/components/atoms/Card';
import ApperIcon from '@/components/ApperIcon';

const ApplicationDetails = ({ application, onEdit, onClose }) => {
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

  const getTestStatusBadge = (status) => {
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
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg mr-3">
                <ApperIcon name="FileText" className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 font-display">
                  Application Details - {application.applicationNumber}
                </h2>
                <p className="text-sm text-gray-600">
                  {application.studentName} • {formatDate(application.applicationDate)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => onEdit(application)}>
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
              <h3 className="text-lg font-semibold text-gray-900 font-display">Application Status</h3>
              {getStatusBadge(application.status)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Application Date</label>
                <p className="text-gray-900">{formatDate(application.applicationDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Preferred Class</label>
                <p className="text-gray-900">{application.preferredClass}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Fee Status</label>
                <Badge variant={application.feePaid ? 'success' : 'warning'}>
                  <ApperIcon name={application.feePaid ? 'CheckCircle' : 'Clock'} className="w-3 h-3 mr-1" />
                  {application.feePaid ? 'Paid' : 'Pending'}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Test Score</label>
                <p className="text-gray-900">{application.testScore ? `${application.testScore}/100` : 'Not available'}</p>
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
                <p className="text-gray-900 font-medium">{application.studentName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                <p className="text-gray-900">{formatDate(application.studentDateOfBirth)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Gender</label>
                <p className="text-gray-900">{application.studentGender}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Previous School</label>
                <p className="text-gray-900">{application.previousSchool || 'Not provided'}</p>
              </div>
            </div>
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-500">Address</label>
              <p className="text-gray-900">{application.address}</p>
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
                <p className="text-gray-900 font-medium">{application.parentName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Contact Number</label>
                <p className="text-gray-900">
                  <a href={`tel:${application.contactNumber}`} className="text-primary-600 hover:text-primary-700">
                    {application.contactNumber}
                  </a>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900">
                  <a href={`mailto:${application.email}`} className="text-primary-600 hover:text-primary-700">
                    {application.email}
                  </a>
                </p>
              </div>
              <div></div>
              <div>
                <label className="text-sm font-medium text-gray-500">Father's Name</label>
                <p className="text-gray-900">{application.fatherName || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Mother's Name</label>
                <p className="text-gray-900">{application.motherName || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Father's Occupation</label>
                <p className="text-gray-900">{application.fatherOccupation || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Mother's Occupation</label>
                <p className="text-gray-900">{application.motherOccupation || 'Not provided'}</p>
              </div>
            </div>
          </Card>

          {/* Interview & Test Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg mr-3">
                  <ApperIcon name="Calendar" className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 font-display">Interview</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    {getInterviewStatusBadge(application.interviewStatus)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Scheduled Date</label>
                  <p className="text-gray-900">{formatDate(application.interviewDate)}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg mr-3">
                  <ApperIcon name="BookOpen" className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 font-display">Admission Test</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    {getTestStatusBadge(application.admissionTest)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Score</label>
                  <p className="text-gray-900">{application.testScore ? `${application.testScore}/100` : 'Not available'}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Documents */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg mr-3">
                <ApperIcon name="FileText" className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 font-display">Documents Submitted</h3>
            </div>
            {application.documentsSubmitted && application.documentsSubmitted.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {application.documentsSubmitted.map((document, index) => (
                  <div key={index} className="flex items-center">
                    <ApperIcon name="CheckCircle" className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm text-gray-700">{document}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No documents submitted yet</p>
            )}
          </Card>

          {/* Notes */}
          {application.notes && (
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg mr-3">
                  <ApperIcon name="MessageSquare" className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 font-display">Notes</h3>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{application.notes}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetails;