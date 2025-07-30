import React, { useState, useEffect } from 'react';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import ApperIcon from '@/components/ApperIcon';

const VehicleForm = ({ vehicle, onSubmit, onCancel, drivers = [] }) => {
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    type: 'School Bus',
    brand: '',
    model: '',
    year: '',
    capacity: '',
    fuelType: 'Diesel',
    registrationExpiry: '',
    insuranceExpiry: '',
    fitnessExpiry: '',
    pollutionExpiry: '',
    driverId: '',
    status: 'Active',
    mileage: '',
    features: []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (vehicle) {
      setFormData({
        vehicleNumber: vehicle.vehicleNumber || '',
        type: vehicle.type || 'School Bus',
        brand: vehicle.brand || '',
        model: vehicle.model || '',
        year: vehicle.year || '',
        capacity: vehicle.capacity || '',
        fuelType: vehicle.fuelType || 'Diesel',
        registrationExpiry: vehicle.registrationExpiry || '',
        insuranceExpiry: vehicle.insuranceExpiry || '',
        fitnessExpiry: vehicle.fitnessExpiry || '',
        pollutionExpiry: vehicle.pollutionExpiry || '',
        driverId: vehicle.driverId || '',
        status: vehicle.status || 'Active',
        mileage: vehicle.mileage || '',
        features: vehicle.features || []
      });
    }
  }, [vehicle]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFeatureToggle = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.vehicleNumber.trim()) newErrors.vehicleNumber = 'Vehicle number is required';
    if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
    if (!formData.model.trim()) newErrors.model = 'Model is required';
    if (!formData.year || formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = 'Valid year is required';
    }
    if (!formData.capacity || formData.capacity <= 0) newErrors.capacity = 'Valid capacity is required';
    if (!formData.registrationExpiry) newErrors.registrationExpiry = 'Registration expiry is required';
    if (!formData.insuranceExpiry) newErrors.insuranceExpiry = 'Insurance expiry is required';

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
        year: parseInt(formData.year),
        capacity: parseInt(formData.capacity)
      });
    } catch (error) {
      console.error('Failed to save vehicle:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const typeOptions = [
    { value: 'School Bus', label: 'School Bus' },
    { value: 'Mini Bus', label: 'Mini Bus' },
    { value: 'Van', label: 'Van' }
  ];

  const fuelTypeOptions = [
    { value: 'Diesel', label: 'Diesel' },
    { value: 'Petrol', label: 'Petrol' },
    { value: 'CNG', label: 'CNG' },
    { value: 'Electric', label: 'Electric' }
  ];

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
    { value: 'Maintenance', label: 'Maintenance' }
  ];

  const driverOptions = drivers.map(driver => ({
    value: driver.Id,
    label: `${driver.name} - ${driver.employeeId}`
  }));

  const availableFeatures = [
    'GPS Tracking',
    'CCTV Camera',
    'First Aid Kit',
    'Fire Extinguisher',
    'Speed Governor',
    'Air Conditioning',
    'CNG Kit',
    'Emergency Exit',
    'Safety Belts'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
          </h2>
          <Button variant="ghost" onClick={onCancel}>
            <ApperIcon name="X" size={20} />
          </Button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Vehicle Number"
                    value={formData.vehicleNumber}
                    onChange={(e) => handleInputChange('vehicleNumber', e.target.value)}
                    placeholder="Enter vehicle number"
                    error={errors.vehicleNumber}
                    required
                  />
                </div>
                <div>
                  <Select
                    label="Vehicle Type"
                    value={formData.type}
                    onChange={(value) => handleInputChange('type', value)}
                    options={typeOptions}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Brand"
                    value={formData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    placeholder="Enter brand"
                    error={errors.brand}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Model"
                    value={formData.model}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                    placeholder="Enter model"
                    error={errors.model}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => handleInputChange('year', e.target.value)}
                    placeholder="Enter year"
                    error={errors.year}
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => handleInputChange('capacity', e.target.value)}
                    placeholder="Enter capacity"
                    error={errors.capacity}
                    min="1"
                    required
                  />
                </div>
                <div>
                  <Select
                    label="Fuel Type"
                    value={formData.fuelType}
                    onChange={(value) => handleInputChange('fuelType', value)}
                    options={fuelTypeOptions}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Mileage"
                    value={formData.mileage}
                    onChange={(e) => handleInputChange('mileage', e.target.value)}
                    placeholder="e.g., 8.5 km/l"
                  />
                </div>
              </div>
            </Card>

            {/* Documentation */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Documentation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Registration Expiry"
                    type="date"
                    value={formData.registrationExpiry}
                    onChange={(e) => handleInputChange('registrationExpiry', e.target.value)}
                    error={errors.registrationExpiry}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Insurance Expiry"
                    type="date"
                    value={formData.insuranceExpiry}
                    onChange={(e) => handleInputChange('insuranceExpiry', e.target.value)}
                    error={errors.insuranceExpiry}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Fitness Certificate Expiry"
                    type="date"
                    value={formData.fitnessExpiry}
                    onChange={(e) => handleInputChange('fitnessExpiry', e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    label="Pollution Certificate Expiry"
                    type="date"
                    value={formData.pollutionExpiry}
                    onChange={(e) => handleInputChange('pollutionExpiry', e.target.value)}
                  />
                </div>
              </div>
            </Card>

            {/* Assignment & Status */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment & Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Select
                    label="Assigned Driver"
                    value={formData.driverId}
                    onChange={(value) => handleInputChange('driverId', value)}
                    options={[{ value: '', label: 'Select Driver' }, ...driverOptions]}
                  />
                </div>
                <div>
                  <Select
                    label="Status"
                    value={formData.status}
                    onChange={(value) => handleInputChange('status', value)}
                    options={statusOptions}
                    required
                  />
                </div>
              </div>
            </Card>

            {/* Features */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Features & Equipment</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableFeatures.map((feature) => (
                  <label key={feature} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.features.includes(feature)}
                      onChange={() => handleFeatureToggle(feature)}
                      className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                    />
                    <span className="ml-2 text-sm text-gray-900">{feature}</span>
                  </label>
                ))}
              </div>
            </Card>
          </form>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center"
          >
            {isSubmitting && <ApperIcon name="Loader2" size={16} className="mr-2 animate-spin" />}
            {vehicle ? 'Update Vehicle' : 'Add Vehicle'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VehicleForm;