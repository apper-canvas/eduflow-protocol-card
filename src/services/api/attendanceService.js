import mockAttendance from '@/services/mockData/attendance.json';

let attendanceData = [...mockAttendance];
let nextId = Math.max(...attendanceData.map(item => item.Id), 0) + 1;

// Helper function to format date as YYYY-MM-DD
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

// Get all attendance records
export const getAllAttendance = () => {
  return [...attendanceData];
};

// Get attendance by ID
export const getAttendanceById = (id) => {
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) {
    throw new Error('Invalid attendance ID');
  }
  
  const attendance = attendanceData.find(item => item.Id === numericId);
  return attendance ? { ...attendance } : null;
};

// Get attendance by date, class, and section
export const getAttendanceByClassAndDate = (date, className, section) => {
  const formattedDate = typeof date === 'string' ? date : formatDate(date);
  return attendanceData.filter(item => 
    item.date === formattedDate && 
    item.class === className && 
    item.section === section
  ).map(item => ({ ...item }));
};

// Get attendance for a specific student on a date
export const getStudentAttendanceByDate = (studentId, date) => {
  const formattedDate = typeof date === 'string' ? date : formatDate(date);
  const numericStudentId = parseInt(studentId, 10);
  
  return attendanceData.find(item => 
    item.studentId === numericStudentId && 
    item.date === formattedDate
  );
};

// Create new attendance record
export const createAttendance = (attendanceRecord) => {
  const newAttendance = {
    Id: nextId++,
    date: typeof attendanceRecord.date === 'string' ? attendanceRecord.date : formatDate(attendanceRecord.date),
    class: attendanceRecord.class,
    section: attendanceRecord.section,
    studentId: parseInt(attendanceRecord.studentId, 10),
    status: attendanceRecord.status,
    markedAt: new Date().toISOString(),
    markedBy: attendanceRecord.markedBy || 'system'
  };
  
  attendanceData.push(newAttendance);
  return { ...newAttendance };
};

// Update attendance record
export const updateAttendance = (id, updates) => {
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) {
    throw new Error('Invalid attendance ID');
  }
  
  const index = attendanceData.findIndex(item => item.Id === numericId);
  if (index === -1) {
    throw new Error('Attendance record not found');
  }
  
  const updatedAttendance = {
    ...attendanceData[index],
    ...updates,
    Id: numericId, // Ensure ID cannot be changed
    markedAt: new Date().toISOString() // Update timestamp
  };
  
  attendanceData[index] = updatedAttendance;
  return { ...updatedAttendance };
};

// Delete attendance record
export const deleteAttendance = (id) => {
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) {
    throw new Error('Invalid attendance ID');
  }
  
  const index = attendanceData.findIndex(item => item.Id === numericId);
  if (index === -1) {
    throw new Error('Attendance record not found');
  }
  
  const deletedAttendance = attendanceData.splice(index, 1)[0];
  return { ...deletedAttendance };
};

// Bulk create or update attendance for a class on a specific date
export const saveClassAttendance = (date, className, section, attendanceList) => {
  const formattedDate = typeof date === 'string' ? date : formatDate(date);
  const results = [];
  
  attendanceList.forEach(({ studentId, status }) => {
    const numericStudentId = parseInt(studentId, 10);
    
    // Check if attendance already exists
    const existingIndex = attendanceData.findIndex(item => 
      item.date === formattedDate && 
      item.studentId === numericStudentId
    );
    
    if (existingIndex !== -1) {
      // Update existing record
      const updated = updateAttendance(attendanceData[existingIndex].Id, {
        status,
        class: className,
        section: section
      });
      results.push(updated);
    } else {
      // Create new record
      const created = createAttendance({
        date: formattedDate,
        class: className,
        section: section,
        studentId: numericStudentId,
        status
      });
      results.push(created);
    }
  });
  
  return results;
};

// Get attendance statistics for a class and date range
export const getAttendanceStats = (className, section, startDate, endDate) => {
  const start = typeof startDate === 'string' ? startDate : formatDate(startDate);
  const end = typeof endDate === 'string' ? endDate : formatDate(endDate);
  
  const records = attendanceData.filter(item => 
    item.class === className &&
    item.section === section &&
    item.date >= start &&
    item.date <= end
  );
  
  const totalRecords = records.length;
  const presentCount = records.filter(item => item.status === 'Present').length;
  const absentCount = records.filter(item => item.status === 'Absent').length;
  
return {
    total: totalRecords,
    present: presentCount,
    absent: absentCount,
    attendanceRate: totalRecords > 0 ? ((presentCount / totalRecords) * 100).toFixed(2) : 0
  };
};

// Export bundled service object for easier importing
export const attendanceService = {
  getAllAttendance,
  getAttendanceById,
  getAttendanceByClassAndDate,
  getStudentAttendanceByDate,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  saveClassAttendance,
  getAttendanceStats
};