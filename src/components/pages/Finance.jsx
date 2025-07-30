import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import SearchBar from '@/components/molecules/SearchBar';
import FilterDropdown from '@/components/molecules/FilterDropdown';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import FeeStructureForm from '@/components/organisms/FeeStructureForm';
import { feeService } from '@/services/api/feeService';

const Finance = () => {
  const [feeStructures, setFeeStructures] = useState([]);
  const [filteredStructures, setFilteredStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryType, setSelectedCategoryType] = useState('');
  const [selectedTermType, setSelectedTermType] = useState('');
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [sortField, setSortField] = useState('categoryName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedStructures, setSelectedStructures] = useState([]);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);
  const [editingStructure, setEditingStructure] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load fee structures
  const loadFeeStructures = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await feeService.getAll();
      setFeeStructures(data);
    } catch (err) {
      setError('Failed to load fee structures');
      console.error('Error loading fee structures:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeeStructures();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...feeStructures];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(structure =>
        structure.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        structure.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category type filter
    if (selectedCategoryType) {
      filtered = filtered.filter(structure => structure.categoryType === selectedCategoryType);
    }

    // Term type filter
    if (selectedTermType) {
      filtered = filtered.filter(structure => structure.termType === selectedTermType);
    }

    // Class filter
    if (selectedClasses.length > 0) {
      filtered = filtered.filter(structure =>
        selectedClasses.some(cls => structure.classes.includes(cls))
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredStructures(filtered);
  }, [feeStructures, searchQuery, selectedCategoryType, selectedTermType, selectedClasses, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleCreateStructure = async (structureData) => {
    try {
      setIsSubmitting(true);
      const newStructure = await feeService.create(structureData);
      setFeeStructures(prev => [...prev, newStructure]);
      setShowCreateModal(false);
      toast.success('Fee structure created successfully');
    } catch (error) {
      toast.error('Failed to create fee structure');
      console.error('Error creating fee structure:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStructure = async (structureData) => {
    try {
      setIsSubmitting(true);
      const updatedStructure = await feeService.update(editingStructure.Id, structureData);
      setFeeStructures(prev => prev.map(s => s.Id === updatedStructure.Id ? updatedStructure : s));
      setShowEditModal(false);
      setEditingStructure(null);
      toast.success('Fee structure updated successfully');
    } catch (error) {
      toast.error('Failed to update fee structure');
      console.error('Error updating fee structure:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStructure = async (id) => {
    if (window.confirm('Are you sure you want to delete this fee structure?')) {
      try {
        await feeService.delete(id);
        setFeeStructures(prev => prev.filter(s => s.Id !== id));
        toast.success('Fee structure deleted successfully');
      } catch (error) {
        toast.error('Failed to delete fee structure');
        console.error('Error deleting fee structure:', error);
      }
    }
  };

  const handleToggleActive = async (structure) => {
    try {
      const updatedStructure = await feeService.update(structure.Id, {
        isActive: !structure.isActive
      });
      setFeeStructures(prev => prev.map(s => s.Id === updatedStructure.Id ? updatedStructure : s));
      toast.success(`Fee structure ${updatedStructure.isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      toast.error('Failed to update fee structure status');
      console.error('Error updating fee structure status:', error);
    }
  };

  const handleBulkUpdate = async (updateData) => {
    try {
      setIsSubmitting(true);
      const updates = selectedStructures.map(id => ({ Id: id, ...updateData }));
      await feeService.bulkUpdate(updates);
      await loadFeeStructures();
      setSelectedStructures([]);
      setShowBulkUpdateModal(false);
      toast.success(`${updates.length} fee structures updated successfully`);
    } catch (error) {
      toast.error('Failed to bulk update fee structures');
      console.error('Error bulk updating fee structures:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectStructure = (id) => {
    setSelectedStructures(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedStructures.length === filteredStructures.length) {
      setSelectedStructures([]);
    } else {
      setSelectedStructures(filteredStructures.map(s => s.Id));
    }
  };

  const categoryTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'Academic', label: 'Academic' },
    { value: 'Service', label: 'Service' },
    { value: 'Facility', label: 'Facility' },
    { value: 'Activity', label: 'Activity' },
    { value: 'Special', label: 'Special' }
  ];

  const termTypeOptions = [
    { value: '', label: 'All Terms' },
    { value: 'Monthly', label: 'Monthly' },
    { value: 'Quarterly', label: 'Quarterly' },
    { value: 'Annual', label: 'Annual' }
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

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadFeeStructures} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Structure Management</h1>
          <p className="text-gray-600 mt-1">Manage class-wise fee categories, terms, and policies</p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          {selectedStructures.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setShowBulkUpdateModal(true)}
            >
              <ApperIcon name="Edit" className="h-4 w-4 mr-2" />
              Bulk Update ({selectedStructures.length})
            </Button>
          )}
          <Button onClick={() => setShowCreateModal(true)}>
            <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
            Create Fee Structure
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search fee structures..."
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <FilterDropdown
              label="Category Type"
              value={selectedCategoryType}
              onChange={setSelectedCategoryType}
              options={categoryTypeOptions}
            />
            <FilterDropdown
              label="Term Type"
              value={selectedTermType}
              onChange={setSelectedTermType}
              options={termTypeOptions}
            />
            <FilterDropdown
              label="Class"
              value={selectedClasses}
              onChange={setSelectedClasses}
              options={classOptions}
              multiple
            />
          </div>
        </div>
      </Card>

      {/* Fee Structures Table */}
      <Card>
        {filteredStructures.length === 0 ? (
          <Empty
            title="No Fee Structures Found"
            description="Create your first fee structure to get started"
            icon="DollarSign"
            actionButton={
              <Button onClick={() => setShowCreateModal(true)}>
                <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
                Create Fee Structure
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedStructures.length === filteredStructures.length}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('categoryName')}
                  >
                    <div className="flex items-center">
                      Category Name
                      <ApperIcon name="ArrowUpDown" className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type & Term
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Classes
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('baseAmount')}
                  >
                    <div className="flex items-center">
                      Base Amount
                      <ApperIcon name="ArrowUpDown" className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Policies
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStructures.map((structure) => (
                  <tr key={structure.Id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedStructures.includes(structure.Id)}
                        onChange={() => handleSelectStructure(structure.Id)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {structure.categoryName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {structure.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {structure.categoryType}
                        </Badge>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {structure.termType}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {structure.classes.slice(0, 3).map(cls => (
                          <Badge key={cls} variant="secondary" size="sm">
                            {cls}
                          </Badge>
                        ))}
                        {structure.classes.length > 3 && (
                          <Badge variant="secondary" size="sm">
                            +{structure.classes.length - 3}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ₹{structure.baseAmount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {structure.discountRules.length > 0 && (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                            {structure.discountRules.length} Discounts
                          </Badge>
                        )}
                        {structure.lateFeePolicy.enabled && (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            Late Fee
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={structure.isActive ? 'success' : 'secondary'}
                        className="cursor-pointer"
                        onClick={() => handleToggleActive(structure)}
                      >
                        {structure.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingStructure(structure);
                            setShowEditModal(true);
                          }}
                        >
                          <ApperIcon name="Edit" className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteStructure(structure.Id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <ApperIcon name="Trash2" className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Create Fee Structure</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCreateModal(false)}
                  >
                    <ApperIcon name="X" className="h-5 w-5" />
                  </Button>
                </div>
                <FeeStructureForm
                  onSubmit={handleCreateStructure}
                  onCancel={() => setShowCreateModal(false)}
                  isSubmitting={isSubmitting}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingStructure && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Edit Fee Structure</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingStructure(null);
                    }}
                  >
                    <ApperIcon name="X" className="h-5 w-5" />
                  </Button>
                </div>
                <FeeStructureForm
                  feeStructure={editingStructure}
                  onSubmit={handleUpdateStructure}
                  onCancel={() => {
                    setShowEditModal(false);
                    setEditingStructure(null);
                  }}
                  isSubmitting={isSubmitting}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;