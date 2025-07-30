import roomsData from '@/services/mockData/rooms.json';

let rooms = [...roomsData];
let nextId = Math.max(...rooms.map(r => r.Id)) + 1;

export const roomService = {
  getAll: () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...rooms]), 100);
    });
  },

  getById: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const room = rooms.find(r => r.Id === parseInt(id));
        if (room) {
          resolve({ ...room });
        } else {
          reject(new Error('Room not found'));
        }
      }, 100);
    });
  },

  getAvailable: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const availableRooms = rooms.filter(r => r.isAvailable);
        resolve([...availableRooms]);
      }, 100);
    });
  },

  getByType: (type) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filteredRooms = rooms.filter(r => r.type === type);
        resolve([...filteredRooms]);
      }, 100);
    });
  },

  create: (roomData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newRoom = {
          ...roomData,
          Id: nextId++
        };
        rooms.push(newRoom);
        resolve({ ...newRoom });
      }, 200);
    });
  },

  update: (id, roomData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = rooms.findIndex(r => r.Id === parseInt(id));
        if (index !== -1) {
          rooms[index] = { ...roomData, Id: parseInt(id) };
          resolve({ ...rooms[index] });
        } else {
          reject(new Error('Room not found'));
        }
      }, 200);
    });
  },

  delete: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = rooms.findIndex(r => r.Id === parseInt(id));
        if (index !== -1) {
          const deletedRoom = rooms.splice(index, 1)[0];
          resolve(deletedRoom);
        } else {
          reject(new Error('Room not found'));
        }
      }, 200);
    });
  }
};