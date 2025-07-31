import assignmentsData from '@/services/mockData/assignments.json';
import submissionsData from '@/services/mockData/submissions.json';

let assignments = [...assignmentsData];
let submissions = [...submissionsData];
let nextAssignmentId = Math.max(...assignments.map(a => a.Id)) + 1;
let nextSubmissionId = Math.max(...submissions.map(s => s.Id)) + 1;

export const homeworkService = {
  // Assignment CRUD operations
  getAllAssignments: () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...assignments]), 100);
    });
  },

  getAssignmentById: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const assignment = assignments.find(a => a.Id === parseInt(id));
        if (assignment) {
          resolve({ ...assignment });
        } else {
          reject(new Error('Assignment not found'));
        }
      }, 100);
    });
  },

  createAssignment: (assignmentData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newAssignment = {
          ...assignmentData,
          Id: nextAssignmentId++,
          assignedDate: new Date().toISOString().split('T')[0],
          status: 'Active'
        };
        assignments.push(newAssignment);
        resolve({ ...newAssignment });
      }, 200);
    });
  },

  updateAssignment: (id, assignmentData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = assignments.findIndex(a => a.Id === parseInt(id));
        if (index !== -1) {
          assignments[index] = { ...assignmentData, Id: parseInt(id) };
          resolve({ ...assignments[index] });
        } else {
          reject(new Error('Assignment not found'));
        }
      }, 200);
    });
  },

  deleteAssignment: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = assignments.findIndex(a => a.Id === parseInt(id));
        if (index !== -1) {
          const deletedAssignment = assignments.splice(index, 1)[0];
          // Also delete related submissions
          submissions = submissions.filter(s => s.assignmentId !== parseInt(id));
          resolve(deletedAssignment);
        } else {
          reject(new Error('Assignment not found'));
        }
      }, 200);
    });
  },

  // Submission operations
  getSubmissionsByAssignment: (assignmentId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const assignmentSubmissions = submissions.filter(s => s.assignmentId === parseInt(assignmentId));
        resolve([...assignmentSubmissions]);
      }, 100);
    });
  },

  getSubmissionById: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const submission = submissions.find(s => s.Id === parseInt(id));
        if (submission) {
          resolve({ ...submission });
        } else {
          reject(new Error('Submission not found'));
        }
      }, 100);
    });
  },

  updateSubmission: (id, submissionData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = submissions.findIndex(s => s.Id === parseInt(id));
        if (index !== -1) {
          submissions[index] = { ...submissionData, Id: parseInt(id) };
          resolve({ ...submissions[index] });
        } else {
          reject(new Error('Submission not found'));
        }
      }, 200);
    });
  },

  gradeSubmission: (id, marks, feedback) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = submissions.findIndex(s => s.Id === parseInt(id));
        if (index !== -1) {
          submissions[index] = {
            ...submissions[index],
            marks: marks,
            feedback: feedback,
            status: 'Graded'
          };
          resolve({ ...submissions[index] });
        } else {
          reject(new Error('Submission not found'));
        }
      }, 200);
    });
  },

  // Analytics
  getAssignmentStats: (assignmentId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const assignmentSubmissions = submissions.filter(s => s.assignmentId === parseInt(assignmentId));
        const stats = {
          total: assignmentSubmissions.length,
          submitted: assignmentSubmissions.filter(s => s.status === 'Submitted' || s.status === 'Late' || s.status === 'Graded').length,
          notSubmitted: assignmentSubmissions.filter(s => s.status === 'Not Submitted').length,
          late: assignmentSubmissions.filter(s => s.status === 'Late').length,
          graded: assignmentSubmissions.filter(s => s.status === 'Graded').length
        };
        resolve(stats);
      }, 100);
    });
  }
};