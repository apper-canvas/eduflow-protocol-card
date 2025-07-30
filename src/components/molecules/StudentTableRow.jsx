import React from 'react';
import { format } from 'date-fns';
import Badge from '@/components/atoms/Badge';

const StudentTableRow = ({ student, onClick }) => {
  const handleClick = () => {
    onClick(student);
  };

  return (
    <tr 
      className="hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 cursor-pointer transition-all duration-200 border-b border-gray-100"
      onClick={handleClick}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <img 
            className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-md" 
            src={student.photo} 
            alt={`${student.firstName} ${student.lastName}`}
          />
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {student.firstName} {student.lastName}
            </div>
            <div className="text-sm text-gray-500">ID: {student.rollNumber}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{student.class}</div>
        <div className="text-sm text-gray-500">Section {student.section}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {format(new Date(student.admissionDate), 'MMM dd, yyyy')}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge 
          variant={student.status === 'Active' ? 'active' : 'inactive'}
          size="sm"
        >
          {student.status}
        </Badge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {student.bloodGroup}
      </td>
    </tr>
  );
};

export default StudentTableRow;