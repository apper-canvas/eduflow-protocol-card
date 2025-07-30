import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Card from '@/components/atoms/Card';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import { parentService } from '@/services/api/parentService';

const StudentProfile = ({ student, onEdit, onBack }) => {
  const [parentInfo, setParentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    loadParentInfo();
  }, [student.Id]);

  const loadParentInfo = async () => {
    try {
      setLoading(true);
      setError('');
      const parent = await parentService.getByStudentId(student.Id);
      setParentInfo(parent);
    } catch (err) {
      setError('Unable to load parent information');
      console.error('Error loading parent info:', err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: 'User' },
    { id: 'academic', label: 'Academic Info', icon: 'BookOpen' },
    { id: 'parent', label: 'Parent Details', icon: 'Users' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="p-2"
          >
            <ApperIcon name="ArrowLeft" className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold gradient-text font-display">
              {student.firstName} {student.lastName}
            </h1>
            <p className="text-gray-600">Student ID: {student.rollNumber}</p>
          </div>
        </div>
        <Button
          variant="primary"
          onClick={() => onEdit(student)}
          className="flex items-center"
        >
          <ApperIcon name="Edit" className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      {/* Student Overview Card */}
      <Card className="p-6 bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-200">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
          <img
            src={student.photo}
            alt={`${student.firstName} ${student.lastName}`}
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
          />
          <div className="flex-1">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Class & Section</p>
                <p className="font-semibold text-lg">{student.class} - {student.section}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge variant={student.status === 'Active' ? 'active' : 'inactive'}>
                  {student.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Blood Group</p>
                <p className="font-semibold text-lg">{student.bloodGroup || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Admission Date</p>
                <p className="font-semibold">{format(new Date(student.admissionDate), 'MMM dd, yyyy')}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ApperIcon name={tab.icon} className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'personal' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 font-display">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <p className="text-gray-900">{student.firstName} {student.lastName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <p className="text-gray-900">{format(new Date(student.dateOfBirth), 'MMMM dd, yyyy')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <p className="text-gray-900">{student.gender}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                <p className="text-gray-900">{student.bloodGroup || 'Not specified'}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <p className="text-gray-900">{student.address}</p>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'academic' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 font-display">Academic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <p className="text-gray-900">{student.class}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                <p className="text-gray-900">{student.section}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                <p className="text-gray-900">{student.rollNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admission Date</label>
                <p className="text-gray-900">{format(new Date(student.admissionDate), 'MMMM dd, yyyy')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <Badge variant={student.status === 'Active' ? 'active' : 'inactive'}>
                  {student.status}
                </Badge>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'parent' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 font-display">Parent Information</h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span className="ml-3 text-gray-600">Loading parent information...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <ApperIcon name="AlertCircle" className="w-12 h-12 text-red-400 mx-auto mb-3" />
                <p className="text-red-600 mb-4">{error}</p>
                <Button variant="outline" onClick={loadParentInfo}>
                  Try Again
                </Button>
              </div>
            ) : parentInfo ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name</label>
                  <p className="text-gray-900">{parentInfo.fatherName || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Name</label>
                  <p className="text-gray-900">{parentInfo.motherName || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Primary Contact</label>
                  <p className="text-gray-900">{parentInfo.primaryContact || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Contact</label>
                  <p className="text-gray-900">{parentInfo.secondaryContact || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{parentInfo.email || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                  <p className="text-gray-900">{parentInfo.occupation || 'Not provided'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <p className="text-gray-900">{parentInfo.address || 'Not provided'}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <ApperIcon name="Users" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No parent information available</p>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudentProfile;