import examsData from '@/services/mockData/exams.json';
import examSchedulesData from '@/services/mockData/examSchedules.json';

let exams = [...examsData];
let examSchedules = [...examSchedulesData];
let nextExamId = Math.max(...exams.map(e => e.Id)) + 1;
let nextScheduleId = Math.max(...examSchedules.map(s => s.Id)) + 1;

export const examService = {
  // Exam CRUD operations
  getAll: () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...exams]), 100);
    });
  },

  getById: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const exam = exams.find(e => e.Id === parseInt(id));
        if (exam) {
          resolve({ ...exam });
        } else {
          reject(new Error('Exam not found'));
        }
      }, 100);
    });
  },

  create: (examData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newExam = {
          ...examData,
          Id: nextExamId++,
          createdAt: new Date().toISOString(),
          status: examData.status || 'Draft',
          publishedToStudents: false,
          publishedToParents: false
        };
        exams.push(newExam);
        resolve({ ...newExam });
      }, 200);
    });
  },

  update: (id, examData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = exams.findIndex(e => e.Id === parseInt(id));
        if (index !== -1) {
          exams[index] = { ...examData, Id: parseInt(id) };
          resolve({ ...exams[index] });
        } else {
          reject(new Error('Exam not found'));
        }
      }, 200);
    });
  },

  delete: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = exams.findIndex(e => e.Id === parseInt(id));
        if (index !== -1) {
          const deletedExam = exams.splice(index, 1)[0];
          // Also delete related schedules
          examSchedules = examSchedules.filter(s => s.examId !== parseInt(id));
          resolve(deletedExam);
        } else {
          reject(new Error('Exam not found'));
        }
      }, 200);
    });
  },

  publish: (id, target) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const exam = exams.find(e => e.Id === parseInt(id));
        if (exam) {
          if (target === 'students') {
            exam.publishedToStudents = true;
          } else if (target === 'parents') {
            exam.publishedToParents = true;
          } else if (target === 'both') {
            exam.publishedToStudents = true;
            exam.publishedToParents = true;
          }
          resolve({ ...exam });
        } else {
          reject(new Error('Exam not found'));
        }
      }, 200);
    });
  },

  // Schedule operations
  getSchedules: (examId = null) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const schedules = examId 
          ? examSchedules.filter(s => s.examId === parseInt(examId))
          : [...examSchedules];
        resolve(schedules);
      }, 100);
    });
  },

  createSchedule: (scheduleData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newSchedule = {
          ...scheduleData,
          Id: nextScheduleId++
        };
        examSchedules.push(newSchedule);
        resolve({ ...newSchedule });
      }, 200);
    });
  },

  updateSchedule: (id, scheduleData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = examSchedules.findIndex(s => s.Id === parseInt(id));
        if (index !== -1) {
          examSchedules[index] = { ...scheduleData, Id: parseInt(id) };
          resolve({ ...examSchedules[index] });
        } else {
          reject(new Error('Schedule not found'));
        }
      }, 200);
    });
  },

  deleteSchedule: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = examSchedules.findIndex(s => s.Id === parseInt(id));
        if (index !== -1) {
          const deletedSchedule = examSchedules.splice(index, 1)[0];
          resolve(deletedSchedule);
        } else {
          reject(new Error('Schedule not found'));
        }
      }, 200);
    });
  },

  checkConflicts: (scheduleData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const conflicts = [];
        const { date, startTime, endTime, roomId, classId } = scheduleData;
        
        // Check room conflicts
        const roomConflicts = examSchedules.filter(s => 
          s.roomId === parseInt(roomId) &&
          s.date === date &&
          ((s.startTime >= startTime && s.startTime < endTime) ||
           (s.endTime > startTime && s.endTime <= endTime) ||
           (s.startTime <= startTime && s.endTime >= endTime))
        );

        // Check class conflicts
        const classConflicts = examSchedules.filter(s => 
          s.classId === parseInt(classId) &&
          s.date === date &&
          ((s.startTime >= startTime && s.startTime < endTime) ||
           (s.endTime > startTime && s.endTime <= endTime) ||
           (s.startTime <= startTime && s.endTime >= endTime))
        );

        if (roomConflicts.length > 0) {
          conflicts.push({
            type: 'room',
            message: `Room ${roomId} is already booked during this time`,
            conflictingSchedules: roomConflicts
          });
        }

        if (classConflicts.length > 0) {
          conflicts.push({
            type: 'class',
            message: `Class already has an exam scheduled during this time`,
            conflictingSchedules: classConflicts
          });
        }

        resolve(conflicts);
      }, 150);
    });
  },

  getCalendarEvents: (startDate, endDate) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const events = examSchedules
          .filter(s => s.date >= startDate && s.date <= endDate)
          .map(schedule => {
            const exam = exams.find(e => e.Id === schedule.examId);
            return {
              ...schedule,
              examName: exam?.name || 'Unknown Exam',
              examType: exam?.type || 'Unknown'
            };
          });
        resolve(events);
      }, 100);
    });
  }
};