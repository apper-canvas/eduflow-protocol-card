import gradesData from '@/services/mockData/grades.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let grades = [...gradesData];

// Helper function to calculate grade from percentage
const calculateGrade = (percentage) => {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
};

// Helper function to calculate percentage
const calculatePercentage = (obtainedMarks, maxMarks) => {
  if (maxMarks === 0) return 0;
  return Math.round((obtainedMarks / maxMarks) * 100);
};

export const gradesService = {
  async getAll() {
    await delay(300);
    return [...grades];
  },

  async getById(id) {
    await delay(200);
    const grade = grades.find(g => g.Id === parseInt(id));
    if (!grade) {
      throw new Error('Grade record not found');
    }
    return { ...grade };
  },

  async create(gradeData) {
    await delay(400);
    const maxId = Math.max(...grades.map(g => g.Id), 0);
    const percentage = calculatePercentage(gradeData.obtainedMarks, gradeData.maxMarks);
    const newGrade = {
      ...gradeData,
      Id: maxId + 1,
      percentage,
      grade: calculateGrade(percentage),
      createdAt: new Date().toISOString()
    };
    grades.push(newGrade);
    return { ...newGrade };
  },

  async update(id, gradeData) {
    await delay(350);
    const index = grades.findIndex(g => g.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Grade record not found');
    }
    
    const percentage = calculatePercentage(gradeData.obtainedMarks, gradeData.maxMarks);
    const updatedGrade = {
      ...grades[index],
      ...gradeData,
      percentage,
      grade: calculateGrade(percentage)
    };
    
    grades[index] = updatedGrade;
    return { ...updatedGrade };
  },

  async delete(id) {
    await delay(250);
    const index = grades.findIndex(g => g.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Grade record not found');
    }
    const deletedGrade = grades.splice(index, 1)[0];
    return { ...deletedGrade };
  },

  async getByClassAndSubject(classId, section, subject, term = '') {
    await delay(200);
    return grades.filter(grade => {
      const matchesClass = grade.classId === classId;
      const matchesSection = section ? grade.section === section : true;
      const matchesSubject = grade.subject === subject;
      const matchesTerm = term ? grade.term === term : true;
      return matchesClass && matchesSection && matchesSubject && matchesTerm;
    });
  },

  async getByStudent(studentId) {
    await delay(200);
    return grades.filter(grade => grade.studentId === parseInt(studentId));
  },

  async bulkUpdate(gradeUpdates) {
    await delay(500);
    const updatedGrades = [];
    
    for (const update of gradeUpdates) {
      const index = grades.findIndex(g => g.Id === update.Id);
      if (index !== -1) {
        const percentage = calculatePercentage(update.obtainedMarks, update.maxMarks);
        const updatedGrade = {
          ...grades[index],
          ...update,
          percentage,
          grade: calculateGrade(percentage)
        };
        grades[index] = updatedGrade;
        updatedGrades.push({ ...updatedGrade });
      }
    }
    
    return updatedGrades;
  },

  // Get available classes
  async getClasses() {
    await delay(100);
    const classes = [...new Set(grades.map(g => g.classId))];
    return classes.sort();
  },

  // Get available subjects for a class
  async getSubjects(classId) {
    await delay(100);
    const subjects = [...new Set(grades
      .filter(g => g.classId === classId)
      .map(g => g.subject))];
    return subjects.sort();
  },

  // Get available terms
  async getTerms() {
    await delay(100);
    const terms = [...new Set(grades.map(g => g.term))];
    return terms.sort();
  },

  // Get assessment types
  async getAssessmentTypes() {
    await delay(100);
    return ['Quiz', 'Assignment', 'Mid-term', 'Final Exam'];
  },

  // Get sections for a class
  async getSections(classId) {
    await delay(100);
    const sections = [...new Set(grades
      .filter(g => g.classId === classId)
      .map(g => g.section))];
    return sections.sort();
  }
};