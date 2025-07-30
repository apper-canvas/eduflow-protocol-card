import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StudentTable from '@/components/organisms/StudentTable';
import StudentProfile from '@/components/organisms/StudentProfile';
import StudentForm from '@/components/organisms/StudentForm';
import SearchBar from '@/components/molecules/SearchBar';
import FilterDropdown from '@/components/molecules/FilterDropdown';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import ApperIcon from '@/components/ApperIcon';
import { studentService } from '@/services/api/studentService';
import { parentService } from '@/services/api/parentService';
import { toast } from 'react-toastify';

const Students = () => {
  const { id, action } = useParams();
  const navigate = useNavigate();
  
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [sortField, setSortField] = useState('firstName');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // View state
  const [currentView, setCurrentView] = useState('list'); // list, profile, form

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    // Handle routing
    if (id && action === 'edit') {
      handleEditStudent(parseInt(id));
    } else if (id && !action) {
      handleViewStudent(parseInt(id));
    } else if (action === 'new') {
      setCurrentView('form');
      setSelectedStudent(null);
    } else {
      setCurrentView('list');
      setSelectedStudent(null);
    }
  }, [id, action]);

  useEffect(() => {
    filterAndSortStudents();
  }, [students, searchQuery, classFilter, sectionFilter, sortField, sortOrder]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await studentService.getAll();
      setStudents(data);
    } catch (err) {
      setError('Failed to load students');
      console.error('Students loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortStudents = () => {
    let filtered = [...students];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(student =>
        student.firstName.toLowerCase().includes(query) ||
        student.lastName.toLowerCase().includes(query) ||
        student.rollNumber.toLowerCase().includes(query) ||
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(query)
      );
    }

    // Class filter
    if (classFilter) {
      filtered = filtered.filter(student => student.class === classFilter);
    }

    // Section filter
    if (sectionFilter) {
      filtered = filtered.filter(student => student.section === sectionFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'firstName') {
        aVal = `${a.firstName} ${a.lastName}`;
        bVal = `${b.firstName} ${b.lastName}`;
      }

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

    setFilteredStudents(filtered);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleStudentClick = (student) => {
    navigate(`/students/${student.Id}`);
  };

  const handleViewStudent = async (studentId) => {
    try {
      const student = await studentService.getById(studentId);
      setSelectedStudent(student);
      setCurrentView('profile');
    } catch (err) {
      toast.error('Student not found');
      navigate('/students');
    }
  };

  const handleEditStudent = async (studentId) => {
    try {
      const student = await studentService.getById(studentId);
      setSelectedStudent(student);
      setCurrentView('form');
    } catch (err) {
      toast.error('Student not found');
      navigate('/students');
    }
  };

  const handleAddStudent = () => {
    navigate('/students/new');
  };

  const handleFormSubmit = async (studentData, parentData) => {
    try {
      let savedStudent;
      
      if (selectedStudent) {
        // Update existing student
        savedStudent = await studentService.update(selectedStudent.Id, studentData);
        toast.success('Student updated successfully!');
      } else {
        // Create new student
        savedStudent = await studentService.create(studentData);
        
        // Create parent information
        if (parentData.fatherName || parentData.motherName || parentData.primaryContact) {
          await parentService.create({
            ...parentData,
            studentId: savedStudent.Id.toString()
          });
        }
        
        toast.success('Student added successfully!');
      }
      
      await loadStudents();
      navigate('/students');
    } catch (err) {
      toast.error('Failed to save student');
      console.error('Save error:', err);
    }
  };

  const handleBack = () => {
    navigate('/students');
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

  if (currentView === 'profile' && selectedStudent) {
    return (
      <StudentProfile
        student={selectedStudent}
        onEdit={handleEditStudent}
        onBack={handleBack}
      />
    );
  }

  if (currentView === 'form') {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="p-2"
          >
            <ApperIcon name="ArrowLeft" className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold gradient-text font-display">
            {selectedStudent ? 'Edit Student' : 'Add New Student'}
          </h1>
        </div>
        
        <StudentForm
          onSubmit={handleFormSubmit}
          initialData={selectedStudent}
          onCancel={handleBack}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold gradient-text font-display">Students</h1>
          <p className="text-gray-600">Manage student records and profiles</p>
        </div>
        <Button
          variant="primary"
          onClick={handleAddStudent}
          className="flex items-center"
        >
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          Add Student
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-end space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search students by name or ID..."
              onClear={() => setSearchQuery('')}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
            <FilterDropdown
              label="Class"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              options={classOptions}
              placeholder="All Classes"
            />
            
            <FilterDropdown
              label="Section"
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              options={sectionOptions}
              placeholder="All Sections"
            />

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setClassFilter('');
                  setSectionFilter('');
                }}
                className="flex items-center"
              >
                <ApperIcon name="X" className="w-4 h-4 mr-1" />
                Clear
              </Button>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {filteredStudents.length} of {students.length} students
          </p>
        </div>
      </Card>

      {/* Content */}
      {loading ? (
        <Loading type="skeleton" message="Loading students..." />
      ) : error ? (
        <Error message={error} onRetry={loadStudents} />
      ) : filteredStudents.length === 0 && students.length === 0 ? (
        <Empty
          title="No students yet"
          message="Get started by adding your first student to the system."
          icon="Users"
          actionLabel="Add Student"
          onAction={handleAddStudent}
          type="students"
        />
      ) : filteredStudents.length === 0 ? (
        <Empty
          title="No students found"
          message="Try adjusting your search criteria or filters to find students."
          icon="Search"
          type="search"
        />
      ) : (
        <StudentTable
          students={filteredStudents}
          onStudentClick={handleStudentClick}
          onSort={handleSort}
          sortField={sortField}
          sortOrder={sortOrder}
        />
      )}
    </div>
  );
};

export default Students;