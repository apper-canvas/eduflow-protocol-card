import React, { useState, useEffect } from 'react';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import { homeworkService } from '@/services/api/homeworkService';
import { classService } from '@/services/api/classService';
import { subjectService } from '@/services/api/subjectService';
import { studentService } from '@/services/api/studentService';
import { toast } from 'react-toastify';

function HomeworkTab() {
  const [activeView, setActiveView] = useState('list');
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [students, setStudents] = useState([]);

  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    subject: '',
    class: '',
    description: '',
    dueDate: '',
    totalMarks: '',
    instructions: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [assignmentsData, classesData, subjectsData, studentsData] = await Promise.all([
        homeworkService.getAllAssignments(),
        classService.getAll(),
        subjectService.getAll(),
        studentService.getAll()
      ]);

      setAssignments(assignmentsData);
      setClasses(classesData);
      setSubjects(subjectsData);
      setStudents(studentsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load homework data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    
    if (!assignmentForm.title || !assignmentForm.subject || !assignmentForm.class || !assignmentForm.dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const newAssignment = await homeworkService.createAssignment(assignmentForm);
      setAssignments([...assignments, newAssignment]);
      setAssignmentForm({
        title: '',
        subject: '',
        class: '',
        description: '',
        dueDate: '',
        totalMarks: '',
        instructions: ''
      });
      setActiveView('list');
      toast.success('Assignment created successfully');
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error('Failed to create assignment');
    }
  };

  const handleViewAssignment = async (assignment) => {
    try {
      setLoading(true);
      setSelectedAssignment(assignment);
      const submissionsData = await homeworkService.getSubmissionsByAssignment(assignment.Id);
      
      // Create submissions for students who haven't submitted
      const classStudents = students.filter(s => s.class === assignment.class);
      const existingSubmissions = submissionsData.map(s => s.studentId);
      const missingSubmissions = classStudents
        .filter(student => !existingSubmissions.includes(student.Id))
        .map(student => ({
          Id: Date.now() + student.Id, // Temporary ID
          assignmentId: assignment.Id,
          studentId: student.Id,
          studentName: `${student.firstName} ${student.lastName}`,
          submissionDate: null,
          status: 'Not Submitted',
          marks: null,
          feedback: '',
          attachments: [],
          submittedContent: ''
        }));

      setSubmissions([...submissionsData, ...missingSubmissions]);
      setActiveView('detail');
    } catch (error) {
      console.error('Error loading assignment details:', error);
      toast.error('Failed to load assignment details');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmission = async (submissionId, marks, feedback) => {
    try {
      await homeworkService.gradeSubmission(submissionId, marks, feedback);
      setSubmissions(submissions.map(s => 
        s.Id === submissionId 
          ? { ...s, marks, feedback, status: 'Graded' }
          : s
      ));
      toast.success('Submission graded successfully');
    } catch (error) {
      console.error('Error grading submission:', error);
      toast.error('Failed to grade submission');
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      'Not Submitted': 'bg-gray-100 text-gray-800',
      'Submitted': 'bg-blue-100 text-blue-800',
      'Late': 'bg-yellow-100 text-yellow-800',
      'Graded': 'bg-green-100 text-green-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        {status}
      </span>
    );
  };

  const getSubmissionStats = (assignmentId) => {
    const assignmentSubmissions = submissions.filter(s => s.assignmentId === assignmentId);
    const total = assignmentSubmissions.length;
    const submitted = assignmentSubmissions.filter(s => 
      s.status === 'Submitted' || s.status === 'Late' || s.status === 'Graded'
    ).length;
    
    return { total, submitted };
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Homework Management</h2>
          <p className="text-gray-600">Create, assign, and track homework assignments</p>
        </div>
        
        {activeView === 'list' && (
          <Button onClick={() => setActiveView('create')}>
            <ApperIcon name="Plus" size={16} className="mr-2" />
            Create Assignment
          </Button>
        )}
        
        {activeView !== 'list' && (
          <Button variant="outline" onClick={() => setActiveView('list')}>
            <ApperIcon name="ArrowLeft" size={16} className="mr-2" />
            Back to List
          </Button>
        )}
      </div>

      {/* Create Assignment Form */}
      {activeView === 'create' && (
        <Card className="p-6">
          <form onSubmit={handleCreateAssignment} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Assignment Title"
                required
                value={assignmentForm.title}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                placeholder="Enter assignment title"
              />

              <Select
                label="Subject"
                required
                value={assignmentForm.subject}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, subject: e.target.value })}
              >
                <option value="">Select Subject</option>
                {subjects.map(subject => (
                  <option key={subject.Id} value={subject.name}>
                    {subject.name}
                  </option>
                ))}
              </Select>

              <Select
                label="Class"
                required
                value={assignmentForm.class}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, class: e.target.value })}
              >
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls.Id} value={cls.name}>
                    {cls.name}
                  </option>
                ))}
              </Select>

              <Input
                label="Due Date"
                type="date"
                required
                value={assignmentForm.dueDate}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
              />

              <Input
                label="Total Marks"
                type="number"
                value={assignmentForm.totalMarks}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, totalMarks: e.target.value })}
                placeholder="Enter total marks"
              />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={4}
                  value={assignmentForm.description}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                  placeholder="Describe the assignment..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructions
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                  value={assignmentForm.instructions}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, instructions: e.target.value })}
                  placeholder="Additional instructions for students..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" type="button" onClick={() => setActiveView('list')}>
                Cancel
              </Button>
              <Button type="submit">
                Create Assignment
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Assignments List */}
      {activeView === 'list' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submissions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assignments.map((assignment) => {
                  const classSubmissions = students.filter(s => s.class === assignment.class);
                  const submissionCount = classSubmissions.length;
                  
                  return (
                    <tr key={assignment.Id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {assignment.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          Assigned: {assignment.assignedDate}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {assignment.subject}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {assignment.class}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {assignment.dueDate}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center space-x-2">
                          <ApperIcon name="Users" size={16} />
                          <span>{submissionCount} students</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewAssignment(assignment)}
                        >
                          <ApperIcon name="Eye" size={16} className="mr-2" />
                          View Details
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Assignment Detail View */}
      {activeView === 'detail' && selectedAssignment && (
        <div className="space-y-6">
          {/* Assignment Info */}
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedAssignment.title}</h3>
                <p className="text-sm text-gray-600">{selectedAssignment.subject} - {selectedAssignment.class}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Due Date</p>
                <p className="text-sm text-gray-900">{selectedAssignment.dueDate}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Total Marks</p>
                <p className="text-sm text-gray-900">{selectedAssignment.totalMarks || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Status</p>
                <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  {selectedAssignment.status}
                </span>
              </div>
            </div>
            
            {selectedAssignment.description && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700">Description</p>
                <p className="text-sm text-gray-900 mt-1">{selectedAssignment.description}</p>
              </div>
            )}
          </Card>

          {/* Submissions Table */}
          <Card className="overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Student Submissions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submission Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Marks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {submissions.map((submission) => (
                    <SubmissionRow
                      key={submission.Id}
                      submission={submission}
                      assignment={selectedAssignment}
                      onGrade={handleGradeSubmission}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function SubmissionRow({ submission, assignment, onGrade }) {
  const [isGrading, setIsGrading] = useState(false);
  const [marks, setMarks] = useState(submission.marks || '');
  const [feedback, setFeedback] = useState(submission.feedback || '');

  const handleGrade = async () => {
    if (marks === '' || parseInt(marks) < 0 || parseInt(marks) > assignment.totalMarks) {
      toast.error('Please enter valid marks');
      return;
    }

    try {
      await onGrade(submission.Id, parseInt(marks), feedback);
      setIsGrading(false);
      toast.success('Submission graded successfully');
    } catch (error) {
      toast.error('Failed to grade submission');
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      'Not Submitted': 'bg-gray-100 text-gray-800',
      'Submitted': 'bg-blue-100 text-blue-800',
      'Late': 'bg-yellow-100 text-yellow-800',
      'Graded': 'bg-green-100 text-green-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900">
          {submission.studentName}
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">
        {submission.submissionDate || '-'}
      </td>
      <td className="px-6 py-4">
        {getStatusBadge(submission.status)}
      </td>
      <td className="px-6 py-4">
        {isGrading ? (
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              placeholder="Marks"
              className="w-20"
              min="0"
              max={assignment.totalMarks}
            />
            <span className="text-sm text-gray-500">/ {assignment.totalMarks}</span>
          </div>
        ) : (
          <div className="text-sm text-gray-900">
            {submission.marks !== null ? `${submission.marks} / ${assignment.totalMarks}` : '-'}
          </div>
        )}
      </td>
      <td className="px-6 py-4 text-sm font-medium">
        {submission.status !== 'Not Submitted' && (
          <div className="flex items-center space-x-2">
            {isGrading ? (
              <>
                <Button size="sm" onClick={handleGrade}>
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsGrading(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsGrading(true)}
              >
                <ApperIcon name="Edit" size={16} className="mr-1" />
                {submission.status === 'Graded' ? 'Edit Grade' : 'Grade'}
              </Button>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}

export default HomeworkTab;