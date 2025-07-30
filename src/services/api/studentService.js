import studentsData from '@/services/mockData/students.json';

let students = [...studentsData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const studentService = {
  async getAll() {
    await delay(300);
    return [...students];
  },

  async getById(id) {
    await delay(200);
    const student = students.find(s => s.Id === parseInt(id));
    if (!student) {
      throw new Error('Student not found');
    }
    return { ...student };
  },

  async create(studentData) {
    await delay(400);
    const maxId = Math.max(...students.map(s => s.Id), 0);
    const newStudent = {
      ...studentData,
      Id: maxId + 1,
      status: 'Active'
    };
    students.push(newStudent);
    return { ...newStudent };
  },

  async update(id, studentData) {
    await delay(350);
    const index = students.findIndex(s => s.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Student not found');
    }
    students[index] = { ...students[index], ...studentData };
    return { ...students[index] };
  },

  async delete(id) {
    await delay(250);
    const index = students.findIndex(s => s.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Student not found');
    }
    const deletedStudent = students.splice(index, 1)[0];
    return { ...deletedStudent };
  },

  async searchStudents(query) {
    await delay(200);
    const lowercaseQuery = query.toLowerCase();
    return students.filter(student =>
      student.firstName.toLowerCase().includes(lowercaseQuery) ||
      student.lastName.toLowerCase().includes(lowercaseQuery) ||
      student.rollNumber.toLowerCase().includes(lowercaseQuery) ||
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(lowercaseQuery)
    );
  },

async filterByClass(classYear, section = '') {
    await delay(200);
    return students.filter(student => {
      const matchesClass = classYear ? student.class === classYear : true;
      const matchesSection = section ? student.section === section : true;
      return matchesClass && matchesSection;
    }).map(student => ({ ...student }));
  },

  async getClassSections(classYear) {
    await delay(100);
    const classStudents = students.filter(s => s.class === classYear);
    const sections = [...new Set(classStudents.map(s => s.section))];
    return sections.sort();
  }
};

// Export individual functions for direct import
export const getAllStudents = () => studentService.getAll();
export const getStudentById = (id) => studentService.getById(id);
export const createStudent = (data) => studentService.create(data);
export const updateStudent = (id, data) => studentService.update(id, data);
export const updateStudent = (id, data) => studentService.update(id, data);
export const deleteStudent = (id) => studentService.delete(id);
export const searchStudents = (query) => studentService.searchStudents(query);
export const filterStudentsByClass = (classYear, section) => studentService.filterByClass(classYear, section);

// Analytics Methods
export const getPerformanceData = async (filters = {}) => {
  await delay(200);
  const allStudents = await studentService.getAll();
  
  // Simulated performance data
  const performanceData = allStudents.map(student => ({
    studentId: student.Id,
    studentName: `${student.firstName} ${student.lastName}`,
    class: student.class,
    section: student.section,
    averageGrade: Math.random() * 40 + 60, // 60-100 range
    attendanceRate: Math.random() * 20 + 80, // 80-100 range
    trend: Math.random() > 0.5 ? 'improving' : 'declining'
  }));

  return filters.class ? 
    performanceData.filter(p => p.class === filters.class) : 
    performanceData;
};

export const getEnrollmentTrends = async () => {
  await delay(150);
  
  return {
    monthly: [
      { month: 'Jan', enrolled: 1180, target: 1200 },
      { month: 'Feb', enrolled: 1195, target: 1200 },
      { month: 'Mar', enrolled: 1210, target: 1200 },
      { month: 'Apr', enrolled: 1245, target: 1250 },
      { month: 'May', enrolled: 1248, target: 1250 },
      { month: 'Jun', enrolled: 1245, target: 1250 }
    ],
    byClass: [
      { class: '6th', current: 180, capacity: 200, waitlist: 15 },
      { class: '7th', current: 175, capacity: 200, waitlist: 8 },
      { class: '8th', current: 190, capacity: 200, waitlist: 12 },
      { class: '9th', current: 195, capacity: 200, waitlist: 25 },
      { class: '10th', current: 185, capacity: 200, waitlist: 18 },
      { class: '11th', current: 160, capacity: 180, waitlist: 10 },
      { class: '12th', current: 160, capacity: 180, waitlist: 5 }
    ]
  };
};

export const getAttendanceCorrelation = async () => {
  await delay(200);
  const students = await studentService.getAll();
  
  return students.map(student => ({
    studentId: student.Id,
    studentName: `${student.firstName} ${student.lastName}`,
    class: student.class,
    attendanceRate: Math.random() * 30 + 70, // 70-100%
    academicScore: Math.random() * 40 + 60, // 60-100%
    correlation: Math.random() * 0.4 + 0.6 // 0.6-1.0 correlation
  }));
};