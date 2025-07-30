import React, { useState, useEffect } from 'react';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import ApperIcon from '@/components/ApperIcon';

const FeeStructureForm = ({ feeStructure, onSubmit, onCancel, isSubmitting = false }) => {
  const [formData, setFormData] = useState({
    categoryName: '',
    categoryType: 'Academic',
    description: '',
    isActive: true,
    classes: [],
    termType: 'Monthly',
    baseAmount: '',
    discountRules: [],
    lateFeePolicy: {
      enabled: false,
      gracePeriod: 10,
      feeType: 'Fixed',
      amount: '',
      percentage: '',
      maxAmount: ''
    }
  });

  const [errors, setErrors] = useState({});
  const [newDiscountRule, setNewDiscountRule] = useState({
    type: '',
    percentage: '',
    conditions: ''
  });

  useEffect(() => {
    if (feeStructure) {
      setFormData({
        categoryName: feeStructure.categoryName || '',
        categoryType: feeStructure.categoryType || 'Academic',
        description: feeStructure.description || '',
        isActive: feeStructure.isActive !== undefined ? feeStructure.isActive : true,
        classes: feeStructure.classes || [],
        termType: feeStructure.termType || 'Monthly',
        baseAmount: feeStructure.baseAmount || '',
        discountRules: feeStructure.discountRules || [],
        lateFeePolicy: {
          enabled: feeStructure.lateFeePolicy?.enabled || false,
          gracePeriod: feeStructure.lateFeePolicy?.gracePeriod || 10,
          feeType: feeStructure.lateFeePolicy?.feeType || 'Fixed',
          amount: feeStructure.lateFeePolicy?.amount || '',
          percentage: feeStructure.lateFeePolicy?.percentage || '',
          maxAmount: feeStructure.lateFeePolicy?.maxAmount || ''
        }
      });
    }
  }, [feeStructure]);

  const categoryTypeOptions = [
    { value: 'Academic', label: 'Academic' },
    { value: 'Service', label: 'Service' },
    { value: 'Facility', label: 'Facility' },
    { value: 'Activity', label: 'Activity' },
    { value: 'Special', label: 'Special' }
  ];

  const classOptions = [
    { value: '6th', label: '6th Grade' },
    { value: '7th', label: '7th Grade' },
    { value: '8th', label: '8th Grade' },
    { value: '9th', label: '9th Grade' },
    { value: '10th', label: '10th Grade' },
    { value: '11th', label: '11th Grade' },
    { value: '12th', label: '12th Grade' }
  ];

  const termTypeOptions = [
    { value: 'Monthly', label: 'Monthly' },
    { value: 'Quarterly', label: 'Quarterly' },
    { value: 'Annual', label: 'Annual' }
  ];

  const feeTypeOptions = [
    { value: 'Fixed', label: 'Fixed Amount' },
    { value: 'Percentage', label: 'Percentage' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleClassToggle = (classValue) => {
    setFormData(prev => ({
      ...prev,
      classes: prev.classes.includes(classValue)
        ? prev.classes.filter(c => c !== classValue)
        : [...prev.classes, classValue]
    }));
  };

  const handleLateFeeChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      lateFeePolicy: {
        ...prev.lateFeePolicy,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const handleAddDiscountRule = () => {
    if (newDiscountRule.type && newDiscountRule.percentage && newDiscountRule.conditions) {
      const rule = {
        id: Date.now(),
        ...newDiscountRule,
        percentage: parseFloat(newDiscountRule.percentage)
      };
      
      setFormData(prev => ({
        ...prev,
        discountRules: [...prev.discountRules, rule]
      }));
      
      setNewDiscountRule({ type: '', percentage: '', conditions: '' });
    }
  };

  const handleRemoveDiscountRule = (ruleId) => {
    setFormData(prev => ({
      ...prev,
      discountRules: prev.discountRules.filter(rule => rule.id !== ruleId)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.categoryName.trim()) {
      newErrors.categoryName = 'Category name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.classes.length === 0) {
      newErrors.classes = 'At least one class must be selected';
    }

    if (!formData.baseAmount || parseFloat(formData.baseAmount) <= 0) {
      newErrors.baseAmount = 'Valid base amount is required';
    }

    if (formData.lateFeePolicy.enabled) {
      if (!formData.lateFeePolicy.gracePeriod || parseInt(formData.lateFeePolicy.gracePeriod) < 0) {
        newErrors.gracePeriod = 'Valid grace period is required';
      }

      if (formData.lateFeePolicy.feeType === 'Fixed' && !formData.lateFeePolicy.amount) {
        newErrors.lateFeeAmount = 'Late fee amount is required';
      }

      if (formData.lateFeePolicy.feeType === 'Percentage' && !formData.lateFeePolicy.percentage) {
        newErrors.lateFeePercentage = 'Late fee percentage is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      baseAmount: parseFloat(formData.baseAmount),
      lateFeePolicy: {
        ...formData.lateFeePolicy,
        gracePeriod: parseInt(formData.lateFeePolicy.gracePeriod),
        amount: formData.lateFeePolicy.amount ? parseFloat(formData.lateFeePolicy.amount) : null,
        percentage: formData.lateFeePolicy.percentage ? parseFloat(formData.lateFeePolicy.percentage) : null,
        maxAmount: formData.lateFeePolicy.maxAmount ? parseFloat(formData.lateFeePolicy.maxAmount) : null
      }
    };

    await onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ApperIcon name="Info" className="h-5 w-5 mr-2 text-primary-600" />
          Basic Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Category Name"
            name="categoryName"
            value={formData.categoryName}
            onChange={handleInputChange}
            error={errors.categoryName}
            required
          />
          
          <Select
            label="Category Type"
            name="categoryType"
            value={formData.categoryType}
            onChange={handleInputChange}
            options={categoryTypeOptions}
            required
          />
        </div>

        <Input
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          error={errors.description}
          className="mt-4"
          required
        />

        <div className="mt-4 flex items-center">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={handleInputChange}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
            Active Status
          </label>
        </div>
      </Card>

      {/* Fee Configuration */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ApperIcon name="DollarSign" className="h-5 w-5 mr-2 text-green-600" />
          Fee Configuration
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Term Type"
            name="termType"
            value={formData.termType}
            onChange={handleInputChange}
            options={termTypeOptions}
            required
          />
          
          <Input
            label="Base Amount (₹)"
            name="baseAmount"
            type="number"
            value={formData.baseAmount}
            onChange={handleInputChange}
            error={errors.baseAmount}
            required
          />
        </div>
      </Card>

      {/* Class Selection */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ApperIcon name="Users" className="h-5 w-5 mr-2 text-blue-600" />
          Applicable Classes
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {classOptions.map(option => (
            <label key={option.value} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.classes.includes(option.value)}
                onChange={() => handleClassToggle(option.value)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
        
        {errors.classes && (
          <p className="mt-2 text-sm text-red-600">{errors.classes}</p>
        )}
      </Card>

      {/* Discount Rules */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ApperIcon name="Percent" className="h-5 w-5 mr-2 text-orange-600" />
          Discount Rules
        </h3>
        
        {/* Existing Rules */}
        {formData.discountRules.length > 0 && (
          <div className="mb-4 space-y-2">
            {formData.discountRules.map(rule => (
              <div key={rule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium">{rule.type}</span>
                  <span className="text-gray-600 ml-2">({rule.percentage}%)</span>
                  <p className="text-sm text-gray-500">{rule.conditions}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveDiscountRule(rule.id)}
                >
                  <ApperIcon name="X" className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add New Rule */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input
            placeholder="Discount Type"
            value={newDiscountRule.type}
            onChange={(e) => setNewDiscountRule(prev => ({ ...prev, type: e.target.value }))}
          />
          <Input
            placeholder="Percentage"
            type="number"
            value={newDiscountRule.percentage}
            onChange={(e) => setNewDiscountRule(prev => ({ ...prev, percentage: e.target.value }))}
          />
          <Input
            placeholder="Conditions"
            value={newDiscountRule.conditions}
            onChange={(e) => setNewDiscountRule(prev => ({ ...prev, conditions: e.target.value }))}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleAddDiscountRule}
            disabled={!newDiscountRule.type || !newDiscountRule.percentage || !newDiscountRule.conditions}
          >
            <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
            Add Rule
          </Button>
        </div>
      </Card>

      {/* Late Fee Policy */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ApperIcon name="Clock" className="h-5 w-5 mr-2 text-red-600" />
          Late Fee Policy
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="lateFeeEnabled"
              name="enabled"
              checked={formData.lateFeePolicy.enabled}
              onChange={handleLateFeeChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="lateFeeEnabled" className="ml-2 text-sm text-gray-700">
              Enable Late Fee Policy
            </label>
          </div>

          {formData.lateFeePolicy.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <Input
                label="Grace Period (days)"
                name="gracePeriod"
                type="number"
                value={formData.lateFeePolicy.gracePeriod}
                onChange={handleLateFeeChange}
                error={errors.gracePeriod}
              />
              
              <Select
                label="Fee Type"
                name="feeType"
                value={formData.lateFeePolicy.feeType}
                onChange={handleLateFeeChange}
                options={feeTypeOptions}
              />

              {formData.lateFeePolicy.feeType === 'Fixed' ? (
                <Input
                  label="Late Fee Amount (₹)"
                  name="amount"
                  type="number"
                  value={formData.lateFeePolicy.amount}
                  onChange={handleLateFeeChange}
                  error={errors.lateFeeAmount}
                />
              ) : (
                <Input
                  label="Late Fee Percentage (%)"
                  name="percentage"
                  type="number"
                  value={formData.lateFeePolicy.percentage}
                  onChange={handleLateFeeChange}
                  error={errors.lateFeePercentage}
                />
              )}

              <Input
                label="Maximum Late Fee (₹)"
                name="maxAmount"
                type="number"
                value={formData.lateFeePolicy.maxAmount}
                onChange={handleLateFeeChange}
                className="md:col-span-3"
              />
            </div>
          )}
        </div>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
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
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <ApperIcon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
              {feeStructure ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <ApperIcon name="Save" className="h-4 w-4 mr-2" />
              {feeStructure ? 'Update Fee Structure' : 'Create Fee Structure'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default FeeStructureForm;