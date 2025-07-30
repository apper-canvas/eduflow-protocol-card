import React, { useState } from 'react';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import ApperIcon from '@/components/ApperIcon';

const ExamForm = ({ exam = null, classes, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: exam?.name || '',
    type: exam?.type || 'Unit Test',
    startDate: exam?.startDate || '',
    endDate: exam?.endDate || '',
    description: exam?.description || '',
    classes: exam?.classes || [],
    status: exam?.status || 'Draft'
  });

  const [errors, setErrors] = useState({});

  const examTypes = [
    { value: 'Unit Test', label: 'Unit Test' },
    { value: 'Mid-term', label: 'Mid-term Examination' },
    { value: 'Final', label: 'Final Examination' },
    { value: 'Monthly Test', label: 'Monthly Test' },
    { value: 'Quarterly', label: 'Quarterly Examination' },
    { value: 'Half Yearly', label: 'Half Yearly Examination' }
  ];

  const statusOptions = [
    { value: 'Draft', label: 'Draft' },
    { value: 'Scheduled', label: 'Scheduled' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Cancelled', label: 'Cancelled' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleClassChange = (classId, checked) => {
    setFormData(prev => ({
      ...prev,
      classes: checked
        ? [...prev.classes, parseInt(classId)]
        : prev.classes.filter(id => id !== parseInt(classId))
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Exam name is required';
    }

    if (!formData.type) {
      newErrors.type = 'Exam type is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (formData.classes.length === 0) {
      newErrors.classes = 'At least one class must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    await onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {exam ? 'Edit Exam' : 'Create New Exam'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <ApperIcon name="X" size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Exam Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  error={errors.name}
                  placeholder="Enter exam name"
                  required
                />
              </div>
              <div>
                <Select
                  label="Exam Type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  options={examTypes}
                  error={errors.type}
                  required
                />
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  error={errors.startDate}
                  required
                />
              </div>
              <div>
                <Input
                  label="End Date"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  error={errors.endDate}
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter exam description (optional)"
              />
            </div>

            {/* Status */}
            <div>
              <Select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                options={statusOptions}
              />
            </div>

            {/* Classes Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Participating Classes
              </label>
              {errors.classes && (
                <p className="text-red-600 text-sm mb-2">{errors.classes}</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {classes.map((classItem) => (
                  <label
                    key={classItem.Id}
                    className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.classes.includes(classItem.Id)}
                      onChange={(e) => handleClassChange(classItem.Id, e.target.checked)}
                      className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {classItem.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {classItem.strength} students
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-red-600 hover:bg-red-700"
              >
                {exam ? 'Update Exam' : 'Create Exam'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default ExamForm;