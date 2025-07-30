import classesData from '@/services/mockData/classes.json';

let classes = [...classesData];
let nextId = Math.max(...classes.map(c => c.Id)) + 1;

export const classService = {
  getAll: () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...classes]), 100);
    });
  },

  getById: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const classItem = classes.find(c => c.Id === parseInt(id));
        if (classItem) {
          resolve({ ...classItem });
        } else {
          reject(new Error('Class not found'));
        }
      }, 100);
    });
  },

  create: (classData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newClass = {
          ...classData,
          Id: nextId++
        };
        classes.push(newClass);
        resolve({ ...newClass });
      }, 200);
    });
  },

  update: (id, classData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = classes.findIndex(c => c.Id === parseInt(id));
        if (index !== -1) {
          classes[index] = { ...classData, Id: parseInt(id) };
          resolve({ ...classes[index] });
        } else {
          reject(new Error('Class not found'));
        }
      }, 200);
    });
  },

  delete: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = classes.findIndex(c => c.Id === parseInt(id));
        if (index !== -1) {
          const deletedClass = classes.splice(index, 1)[0];
          resolve(deletedClass);
        } else {
          reject(new Error('Class not found'));
        }
      }, 200);
    });
  }
};