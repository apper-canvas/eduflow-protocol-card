import timetablesData from '@/services/mockData/timetables.json';

let timetables = [...timetablesData];
let nextId = Math.max(...timetables.map(t => t.Id)) + 1;

export const timetableService = {
  getAll: () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...timetables]), 100);
    });
  },

  getById: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const timetable = timetables.find(t => t.Id === parseInt(id));
        if (timetable) {
          resolve({ ...timetable });
        } else {
          reject(new Error('Timetable entry not found'));
        }
      }, 100);
    });
  },

  getByClass: (classId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const classTimetables = timetables.filter(t => t.classId === parseInt(classId));
        resolve([...classTimetables]);
      }, 100);
    });
  },

  getByTeacher: (teacherId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const teacherTimetables = timetables.filter(t => t.teacherId === parseInt(teacherId));
        resolve([...teacherTimetables]);
      }, 100);
    });
  },

  getByRoom: (roomId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const roomTimetables = timetables.filter(t => t.roomId === parseInt(roomId));
        resolve([...roomTimetables]);
      }, 100);
    });
  },

  getByDayAndPeriod: (day, period) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const periodTimetables = timetables.filter(t => 
          t.day === day && t.period === parseInt(period)
        );
        resolve([...periodTimetables]);
      }, 100);
    });
  },

  checkConflicts: (entry) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const conflicts = [];
        
        // Check teacher conflict
        const teacherConflict = timetables.find(t => 
          t.Id !== entry.Id &&
          t.teacherId === entry.teacherId &&
          t.day === entry.day &&
          t.period === entry.period
        );
        
        if (teacherConflict) {
          conflicts.push({
            type: 'teacher',
            message: 'Teacher is already assigned to another class at this time',
            conflictEntry: teacherConflict
          });
        }

        // Check room conflict
        const roomConflict = timetables.find(t => 
          t.Id !== entry.Id &&
          t.roomId === entry.roomId &&
          t.day === entry.day &&
          t.period === entry.period
        );
        
        if (roomConflict) {
          conflicts.push({
            type: 'room',
            message: 'Room is already occupied at this time',
            conflictEntry: roomConflict
          });
        }

        resolve(conflicts);
      }, 100);
    });
  },

  create: (timetableData) => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        // Check for conflicts before creating
        const conflicts = await timetableService.checkConflicts(timetableData);
        
        if (conflicts.length > 0) {
          reject(new Error(`Conflicts detected: ${conflicts.map(c => c.message).join(', ')}`));
          return;
        }

        const newTimetable = {
          ...timetableData,
          Id: nextId++
        };
        timetables.push(newTimetable);
        resolve({ ...newTimetable });
      }, 200);
    });
  },

  update: (id, timetableData) => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        const index = timetables.findIndex(t => t.Id === parseInt(id));
        if (index === -1) {
          reject(new Error('Timetable entry not found'));
          return;
        }

        // Check for conflicts before updating
        const conflicts = await timetableService.checkConflicts({
          ...timetableData,
          Id: parseInt(id)
        });
        
        if (conflicts.length > 0) {
          reject(new Error(`Conflicts detected: ${conflicts.map(c => c.message).join(', ')}`));
          return;
        }

        timetables[index] = { ...timetableData, Id: parseInt(id) };
        resolve({ ...timetables[index] });
      }, 200);
    });
  },

  delete: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = timetables.findIndex(t => t.Id === parseInt(id));
        if (index !== -1) {
          const deletedTimetable = timetables.splice(index, 1)[0];
          resolve(deletedTimetable);
        } else {
          reject(new Error('Timetable entry not found'));
        }
      }, 200);
    });
  },

  bulkCreate: (timetableEntries) => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        const results = [];
        const errors = [];

        for (const entry of timetableEntries) {
          try {
            const conflicts = await timetableService.checkConflicts(entry);
            if (conflicts.length > 0) {
              errors.push({
                entry,
                conflicts
              });
            } else {
              const newEntry = {
                ...entry,
                Id: nextId++
              };
              timetables.push(newEntry);
              results.push(newEntry);
            }
          } catch (error) {
            errors.push({
              entry,
              error: error.message
            });
          }
        }

        if (errors.length > 0) {
          reject({
            message: 'Some entries could not be created due to conflicts',
            errors,
            created: results
          });
        } else {
          resolve(results);
        }
      }, 300);
    });
  },

  copyTimetable: (fromClassId, toClassId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const sourceTimetables = timetables.filter(t => t.classId === parseInt(fromClassId));
        
        if (sourceTimetables.length === 0) {
          reject(new Error('No timetable found for source class'));
          return;
        }

        const newTimetables = sourceTimetables.map(t => ({
          ...t,
          Id: nextId++,
          classId: parseInt(toClassId)
        }));

        // Add to timetables array
        timetables.push(...newTimetables);
        
        resolve([...newTimetables]);
      }, 300);
    });
  }
};