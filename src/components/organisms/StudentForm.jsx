import React, { useState } from 'react';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import ApperIcon from '@/components/ApperIcon';

const StudentForm = ({ onSubmit, initialData = null, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    dateOfBirth: initialData?.dateOfBirth || '',
    gender: initialData?.gender || '',
    class: initialData?.class || '',
    section: initialData?.section || '',
    rollNumber: initialData?.rollNumber || '',
    admissionDate: initialData?.admissionDate || '',
    address: initialData?.address || '',
    bloodGroup: initialData?.bloodGroup || '',
    photo: initialData?.photo || ''
  });

  const [parentData, setParentData] = useState({
    fatherName: '',
    motherName: '',
    primaryContact: '',
    email: '',
    occupation: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleParentChange = (e) => {
    const { name, value } = e.target;
    setParentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.class) newErrors.class = 'Class is required';
    if (!formData.section) newErrors.section = 'Section is required';
    if (!formData.rollNumber.trim()) newErrors.rollNumber = 'Roll number is required';
    if (!formData.admissionDate) newErrors.admissionDate = 'Admission date is required';
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
      await onSubmit({
        ...formData,
        photo: formData.photo || `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face`
      }, parentData);
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

  const sectionOptions = [
    { value: 'A', label: 'Section A' },
    { value: 'B', label: 'Section B' },
    { value: 'C', label: 'Section C' }
  ];

  const bloodGroupOptions = [
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
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
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            error={errors.firstName}
            required
          />
          <Input
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            error={errors.lastName}
            required
          />
          <Input
            label="Date of Birth"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            error={errors.dateOfBirth}
            required
          />
          <Select
            label="Gender"
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            error={errors.gender}
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </Select>
          <Select
            label="Class"
            name="class"
            value={formData.class}
            onChange={handleInputChange}
            error={errors.class}
            required
          >
            <option value="">Select Class</option>
            {classOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>
          <Select
            label="Section"
            name="section"
            value={formData.section}
            onChange={handleInputChange}
            error={errors.section}
            required
          >
            <option value="">Select Section</option>
            {sectionOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>
          <Input
            label="Roll Number"
            name="rollNumber"
            value={formData.rollNumber}
            onChange={handleInputChange}
            error={errors.rollNumber}
            required
          />
          <Input
            label="Admission Date"
            name="admissionDate"
            type="date"
            value={formData.admissionDate}
            onChange={handleInputChange}
            error={errors.admissionDate}
            required
          />
          <Select
            label="Blood Group"
            name="bloodGroup"
            value={formData.bloodGroup}
            onChange={handleInputChange}
          >
            <option value="">Select Blood Group</option>
            {bloodGroupOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>
          <Input
            label="Photo URL (Optional)"
            name="photo"
            value={formData.photo}
            onChange={handleInputChange}
            placeholder="https://example.com/photo.jpg"
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
            label="Father's Name"
            name="fatherName"
            value={parentData.fatherName}
            onChange={handleParentChange}
          />
          <Input
            label="Mother's Name"
            name="motherName"
            value={parentData.motherName}
            onChange={handleParentChange}
          />
          <Input
            label="Primary Contact"
            name="primaryContact"
            value={parentData.primaryContact}
            onChange={handleParentChange}
            placeholder="+91-9876543210"
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={parentData.email}
            onChange={handleParentChange}
          />
          <Input
            label="Occupation"
            name="occupation"
            value={parentData.occupation}
            onChange={handleParentChange}
          />
        </div>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
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
            initialData ? 'Update Student' : 'Add Student'
          )}
        </Button>
      </div>
    </form>
  );
};

export default StudentForm;