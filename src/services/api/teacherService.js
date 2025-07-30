import teachersData from '@/services/mockData/teachers.json';

let teachers = [...teachersData];
let nextId = Math.max(...teachers.map(t => t.Id)) + 1;

export const teacherService = {
  getAll: () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...teachers]), 100);
    });
  },

  getById: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const teacher = teachers.find(t => t.Id === parseInt(id));
        if (teacher) {
          resolve({ ...teacher });
        } else {
          reject(new Error('Teacher not found'));
        }
      }, 100);
    });
  },

  getBySubject: (subjectName) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filteredTeachers = teachers.filter(t => 
          t.subjects.includes(subjectName)
        );
        resolve([...filteredTeachers]);
      }, 100);
    });
  },

  create: (teacherData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newTeacher = {
          ...teacherData,
          Id: nextId++
        };
        teachers.push(newTeacher);
        resolve({ ...newTeacher });
      }, 200);
    });
  },

  update: (id, teacherData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = teachers.findIndex(t => t.Id === parseInt(id));
        if (index !== -1) {
          teachers[index] = { ...teacherData, Id: parseInt(id) };
          resolve({ ...teachers[index] });
        } else {
          reject(new Error('Teacher not found'));
        }
      }, 200);
    });
  },

  delete: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = teachers.findIndex(t => t.Id === parseInt(id));
        if (index !== -1) {
          const deletedTeacher = teachers.splice(index, 1)[0];
          resolve(deletedTeacher);
        } else {
          reject(new Error('Teacher not found'));
        }
      }, 200);
    });
  }
};