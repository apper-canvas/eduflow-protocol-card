import subjectsData from '@/services/mockData/subjects.json';

let subjects = [...subjectsData];
let nextId = Math.max(...subjects.map(s => s.Id)) + 1;

export const subjectService = {
  getAll: () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...subjects]), 100);
    });
  },

  getById: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const subject = subjects.find(s => s.Id === parseInt(id));
        if (subject) {
          resolve({ ...subject });
        } else {
          reject(new Error('Subject not found'));
        }
      }, 100);
    });
  },

  getCore: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const coreSubjects = subjects.filter(s => s.isCore);
        resolve([...coreSubjects]);
      }, 100);
    });
  },

  getByDepartment: (department) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const deptSubjects = subjects.filter(s => s.department === department);
        resolve([...deptSubjects]);
      }, 100);
    });
  },

  create: (subjectData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newSubject = {
          ...subjectData,
          Id: nextId++
        };
        subjects.push(newSubject);
        resolve({ ...newSubject });
      }, 200);
    });
  },

  update: (id, subjectData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = subjects.findIndex(s => s.Id === parseInt(id));
        if (index !== -1) {
          subjects[index] = { ...subjectData, Id: parseInt(id) };
          resolve({ ...subjects[index] });
        } else {
          reject(new Error('Subject not found'));
        }
      }, 200);
    });
  },

  delete: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = subjects.findIndex(s => s.Id === parseInt(id));
        if (index !== -1) {
          const deletedSubject = subjects.splice(index, 1)[0];
          resolve(deletedSubject);
        } else {
          reject(new Error('Subject not found'));
        }
      }, 200);
    });
  }
};