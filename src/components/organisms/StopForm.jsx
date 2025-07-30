import React, { useState, useEffect } from 'react';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import ApperIcon from '@/components/ApperIcon';

const StopForm = ({ stop, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    landmark: '',
    latitude: '',
    longitude: '',
    pickupTime: '',
    dropTime: '',
    estimatedStudents: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (stop) {
      setFormData({
        name: stop.name || '',
        landmark: stop.landmark || '',
        latitude: stop.latitude || '',
        longitude: stop.longitude || '',
        pickupTime: stop.pickupTime || '',
        dropTime: stop.dropTime || '',
        estimatedStudents: stop.estimatedStudents || ''
      });
    }
  }, [stop]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Stop name is required';
    if (!formData.landmark.trim()) newErrors.landmark = 'Landmark is required';
    if (!formData.latitude) newErrors.latitude = 'Latitude is required';
    if (!formData.longitude) newErrors.longitude = 'Longitude is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        estimatedStudents: parseInt(formData.estimatedStudents) || 0
      });
    } catch (error) {
      console.error('Failed to save stop:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {stop ? 'Edit Stop' : 'Add New Stop'}
          </h2>
          <Button variant="ghost" onClick={onCancel}>
            <ApperIcon name="X" size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Stop Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter stop name"
                error={errors.name}
                required
              />
            </div>
            <div>
              <Input
                label="Landmark"
                value={formData.landmark}
                onChange={(e) => handleInputChange('landmark', e.target.value)}
                placeholder="Enter landmark description"
                error={errors.landmark}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => handleInputChange('latitude', e.target.value)}
                placeholder="Enter latitude"
                error={errors.latitude}
                required
              />
            </div>
            <div>
              <Input
                label="Longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => handleInputChange('longitude', e.target.value)}
                placeholder="Enter longitude"
                error={errors.longitude}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Pickup Time"
                type="time"
                value={formData.pickupTime}
                onChange={(e) => handleInputChange('pickupTime', e.target.value)}
              />
            </div>
            <div>
              <Input
                label="Drop Time"
                type="time"
                value={formData.dropTime}
                onChange={(e) => handleInputChange('dropTime', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Input
              label="Estimated Students"
              type="number"
              value={formData.estimatedStudents}
              onChange={(e) => handleInputChange('estimatedStudents', e.target.value)}
              placeholder="Enter estimated number of students"
              min="0"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="flex items-center"
            >
              {isSubmitting && <ApperIcon name="Loader2" size={16} className="mr-2 animate-spin" />}
              {stop ? 'Update Stop' : 'Add Stop'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default StopForm;