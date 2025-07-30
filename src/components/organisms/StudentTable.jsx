import React from 'react';
import StudentTableRow from '@/components/molecules/StudentTableRow';
import ApperIcon from '@/components/ApperIcon';

const StudentTable = ({ students, onStudentClick, onSort, sortField, sortOrder }) => {
  const handleSort = (field) => {
    if (onSort) {
      onSort(field);
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return <ApperIcon name="ArrowUpDown" className="w-4 h-4 text-gray-300" />;
    }
    return sortOrder === 'asc' 
      ? <ApperIcon name="ArrowUp" className="w-4 h-4 text-primary-500" />
      : <ApperIcon name="ArrowDown" className="w-4 h-4 text-primary-500" />;
  };

  if (!students || students.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200">
        <div className="p-12 text-center">
          <ApperIcon name="Users" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                onClick={() => handleSort('firstName')}
              >
                <div className="flex items-center space-x-1">
                  <span>Student</span>
                  <SortIcon field="firstName" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                onClick={() => handleSort('class')}
              >
                <div className="flex items-center space-x-1">
                  <span>Class</span>
                  <SortIcon field="class" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                onClick={() => handleSort('admissionDate')}
              >
                <div className="flex items-center space-x-1">
                  <span>Admission Date</span>
                  <SortIcon field="admissionDate" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Blood Group
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <StudentTableRow
                key={student.Id}
                student={student}
                onClick={onStudentClick}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentTable;