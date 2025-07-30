import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Select from '@/components/atoms/Select';
import Input from '@/components/atoms/Input';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import { gradesService } from '@/services/api/gradesService';
import { studentService } from '@/services/api/studentService';

const GradeBookTab = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedAssessment, setSelectedAssessment] = useState('');
  const [maxMarks, setMaxMarks] = useState(25);
  
  // Data state
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [terms, setTerms] = useState([]);
  const [assessmentTypes, setAssessmentTypes] = useState([]);
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [gradeInputs, setGradeInputs] = useState({});

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load students and grades when filters change
  useEffect(() => {
    if (selectedClass && selectedSubject) {
      loadStudentsAndGrades();
    }
  }, [selectedClass, selectedSection, selectedSubject, selectedTerm, selectedAssessment]);

  // Load sections when class changes
  useEffect(() => {
    if (selectedClass) {
      loadSections();
      loadSubjects();
    }
  }, [selectedClass]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [classesData, termsData, assessmentTypesData] = await Promise.all([
        gradesService.getClasses(),
        gradesService.getTerms(),
        gradesService.getAssessmentTypes()
      ]);
      
      setClasses(classesData);
      setTerms(termsData);
      setAssessmentTypes(assessmentTypesData);
      
      // Set default values
      if (classesData.length > 0) {
        setSelectedClass(classesData[0]);
      }
      if (termsData.length > 0) {
        setSelectedTerm(termsData[0]);
      }
      if (assessmentTypesData.length > 0) {
        setSelectedAssessment(assessmentTypesData[0]);
      }
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load grade book data');
    } finally {
      setLoading(false);
    }
  };

  const loadSections = async () => {
    try {
      const sectionsData = await gradesService.getSections(selectedClass);
      setSections(sectionsData);
      if (sectionsData.length > 0) {
        setSelectedSection(sectionsData[0]);
      }
    } catch (err) {
      console.error('Failed to load sections:', err);
    }
  };

  const loadSubjects = async () => {
    try {
      const subjectsData = await gradesService.getSubjects(selectedClass);
      setSubjects(subjectsData);
      if (subjectsData.length > 0) {
        setSelectedSubject(subjectsData[0]);
      }
    } catch (err) {
      console.error('Failed to load subjects:', err);
    }
  };

  const loadStudentsAndGrades = async () => {
    try {
      setLoading(true);
      const [studentsData, gradesData] = await Promise.all([
        studentService.filterByClass(selectedClass, selectedSection),
        gradesService.getByClassAndSubject(selectedClass, selectedSection, selectedSubject, selectedTerm)
      ]);
      
      setStudents(studentsData);
      setGrades(gradesData);
      
      // Initialize grade inputs
      const inputs = {};
      studentsData.forEach(student => {
        const existingGrade = gradesData.find(g => 
          g.studentId === student.Id && 
          g.assessmentType === selectedAssessment
        );
        inputs[student.Id] = existingGrade ? existingGrade.obtainedMarks : '';
      });
      setGradeInputs(inputs);
      
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load students and grades');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (studentId, value) => {
    const numValue = parseFloat(value);
    if (value === '' || (!isNaN(numValue) && numValue >= 0 && numValue <= maxMarks)) {
      setGradeInputs(prev => ({
        ...prev,
        [studentId]: value
      }));
    }
  };

  const calculatePercentage = (obtainedMarks) => {
    if (maxMarks === 0) return 0;
    return Math.round((obtainedMarks / maxMarks) * 100);
  };

  const calculateGrade = (percentage) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-50';
      case 'B': return 'text-blue-600 bg-blue-50';
      case 'C': return 'text-yellow-600 bg-yellow-50';
      case 'D': return 'text-orange-600 bg-orange-50';
      case 'F': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleSaveGrades = async () => {
    if (!selectedClass || !selectedSubject || !selectedTerm || !selectedAssessment) {
      toast.error('Please select all required fields');
      return;
    }

    try {
      setSaving(true);
      const gradeUpdates = [];
      
      Object.entries(gradeInputs).forEach(([studentId, obtainedMarks]) => {
        if (obtainedMarks !== '') {
          const numMarks = parseFloat(obtainedMarks);
          const percentage = calculatePercentage(numMarks);
          const grade = calculateGrade(percentage);
          
          const existingGrade = grades.find(g => 
            g.studentId === parseInt(studentId) && 
            g.assessmentType === selectedAssessment
          );
          
          if (existingGrade) {
            gradeUpdates.push({
              Id: existingGrade.Id,
              obtainedMarks: numMarks,
              maxMarks,
              percentage,
              grade
            });
          } else {
            gradeUpdates.push({
              studentId: parseInt(studentId),
              classId: selectedClass,
              section: selectedSection,
              subject: selectedSubject,
              term: selectedTerm,
              assessmentType: selectedAssessment,
              maxMarks,
              obtainedMarks: numMarks,
              percentage,
              grade,
              date: new Date().toISOString().split('T')[0]
            });
          }
        }
      });

      if (gradeUpdates.length === 0) {
        toast.warning('No grades to save');
        return;
      }

      // Handle updates and creates separately
      const updates = gradeUpdates.filter(g => g.Id);
      const creates = gradeUpdates.filter(g => !g.Id);

      await Promise.all([
        updates.length > 0 ? gradesService.bulkUpdate(updates) : Promise.resolve(),
        ...creates.map(grade => gradesService.create(grade))
      ]);

      toast.success(`Successfully saved ${gradeUpdates.length} grade(s)`);
      await loadStudentsAndGrades(); // Refresh data
      
    } catch (err) {
      toast.error('Failed to save grades: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleResetGrades = () => {
    const inputs = {};
    students.forEach(student => {
      const existingGrade = grades.find(g => 
        g.studentId === student.Id && 
        g.assessmentType === selectedAssessment
      );
      inputs[student.Id] = existingGrade ? existingGrade.obtainedMarks : '';
    });
    setGradeInputs(inputs);
    toast.info('Grades reset to saved values');
  };

  const handleBulkFill = () => {
    const value = prompt('Enter marks to fill for all students (0-' + maxMarks + '):');
    if (value !== null) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0 && numValue <= maxMarks) {
        const inputs = {};
        students.forEach(student => {
          inputs[student.Id] = numValue;
        });
        setGradeInputs(inputs);
        toast.success('Bulk fill applied to all students');
      } else {
        toast.error('Please enter a valid number between 0 and ' + maxMarks);
      }
    }
  };

  if (loading && students.length === 0) return <Loading />;
  if (error && students.length === 0) return <Error message={error} />;

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ApperIcon name="Settings" size={20} />
          Grade Book Configuration
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class
            </label>
            <Select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              options={classes.map(cls => ({ value: cls, label: cls }))}
              placeholder="Select class"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section
            </label>
            <Select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              options={sections.map(sec => ({ value: sec, label: sec }))}
              placeholder="Select section"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <Select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              options={subjects.map(sub => ({ value: sub, label: sub }))}
              placeholder="Select subject"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Term
            </label>
            <Select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              options={terms.map(term => ({ value: term, label: term }))}
              placeholder="Select term"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assessment Type
            </label>
            <Select
              value={selectedAssessment}
              onChange={(e) => setSelectedAssessment(e.target.value)}
              options={assessmentTypes.map(type => ({ value: type, label: type }))}
              placeholder="Select assessment"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Marks
            </label>
            <Input
              type="number"
              value={maxMarks}
              onChange={(e) => setMaxMarks(parseInt(e.target.value) || 25)}
              min="1"
              max="200"
              className="w-full"
            />
          </div>
        </div>
      </Card>

      {/* Grade Entry Table */}
      {selectedClass && selectedSubject && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ApperIcon name="GraduationCap" size={20} />
              Grade Entry - {selectedClass} {selectedSection} - {selectedSubject}
            </h3>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkFill}
                disabled={saving}
              >
                <ApperIcon name="Copy" size={16} />
                Bulk Fill
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetGrades}
                disabled={saving}
              >
                <ApperIcon name="RotateCcw" size={16} />
                Reset
              </Button>
              <Button
                onClick={handleSaveGrades}
                disabled={saving}
                className="min-w-[100px]"
              >
                {saving ? (
                  <ApperIcon name="Loader2" size={16} className="animate-spin" />
                ) : (
                  <ApperIcon name="Save" size={16} />
                )}
                {saving ? 'Saving...' : 'Save Grades'}
              </Button>
            </div>
          </div>

          {students.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ApperIcon name="Users" size={48} className="mx-auto mb-2 opacity-50" />
              <p>No students found for the selected class and section</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Roll No.
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Student Name
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-center text-sm font-medium text-gray-700">
                      Marks (/{maxMarks})
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-center text-sm font-medium text-gray-700">
                      Percentage
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-center text-sm font-medium text-gray-700">
                      Grade
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => {
                    const marks = gradeInputs[student.Id] || '';
                    const numMarks = parseFloat(marks);
                    const percentage = marks !== '' && !isNaN(numMarks) ? calculatePercentage(numMarks) : '';
                    const grade = percentage !== '' ? calculateGrade(percentage) : '';
                    
                    return (
                      <tr key={student.Id} className="hover:bg-gray-50">
                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">
                          {student.rollNumber}
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">
                          {student.firstName} {student.lastName}
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-center">
                          <Input
                            type="number"
                            value={marks}
                            onChange={(e) => handleGradeChange(student.Id, e.target.value)}
                            placeholder="0"
                            min="0"
                            max={maxMarks}
                            step="0.5"
                            className="w-20 text-center"
                          />
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-center text-sm">
                          {percentage !== '' ? `${percentage}%` : '-'}
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-center">
                          {grade && (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeColor(grade)}`}>
                              {grade}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default GradeBookTab;