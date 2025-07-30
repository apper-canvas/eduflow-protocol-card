import parentsData from '@/services/mockData/parents.json';

let parents = [...parentsData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const parentService = {
  async getAll() {
    await delay(250);
    return [...parents];
  },

  async getByStudentId(studentId) {
    await delay(200);
    const parent = parents.find(p => p.studentId === studentId.toString());
    if (!parent) {
      throw new Error('Parent information not found');
    }
    return { ...parent };
  },

  async create(parentData) {
    await delay(350);
    const maxId = Math.max(...parents.map(p => p.Id), 0);
    const newParent = {
      ...parentData,
      Id: maxId + 1
    };
    parents.push(newParent);
    return { ...newParent };
  },

  async update(id, parentData) {
    await delay(300);
    const index = parents.findIndex(p => p.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Parent not found');
    }
    parents[index] = { ...parents[index], ...parentData };
    return { ...parents[index] };
  }
};