import React, { useEffect, useState } from "react";
import ApperIcon from "@/components/ApperIcon";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import Card from "@/components/atoms/Card";

const RouteForm = ({ route, onSubmit, onCancel, drivers = [], vehicles = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'Morning Pickup',
    vehicleId: '',
    driverId: '',
    startTime: '',
    endTime: '',
    maxCapacity: '',
    status: 'Active',
    stops: []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showStopForm, setShowStopForm] = useState(false);
  const [editingStopIndex, setEditingStopIndex] = useState(null);
  const [currentStop, setCurrentStop] = useState({
    name: '',
    landmark: '',
    latitude: '',
    longitude: '',
    pickupTime: '',
    dropTime: '',
    estimatedStudents: ''
  });

  useEffect(() => {
    if (route) {
      setFormData({
        name: route.name || '',
        code: route.code || '',
        type: route.type || 'Morning Pickup',
        vehicleId: route.vehicleId || '',
        driverId: route.driverId || '',
        startTime: route.startTime || '',
        endTime: route.endTime || '',
        maxCapacity: route.maxCapacity || '',
        status: route.status || 'Active',
        stops: route.stops || []
      });
    }
  }, [route]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleStopInputChange = (field, value) => {
    setCurrentStop(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Route name is required';
    if (!formData.code.trim()) newErrors.code = 'Route code is required';
    if (!formData.startTime) newErrors.startTime = 'Start time is required';
    if (!formData.endTime) newErrors.endTime = 'End time is required';
    if (!formData.maxCapacity || formData.maxCapacity <= 0) newErrors.maxCapacity = 'Valid capacity is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStop = () => {
    return currentStop.name.trim() && 
           currentStop.landmark.trim() && 
           currentStop.latitude && 
           currentStop.longitude;
  };

  const handleAddStop = () => {
    if (validateStop()) {
      const newStop = {
        ...currentStop,
        Id: Date.now(),
        sequence: editingStopIndex !== null ? formData.stops[editingStopIndex].sequence : formData.stops.length + 1,
        estimatedStudents: parseInt(currentStop.estimatedStudents) || 0,
        actualStudents: parseInt(currentStop.estimatedStudents) || 0
      };

      if (editingStopIndex !== null) {
        // Update existing stop
        const updatedStops = [...formData.stops];
        updatedStops[editingStopIndex] = newStop;
        setFormData(prev => ({ ...prev, stops: updatedStops }));
        setEditingStopIndex(null);
      } else {
        // Add new stop
        setFormData(prev => ({ ...prev, stops: [...prev.stops, newStop] }));
      }

      setCurrentStop({
        name: '',
        landmark: '',
        latitude: '',
        longitude: '',
        pickupTime: '',
        dropTime: '',
        estimatedStudents: ''
      });
      setShowStopForm(false);
    }
  };

  const handleEditStop = (index) => {
    setCurrentStop(formData.stops[index]);
    setEditingStopIndex(index);
    setShowStopForm(true);
  };

  const handleDeleteStop = (index) => {
    const updatedStops = formData.stops.filter((_, i) => i !== index);
    // Reorder sequences
    const reorderedStops = updatedStops.map((stop, i) => ({ ...stop, sequence: i + 1 }));
    setFormData(prev => ({ ...prev, stops: reorderedStops }));
  };

  const handleMoveStop = (index, direction) => {
    const newStops = [...formData.stops];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newStops.length) {
      [newStops[index], newStops[targetIndex]] = [newStops[targetIndex], newStops[index]];
      // Update sequences
      newStops.forEach((stop, i) => {
        stop.sequence = i + 1;
      });
      setFormData(prev => ({ ...prev, stops: newStops }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Failed to save route:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const typeOptions = [
    { value: 'Morning Pickup', label: 'Morning Pickup' },
    { value: 'Afternoon Drop', label: 'Afternoon Drop' },
    { value: 'Both', label: 'Both' }
  ];

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' }
  ];

  const vehicleOptions = vehicles.map(vehicle => ({
    value: vehicle.Id,
    label: `${vehicle.vehicleNumber} - ${vehicle.brand} ${vehicle.model}`
  }));

  const driverOptions = drivers.map(driver => ({
    value: driver.Id,
    label: `${driver.name} - ${driver.employeeId}`
  }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {route ? 'Edit Route' : 'Create New Route'}
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
                    label="Route Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter route name"
                    error={errors.name}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Route Code"
                    value={formData.code}
                    onChange={(e) => handleInputChange('code', e.target.value)}
                    placeholder="Enter route code"
                    error={errors.code}
                    required
                  />
                </div>
                <div>
                  <Select
                    label="Route Type"
                    value={formData.type}
                    onChange={(value) => handleInputChange('type', value)}
                    options={typeOptions}
                    required
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

            {/* Timing & Capacity */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Timing & Capacity</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Input
                    label="Start Time"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                    error={errors.startTime}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="End Time"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                    error={errors.endTime}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Max Capacity"
                    type="number"
                    value={formData.maxCapacity}
                    onChange={(e) => handleInputChange('maxCapacity', e.target.value)}
                    placeholder="Enter max capacity"
                    error={errors.maxCapacity}
                    min="1"
                    required
                  />
                </div>
              </div>
            </Card>

            {/* Vehicle & Driver Assignment */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle & Driver Assignment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Select
                    label="Assigned Vehicle"
                    value={formData.vehicleId}
                    onChange={(value) => handleInputChange('vehicleId', value)}
                    options={[{ value: '', label: 'Select Vehicle' }, ...vehicleOptions]}
                  />
                </div>
                <div>
                  <Select
                    label="Assigned Driver"
                    value={formData.driverId}
                    onChange={(value) => handleInputChange('driverId', value)}
                    options={[{ value: '', label: 'Select Driver' }, ...driverOptions]}
                  />
                </div>
              </div>
            </Card>

            {/* Route Stops */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Route Stops</h3>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowStopForm(true)}
                  className="flex items-center"
                >
                  <ApperIcon name="Plus" size={16} className="mr-2" />
                  Add Stop
                </Button>
              </div>

              {formData.stops.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ApperIcon name="MapPin" size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>No stops added yet. Click "Add Stop" to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.stops.map((stop, index) => (
                    <div key={stop.Id || index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center mr-4">
                        <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                          {index + 1}
                        </div>
                        <div className="flex flex-col space-y-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveStop(index, 'up')}
                            disabled={index === 0}
                            className="p-1"
                          >
                            <ApperIcon name="ChevronUp" size={16} />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveStop(index, 'down')}
                            disabled={index === formData.stops.length - 1}
                            className="p-1"
                          >
                            <ApperIcon name="ChevronDown" size={16} />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{stop.name}</h4>
                        <p className="text-sm text-gray-600">{stop.landmark}</p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                          <span>📍 {stop.latitude}, {stop.longitude}</span>
                          {stop.pickupTime && <span>🕐 {stop.pickupTime}</span>}
                          <span>👥 {stop.estimatedStudents} students</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditStop(index)}
                        >
                          <ApperIcon name="Edit" size={16} />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteStop(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <ApperIcon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Stop Form Modal */}
            {showStopForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <Card className="w-full max-w-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {editingStopIndex !== null ? 'Edit Stop' : 'Add New Stop'}
                    </h3>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setShowStopForm(false);
                        setEditingStopIndex(null);
                        setCurrentStop({
                          name: '',
                          landmark: '',
                          latitude: '',
                          longitude: '',
                          pickupTime: '',
                          dropTime: '',
                          estimatedStudents: ''
                        });
                      }}
                    >
                      <ApperIcon name="X" size={20} />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <Input
                        label="Stop Name"
                        value={currentStop.name}
                        onChange={(e) => handleStopInputChange('name', e.target.value)}
                        placeholder="Enter stop name"
                        required
                      />
                    </div>
                    <div>
                      <Input
                        label="Landmark"
                        value={currentStop.landmark}
                        onChange={(e) => handleStopInputChange('landmark', e.target.value)}
                        placeholder="Enter landmark description"
                        required
                      />
                    </div>
                    <div>
                      <Input
                        label="Latitude"
                        type="number"
                        step="any"
                        value={currentStop.latitude}
                        onChange={(e) => handleStopInputChange('latitude', e.target.value)}
                        placeholder="Enter latitude"
                        required
                      />
                    </div>
                    <div>
                      <Input
                        label="Longitude"
                        type="number"
                        step="any"
                        value={currentStop.longitude}
                        onChange={(e) => handleStopInputChange('longitude', e.target.value)}
                        placeholder="Enter longitude"
                        required
                      />
                    </div>
                    <div>
                      <Input
                        label="Pickup Time"
                        type="time"
                        value={currentStop.pickupTime}
                        onChange={(e) => handleStopInputChange('pickupTime', e.target.value)}
                      />
                    </div>
                    <div>
                      <Input
                        label="Drop Time"
                        type="time"
                        value={currentStop.dropTime}
                        onChange={(e) => handleStopInputChange('dropTime', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <Input
                      label="Estimated Students"
                      type="number"
                      value={currentStop.estimatedStudents}
                      onChange={(e) => handleStopInputChange('estimatedStudents', e.target.value)}
                      placeholder="Enter estimated number of students"
                      min="0"
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowStopForm(false);
                        setEditingStopIndex(null);
                        setCurrentStop({
                          name: '',
                          landmark: '',
                          latitude: '',
                          longitude: '',
                          pickupTime: '',
                          dropTime: '',
                          estimatedStudents: ''
                        });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleAddStop}
                      disabled={!validateStop()}
                    >
                      {editingStopIndex !== null ? 'Update Stop' : 'Add Stop'}
                    </Button>
                  </div>
                </Card>
              </div>
            )}
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
            {route ? 'Update Route' : 'Create Route'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RouteForm;