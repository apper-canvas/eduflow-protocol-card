import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getAttendanceByClassAndDate, saveClassAttendance } from "@/services/api/attendanceService";
import { getAllStudents } from "@/services/api/studentService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Students from "@/components/pages/Students";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import Card from "@/components/atoms/Card";

function MarkAttendance() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});
const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Get unique classes from students data
  const getClassOptions = () => {
    if (!students || !Array.isArray(students) || students.length === 0) {
      return [];
    }
    try {
      const classes = [...new Set(students.map(student => student?.class).filter(Boolean))].sort();
      return classes.map(className => ({
        value: className,
        label: className
      }));
    } catch (err) {
      console.error('Error getting class options:', err);
      return [];
    }
  };

  // Get unique sections for the selected class
  const getSectionOptions = () => {
    if (!students || !Array.isArray(students) || !selectedClass) {
      return [];
    }
    try {
      const sections = [...new Set(
        students
          .filter(student => student?.class === selectedClass)
          .map(student => student?.section)
          .filter(Boolean)
      )].sort();
      return sections.map(section => ({
        value: section,
        label: section
      }));
    } catch (err) {
      console.error('Error getting section options:', err);
      return [];
    }
};

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const studentsData = await getAllStudents();
        
        // Ensure we always have an array
        if (Array.isArray(studentsData)) {
          setStudents(studentsData);
        } else {
          console.warn('Students data is not an array:', studentsData);
          setStudents([]);
        }
      } catch (err) {
        console.error('Failed to load students:', err);
        setError('Failed to load students data');
        setStudents([]); // Ensure students is always an array
        toast.error('Failed to load students data');
      } finally {
        setIsLoading(false);
      }
    };

    loadStudents();
  }, []);

  // Filter students and load attendance when class, section, or date changes
useEffect(() => {
    if (selectedClass && selectedSection && Array.isArray(students)) {
      try {
        const filtered = students.filter(
          student => student?.class === selectedClass && student?.section === selectedSection
        );
        setFilteredStudents(filtered || []);

        // Load existing attendance for the selected date and class
        const existingAttendance = getAttendanceByClassAndDate(selectedDate, selectedClass, selectedSection);
        const attendanceMap = {};
        
        // Initialize all students as not marked
        if (Array.isArray(filtered)) {
          filtered.forEach(student => {
            if (student?.Id) {
              attendanceMap[student.Id] = 'Present'; // Default to Present
            }
          });
        }
        
        // Update with existing attendance data
        if (Array.isArray(existingAttendance)) {
          existingAttendance.forEach(record => {
            if (record?.studentId && record?.status) {
              attendanceMap[record.studentId] = record.status;
            }
          });
        }
        
        setAttendance(attendanceMap);
      } catch (err) {
        console.error('Error filtering students or loading attendance:', err);
        setFilteredStudents([]);
        setAttendance({});
        toast.error('Failed to load existing attendance');
      }
    } else {
      setFilteredStudents([]);
      setAttendance({});
    }
  }, [selectedClass, selectedSection, selectedDate, students]);

  // Handle individual attendance change
  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  // Mark all students present
  const handleMarkAllPresent = () => {
    const updatedAttendance = {};
    filteredStudents.forEach(student => {
      updatedAttendance[student.Id] = 'Present';
    });
    setAttendance(updatedAttendance);
    toast.success('All students marked as present');
  };

  // Mark all students absent
  const handleMarkAllAbsent = () => {
    const updatedAttendance = {};
    filteredStudents.forEach(student => {
      updatedAttendance[student.Id] = 'Absent';
    });
    setAttendance(updatedAttendance);
    toast.success('All students marked as absent');
  };

  // Save attendance
  const handleSaveAttendance = async () => {
    if (!selectedClass || !selectedSection) {
      toast.error('Please select class and section');
      return;
    }

if (filteredStudents.length === 0) {
      toast.error('No students to mark attendance for');
      return;
    }

    try {
      setIsSaving(true);
      const attendanceList = filteredStudents.map(student => ({
        studentId: student.Id,
        status: attendance[student.Id] || 'Present'
      }));

      await saveClassAttendance(selectedDate, selectedClass, selectedSection, attendanceList);
      
      toast.success(`Attendance saved successfully for ${selectedClass}-${selectedSection} on ${selectedDate}`);
    } catch (err) {
      console.error('Failed to save attendance:', err);
      toast.error('Failed to save attendance');
    } finally {
      setIsSaving(false);
    }
  };

  // Get attendance summary
  const getAttendanceSummary = () => {
    const total = Array.isArray(filteredStudents) ? filteredStudents.length : 0;
    const presentCount = Object.values(attendance || {}).filter(status => status === 'Present').length;
    const absent = total - presentCount;
    
    return { total, present: presentCount, absent };
  };

if (isLoading) return <Loading />;
  if (error) return <Error message={error} />;
  if (!Array.isArray(students) || students.length === 0) return <Empty message="No students found" />;

  const summary = getAttendanceSummary();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mark Attendance</h1>
          <p className="text-gray-600 mt-1">Track daily student attendance efficiently</p>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <ApperIcon name="Calendar" size={16} />
          <span>Today: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Controls */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Date Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Class Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class
            </label>
            <Select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedSection(''); // Reset section when class changes
              }}
              className="w-full"
            >
              <option value="">Select Class</option>
              {getClassOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          {/* Section Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section
            </label>
            <Select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              disabled={!selectedClass}
              className="w-full"
            >
              <option value="">Select Section</option>
              {getSectionOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Actions
            </label>
            <div className="flex flex-col space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllPresent}
                disabled={filteredStudents.length === 0}
                className="text-xs"
              >
                <ApperIcon name="Check" size={14} />
                All Present
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAbsent}
                disabled={filteredStudents.length === 0}
                className="text-xs"
              >
                <ApperIcon name="X" size={14} />
                All Absent
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Attendance Summary */}
      {filteredStudents.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ApperIcon name="Users" size={20} className="text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Total Students</p>
                <p className="text-2xl font-bold text-blue-900">{summary.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-green-50 border-green-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <ApperIcon name="CheckCircle" size={20} className="text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Present</p>
                <p className="text-2xl font-bold text-green-900">{summary.present}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-red-50 border-red-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <ApperIcon name="XCircle" size={20} className="text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-600">Absent</p>
                <p className="text-2xl font-bold text-red-900">{summary.absent}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Student List */}
      {!selectedClass || !selectedSection ? (
        <Card className="p-8">
          <Empty
            title="Select Class and Section"
            description="Please select a class and section to view students and mark attendance."
            icon="Users"
          />
        </Card>
      ) : filteredStudents.length === 0 ? (
        <Card className="p-8">
          <Empty
            title="No Students Found"
            description={`No students found in ${selectedClass}-${selectedSection}.`}
            icon="Users"
          />
        </Card>
      ) : (
        <Card>
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Students - {selectedClass}-{selectedSection}
              </h2>
              <Button
                onClick={handleSaveAttendance}
                disabled={isSaving}
                className="w-full sm:w-auto"
              >
                {isSaving ? (
                  <>
                    <ApperIcon name="Loader" size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <ApperIcon name="Save" size={16} />
                    Save Attendance
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roll Number
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attendance Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.Id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={student.photo}
                            alt={`${student.firstName} ${student.lastName}`}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {student.gender}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.rollNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-4">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name={`attendance-${student.Id}`}
                            value="Present"
                            checked={attendance[student.Id] === 'Present'}
                            onChange={() => handleAttendanceChange(student.Id, 'Present')}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-green-700 font-medium">Present</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name={`attendance-${student.Id}`}
                            value="Absent"
                            checked={attendance[student.Id] === 'Absent'}
                            onChange={() => handleAttendanceChange(student.Id, 'Absent')}
                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-red-700 font-medium">Absent</span>
                        </label>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MarkAttendance;