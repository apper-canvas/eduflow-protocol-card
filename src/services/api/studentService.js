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
    });
  }
};

// Export individual functions for direct import
export const getAllStudents = () => studentService.getAll();
export const getStudentById = (id) => studentService.getById(id);
export const createStudent = (data) => studentService.create(data);
export const updateStudent = (id, data) => studentService.update(id, data);
export const deleteStudent = (id) => studentService.delete(id);
export const searchStudents = (query) => studentService.searchStudents(query);
export const filterStudentsByClass = (classYear, section) => studentService.filterByClass(classYear, section);