import React, { useState, useEffect } from 'react';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import ApperIcon from '@/components/ApperIcon';

const ApplicationForm = ({ application = null, enquiry = null, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    studentName: '',
    parentName: '',
    contactNumber: '',
    email: '',
    preferredClass: '',
    studentDateOfBirth: '',
    studentGender: '',
    address: '',
    previousSchool: '',
    fatherName: '',
    motherName: '',
    fatherOccupation: '',
    motherOccupation: '',
    status: 'Under Review',
    documentsSubmitted: [],
    interviewDate: '',
    interviewStatus: 'Pending',
    admissionTest: 'Pending',
    testScore: '',
    notes: '',
    feePaid: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (application) {
      setFormData({
        studentName: application.studentName || '',
        parentName: application.parentName || '',
        contactNumber: application.contactNumber || '',
        email: application.email || '',
        preferredClass: application.preferredClass || '',
        studentDateOfBirth: application.studentDateOfBirth || '',
        studentGender: application.studentGender || '',
        address: application.address || '',
        previousSchool: application.previousSchool || '',
        fatherName: application.fatherName || '',
        motherName: application.motherName || '',
        fatherOccupation: application.fatherOccupation || '',
        motherOccupation: application.motherOccupation || '',
        status: application.status || 'Under Review',
        documentsSubmitted: application.documentsSubmitted || [],
        interviewDate: application.interviewDate || '',
        interviewStatus: application.interviewStatus || 'Pending',
        admissionTest: application.admissionTest || 'Pending',
        testScore: application.testScore || '',
        notes: application.notes || '',
        feePaid: application.feePaid || false
      });
    } else if (enquiry) {
      // Pre-fill from enquiry data
      setFormData(prev => ({
        ...prev,
        studentName: enquiry.studentName || '',
        parentName: enquiry.parentName || '',
        contactNumber: enquiry.contactNumber || '',
        email: enquiry.email || '',
        preferredClass: enquiry.preferredClass || '',
        studentDateOfBirth: enquiry.studentDateOfBirth || '',
        studentGender: enquiry.studentGender || '',
        address: enquiry.address || '',
        previousSchool: enquiry.previousSchool || '',
        fatherName: enquiry.fatherName || '',
        motherName: enquiry.motherName || '',
        fatherOccupation: enquiry.fatherOccupation || '',
        motherOccupation: enquiry.motherOccupation || '',
        notes: `Converted from enquiry ENQ${String(enquiry.Id).padStart(3, '0')}: ${enquiry.notes || ''}`
      }));
    }
  }, [application, enquiry]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDocumentChange = (document, checked) => {
    setFormData(prev => ({
      ...prev,
      documentsSubmitted: checked
        ? [...prev.documentsSubmitted, document]
        : prev.documentsSubmitted.filter(doc => doc !== document)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.studentName.trim()) newErrors.studentName = 'Student name is required';
    if (!formData.parentName.trim()) newErrors.parentName = 'Parent name is required';
    if (!formData.contactNumber.trim()) newErrors.contactNumber = 'Contact number is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.preferredClass) newErrors.preferredClass = 'Preferred class is required';
    if (!formData.studentDateOfBirth) newErrors.studentDateOfBirth = 'Date of birth is required';
    if (!formData.studentGender) newErrors.studentGender = 'Gender is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const classOptions = [
    { value: '6th', label: '6th Grade' },
    { value: '7th', label: '7th Grade' },
    { value: '8th', label: '8th Grade' },
    { value: '9th', label: '9th Grade' },
    { value: '10th', label: '10th Grade' },
    { value: '11th', label: '11th Grade' },
    { value: '12th', label: '12th Grade' }
  ];

  const statusOptions = [
    { value: 'Under Review', label: 'Under Review' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Waitlisted', label: 'Waitlisted' }
  ];

  const interviewStatusOptions = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Scheduled', label: 'Scheduled' },
    { value: 'Completed', label: 'Completed' }
  ];

  const admissionTestOptions = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Scheduled', label: 'Scheduled' },
    { value: 'Completed', label: 'Completed' }
  ];

  const documentOptions = [
    'Birth Certificate',
    'Previous School TC',
    'Mark Sheets',
    'Photos',
    'Address Proof',
    'Medical Certificate'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg mr-3">
                <ApperIcon name="FileText" className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 font-display">
                {application ? 'Edit Application' : enquiry ? 'Convert Enquiry to Application' : 'Add New Application'}
              </h2>
            </div>
            <Button variant="ghost" onClick={onCancel}>
              <ApperIcon name="X" className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Student Information */}
          <Card className="p-6">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg mr-3">
                <ApperIcon name="User" className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 font-display">Student Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Student Name"
                name="studentName"
                value={formData.studentName}
                onChange={handleInputChange}
                error={errors.studentName}
                required
              />
              <Input
                label="Date of Birth"
                name="studentDateOfBirth"
                type="date"
                value={formData.studentDateOfBirth}
                onChange={handleInputChange}
                error={errors.studentDateOfBirth}
                required
              />
              <Select
                label="Gender"
                name="studentGender"
                value={formData.studentGender}
                onChange={handleInputChange}
                error={errors.studentGender}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Select>
              <Select
                label="Preferred Class"
                name="preferredClass"
                value={formData.preferredClass}
                onChange={handleInputChange}
                error={errors.preferredClass}
                required
              >
                <option value="">Select Class</option>
                {classOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
              <Input
                label="Previous School"
                name="previousSchool"
                value={formData.previousSchool}
                onChange={handleInputChange}
              />
            </div>

            <div className="mt-6">
              <Input
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                error={errors.address}
                required
              />
            </div>
          </Card>

          {/* Parent Information */}
          <Card className="p-6">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-gradient-to-br from-accent-500 to-accent-600 rounded-lg mr-3">
                <ApperIcon name="Users" className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 font-display">Parent Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Parent Name (Primary Contact)"
                name="parentName"
                value={formData.parentName}
                onChange={handleInputChange}
                error={errors.parentName}
                required
              />
              <Input
                label="Contact Number"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                error={errors.contactNumber}
                placeholder="+91-9876543210"
                required
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                error={errors.email}
                required
              />
              <div></div>
              <Input
                label="Father's Name"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleInputChange}
              />
              <Input
                label="Mother's Name"
                name="motherName"
                value={formData.motherName}
                onChange={handleInputChange}
              />
              <Input
                label="Father's Occupation"
                name="fatherOccupation"
                value={formData.fatherOccupation}
                onChange={handleInputChange}
              />
              <Input
                label="Mother's Occupation"
                name="motherOccupation"
                value={formData.motherOccupation}
                onChange={handleInputChange}
              />
            </div>
          </Card>

          {/* Application Details */}
          <Card className="p-6">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg mr-3">
                <ApperIcon name="FileText" className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 font-display">Application Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Application Status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
              <Select
                label="Interview Status"
                name="interviewStatus"
                value={formData.interviewStatus}
                onChange={handleInputChange}
              >
                {interviewStatusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
              <Input
                label="Interview Date"
                name="interviewDate"
                type="date"
                value={formData.interviewDate}
                onChange={handleInputChange}
              />
              <Select
                label="Admission Test"
                name="admissionTest"
                value={formData.admissionTest}
                onChange={handleInputChange}
              >
                {admissionTestOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
              <Input
                label="Test Score"
                name="testScore"
                type="number"
                min="0"
                max="100"
                value={formData.testScore}
                onChange={handleInputChange}
                placeholder="Enter score (0-100)"
              />
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="feePaid"
                  name="feePaid"
                  checked={formData.feePaid}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="feePaid" className="ml-2 text-sm text-gray-700">
                  Fee Paid
                </label>
              </div>
            </div>

            {/* Documents Submitted */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Documents Submitted
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {documentOptions.map(document => (
                  <label key={document} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.documentsSubmitted.includes(document)}
                      onChange={(e) => handleDocumentChange(document, e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{document}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                rows={4}
                value={formData.notes}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                placeholder="Any additional notes or comments..."
              />
            </div>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="min-w-32"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </div>
              ) : (
                application ? 'Update Application' : 'Create Application'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationForm;