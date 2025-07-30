import feeStructuresData from "@/services/mockData/feeStructures.json";
import React from "react";
import Error from "@/components/ui/Error";

// Local storage key
const STORAGE_KEY = 'eduflow_fee_structures';

// Initialize data in localStorage if not exists
const initializeData = () => {
  const existingData = localStorage.getItem(STORAGE_KEY);
  if (!existingData) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(feeStructuresData));
  }
};

// Get data from localStorage
const getData = () => {
  initializeData();
  const data = localStorage.getItem(STORAGE_KEY);
  return JSON.parse(data);
};

// Save data to localStorage
const saveData = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// Get next available ID
const getNextId = (data) => {
  return Math.max(...data.map(item => item.Id), 0) + 1;
};

export const feeService = {
  // Get all fee structures
  getAll: () => {
    try {
      const data = getData();
      return [...data];
    } catch (error) {
      console.error('Error fetching fee structures:', error);
      return [];
    }
  },

  // Get fee structure by ID
  getById: (id) => {
    if (!id || typeof id !== 'number') {
      throw new Error('Valid fee structure ID is required');
    }
    
    try {
      const data = getData();
      const feeStructure = data.find(item => item.Id === id);
      return feeStructure ? { ...feeStructure } : null;
    } catch (error) {
      console.error('Error fetching fee structure:', error);
      return null;
    }
  },

  // Create new fee structure
  create: (feeStructureData) => {
    try {
      const data = getData();
      const newFeeStructure = {
        ...feeStructureData,
        Id: getNextId(data),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      data.push(newFeeStructure);
      saveData(data);
      return { ...newFeeStructure };
    } catch (error) {
      console.error('Error creating fee structure:', error);
      throw new Error('Failed to create fee structure');
    }
  },

  // Update fee structure
  update: (id, updateData) => {
    if (!id || typeof id !== 'number') {
      throw new Error('Valid fee structure ID is required');
    }

    try {
      const data = getData();
      const index = data.findIndex(item => item.Id === id);
      
      if (index === -1) {
        throw new Error('Fee structure not found');
      }

      const updatedFeeStructure = {
        ...data[index],
        ...updateData,
        Id: id, // Ensure ID doesn't change
        updatedAt: new Date().toISOString()
      };

      data[index] = updatedFeeStructure;
      saveData(data);
      return { ...updatedFeeStructure };
    } catch (error) {
      console.error('Error updating fee structure:', error);
      throw new Error('Failed to update fee structure');
    }
  },

  // Delete fee structure
  delete: (id) => {
    if (!id || typeof id !== 'number') {
      throw new Error('Valid fee structure ID is required');
    }

    try {
      const data = getData();
      const index = data.findIndex(item => item.Id === id);
      
      if (index === -1) {
        throw new Error('Fee structure not found');
      }

      const deletedFeeStructure = { ...data[index] };
      data.splice(index, 1);
      saveData(data);
      return deletedFeeStructure;
    } catch (error) {
      console.error('Error deleting fee structure:', error);
      throw new Error('Failed to delete fee structure');
    }
  },

  // Bulk update fee structures
  bulkUpdate: (updates) => {
    try {
      const data = getData();
      const updatedStructures = [];

      updates.forEach(update => {
        const index = data.findIndex(item => item.Id === update.Id);
        if (index !== -1) {
          const updatedItem = {
            ...data[index],
            ...update,
            updatedAt: new Date().toISOString()
          };
          data[index] = updatedItem;
          updatedStructures.push({ ...updatedItem });
        }
      });

      saveData(data);
      return updatedStructures;
    } catch (error) {
      console.error('Error bulk updating fee structures:', error);
      throw new Error('Failed to bulk update fee structures');
    }
  },

  // Get fee structures by class
  getByClass: (className) => {
    try {
      const data = getData();
      return data.filter(structure => 
        structure.classes.includes(className) && structure.isActive
      ).map(item => ({ ...item }));
    } catch (error) {
      console.error('Error fetching fee structures by class:', error);
      return [];
    }
  },

  // Get fee structures by category type
getByCategoryType: (categoryType) => {
    try {
      const data = getData();
      return data.filter(structure => 
        structure.categoryType === categoryType && structure.isActive
      ).map(item => ({ ...item }));
    } catch (error) {
      console.error('Error fetching fee structures by category type:', error);
      return [];
    }
  },
  // Financial Analytics Methods
  getRevenueAnalysis: (startDate, endDate) => {
    try {
      const data = getData();
      const totalRevenue = data.reduce((sum, fee) => sum + fee.baseAmount * 50, 0); // Assuming 50 students average
      
      return {
        totalRevenue,
        monthlyBreakdown: [
          { month: 'Jan', amount: totalRevenue * 0.15 },
          { month: 'Feb', amount: totalRevenue * 0.18 },
          { month: 'Mar', amount: totalRevenue * 0.16 },
          { month: 'Apr', amount: totalRevenue * 0.20 },
          { month: 'May', amount: totalRevenue * 0.17 },
          { month: 'Jun', amount: totalRevenue * 0.14 }
        ],
        categoryBreakdown: data.map(fee => ({
          category: fee.categoryName,
          amount: fee.baseAmount * 50,
          percentage: ((fee.baseAmount * 50) / totalRevenue * 100).toFixed(1)
        }))
      };
    } catch (error) {
      console.error('Error calculating revenue analysis:', error);
      return null;
    }
  },

  getCollectionStats: (period = 'current_month') => {
    try {
      const data = getData();
      const totalExpected = data.reduce((sum, fee) => sum + fee.baseAmount * 50, 0);
      const totalCollected = totalExpected * 0.892; // 89.2% collection rate
      
      return {
        expected: totalExpected,
        collected: totalCollected,
        outstanding: totalExpected - totalCollected,
        rate: 89.2,
        categoryWise: data.map(fee => ({
          category: fee.categoryName,
          expected: fee.baseAmount * 50,
          collected: fee.baseAmount * 50 * 0.892,
          rate: 89.2
        }))
      };
    } catch (error) {
      console.error('Error calculating collection stats:', error);
      return null;
    }
  },

  getPaymentTrends: () => {
    try {
      return {
        methods: [
          { name: 'Online Payment', percentage: 65, trend: '+5%' },
          { name: 'Cash', percentage: 25, trend: '-3%' },
          { name: 'Cheque', percentage: 8, trend: '-1%' },
          { name: 'Bank Transfer', percentage: 2, trend: '+1%' }
        ],
        monthly: [
          { month: 'Jan', online: 60, cash: 30, cheque: 8, transfer: 2 },
          { month: 'Feb', online: 62, cash: 28, cheque: 8, transfer: 2 },
          { month: 'Mar', online: 65, cash: 25, cheque: 8, transfer: 2 }
        ]
      };
} catch (error) {
      console.error('Error fetching payment trends:', error);
      return null;
    }
  }
};