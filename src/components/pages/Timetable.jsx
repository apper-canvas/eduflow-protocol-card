import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Select from '@/components/atoms/Select';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import { classService } from '@/services/api/classService';
import { teacherService } from '@/services/api/teacherService';
import { roomService } from '@/services/api/roomService';
import { subjectService } from '@/services/api/subjectService';
import { timetableService } from '@/services/api/timetableService';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = [
  { id: 1, name: 'Period 1', startTime: '09:00', endTime: '09:40' },
  { id: 2, name: 'Period 2', startTime: '09:40', endTime: '10:20' },
  { id: 3, name: 'Break', startTime: '10:20', endTime: '10:40' },
  { id: 4, name: 'Period 3', startTime: '10:40', endTime: '11:20' },
  { id: 5, name: 'Period 4', startTime: '11:20', endTime: '12:00' },
  { id: 6, name: 'Lunch', startTime: '12:00', endTime: '13:00' },
  { id: 7, name: 'Period 5', startTime: '13:00', endTime: '13:40' },
  { id: 8, name: 'Period 6', startTime: '13:40', endTime: '14:20' }
];

const TimetableCell = ({ 
  entry, 
  onEdit, 
  onDelete, 
  conflicts = [], 
  subjects, 
  teachers, 
  rooms,
  isEmpty = false,
  onAdd,
  day,
  period
}) => {
  const hasConflict = conflicts.length > 0;
  const subject = subjects.find(s => s.Id === entry?.subjectId);
  const teacher = teachers.find(t => t.Id === entry?.teacherId);
  const room = rooms.find(r => r.Id === entry?.roomId);

  if (isEmpty) {
    return (
      <div className="h-16 border border-gray-200 flex items-center justify-center group hover:bg-gray-50 cursor-pointer transition-colors">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAdd(day, period)}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ApperIcon name="Plus" size={16} />
        </Button>
      </div>
    );
  }

  return (
    <div 
      className={`h-16 border border-gray-200 p-2 relative group hover:shadow-sm transition-shadow cursor-pointer ${
        hasConflict ? 'bg-red-50 border-red-200' : 'bg-white'
      }`}
      onClick={() => onEdit(entry)}
    >
      <div className="text-xs font-medium truncate" style={{ color: subject?.color }}>
        {subject?.name}
      </div>
      <div className="text-xs text-gray-600 truncate">{teacher?.name}</div>
      <div className="text-xs text-gray-500 truncate">{room?.name}</div>
      
      {hasConflict && (
        <div className="absolute top-1 right-1">
          <ApperIcon name="AlertTriangle" size={12} className="text-red-500" />
        </div>
      )}
      
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(entry.Id);
          }}
          className="h-6 w-6 p-0 text-red-500 hover:bg-red-100"
        >
          <ApperIcon name="X" size={12} />
        </Button>
      </div>
    </div>
  );
};

const TimetableGrid = ({ 
  selectedClass, 
  timetables, 
  subjects, 
  teachers, 
  rooms, 
  onEdit, 
  onDelete, 
  onAdd,
  conflicts 
}) => {
  const getEntryForSlot = (day, periodId) => {
    return timetables.find(t => 
      t.classId === selectedClass?.Id && 
      t.day === day && 
      t.period === periodId
    );
  };

  const getConflictsForEntry = (entryId) => {
    return conflicts.filter(c => c.entryId === entryId);
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-full">
        <div className="grid grid-cols-6 gap-0 border border-gray-300">
          {/* Header */}
          <div className="bg-gray-100 p-3 font-semibold text-center border-b border-gray-300">
            Time
          </div>
          {DAYS.map(day => (
            <div key={day} className="bg-gray-100 p-3 font-semibold text-center border-b border-gray-300">
              {day}
            </div>
          ))}
          
          {/* Time slots */}
          {PERIODS.map(period => (
            <React.Fragment key={period.id}>
              <div className="bg-gray-50 p-2 text-sm border-r border-gray-300 flex flex-col justify-center">
                <div className="font-medium">{period.name}</div>
                <div className="text-xs text-gray-500">
                  {period.startTime} - {period.endTime}
                </div>
              </div>
              
              {DAYS.map(day => {
                const entry = getEntryForSlot(day, period.id);
                const entryConflicts = entry ? getConflictsForEntry(entry.Id) : [];
                
                return (
                  <TimetableCell
                    key={`${day}-${period.id}`}
                    entry={entry}
                    conflicts={entryConflicts}
                    subjects={subjects}
                    teachers={teachers}
                    rooms={rooms}
                    isEmpty={!entry}
                    onAdd={onAdd}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    day={day}
                    period={period.id}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

const TimetableModal = ({ 
  isOpen, 
  onClose, 
  entry, 
  subjects, 
  teachers, 
  rooms, 
  onSave,
  selectedClass,
  day,
  period 
}) => {
  const [formData, setFormData] = useState({
    subjectId: '',
    teacherId: '',
    roomId: '',
    day: day || 'Monday',
    period: period || 1
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (entry) {
      setFormData({
        subjectId: entry.subjectId || '',
        teacherId: entry.teacherId || '',
        roomId: entry.roomId || '',
        day: entry.day || day || 'Monday',
        period: entry.period || period || 1
      });
    } else {
      setFormData({
        subjectId: '',
        teacherId: '',
        roomId: '',
        day: day || 'Monday',
        period: period || 1
      });
    }
  }, [entry, day, period]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subjectId || !formData.teacherId || !formData.roomId) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const timetableData = {
        ...formData,
        classId: selectedClass.Id,
        subjectId: parseInt(formData.subjectId),
        teacherId: parseInt(formData.teacherId),
        roomId: parseInt(formData.roomId),
        period: parseInt(formData.period),
        startTime: PERIODS.find(p => p.id === parseInt(formData.period))?.startTime || '09:00',
        endTime: PERIODS.find(p => p.id === parseInt(formData.period))?.endTime || '09:40'
      };

      await onSave(timetableData, entry?.Id);
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to save timetable entry');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {entry ? 'Edit' : 'Add'} Timetable Entry
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ApperIcon name="X" size={16} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Day *
            </label>
            <Select
              value={formData.day}
              onChange={(e) => setFormData({ ...formData, day: e.target.value })}
              required
            >
              {DAYS.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Period *
            </label>
            <Select
              value={formData.period}
              onChange={(e) => setFormData({ ...formData, period: e.target.value })}
              required
            >
              {PERIODS.filter(p => p.id !== 3 && p.id !== 6).map(period => (
                <option key={period.id} value={period.id}>
                  {period.name} ({period.startTime} - {period.endTime})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject *
            </label>
            <Select
              value={formData.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              required
            >
              <option value="">Select Subject</option>
              {subjects.map(subject => (
                <option key={subject.Id} value={subject.Id}>
                  {subject.name} ({subject.code})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teacher *
            </label>
            <Select
              value={formData.teacherId}
              onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
              required
            >
              <option value="">Select Teacher</option>
              {teachers.map(teacher => (
                <option key={teacher.Id} value={teacher.Id}>
                  {teacher.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room *
            </label>
            <Select
              value={formData.roomId}
              onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
              required
            >
              <option value="">Select Room</option>
              {rooms.map(room => (
                <option key={room.Id} value={room.Id}>
                  {room.name} ({room.type})
                </option>
              ))}
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function Timetable() {
  const [activeTab, setActiveTab] = useState('class-timetables');
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [modalDay, setModalDay] = useState(null);
  const [modalPeriod, setModalPeriod] = useState(null);
  const [conflicts, setConflicts] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (timetables.length > 0) {
      checkConflicts();
    }
  }, [timetables]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [classesData, teachersData, roomsData, subjectsData, timetablesData] = await Promise.all([
        classService.getAll(),
        teacherService.getAll(),
        roomService.getAll(),
        subjectService.getAll(),
        timetableService.getAll()
      ]);

      setClasses(classesData);
      setTeachers(teachersData);
      setRooms(roomsData);
      setSubjects(subjectsData);
      setTimetables(timetablesData);
      
      if (classesData.length > 0) {
        setSelectedClass(classesData[0]);
      }
      if (teachersData.length > 0) {
        setSelectedTeacher(teachersData[0]);
      }
      if (roomsData.length > 0) {
        setSelectedRoom(roomsData[0]);
      }
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load timetable data');
    } finally {
      setLoading(false);
    }
  };

  const checkConflicts = async () => {
    const conflictList = [];
    
    for (const entry of timetables) {
      try {
        const entryConflicts = await timetableService.checkConflicts(entry);
        if (entryConflicts.length > 0) {
          conflictList.push({
            entryId: entry.Id,
            conflicts: entryConflicts
          });
        }
      } catch (error) {
        console.error('Error checking conflicts:', error);
      }
    }
    
    setConflicts(conflictList);
  };

  const handleSaveTimetableEntry = async (timetableData, entryId = null) => {
    try {
      let updatedEntry;
      if (entryId) {
        updatedEntry = await timetableService.update(entryId, timetableData);
        setTimetables(prev => prev.map(t => t.Id === entryId ? updatedEntry : t));
        toast.success('Timetable entry updated successfully');
      } else {
        updatedEntry = await timetableService.create(timetableData);
        setTimetables(prev => [...prev, updatedEntry]);
        toast.success('Timetable entry created successfully');
      }
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteTimetableEntry = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this timetable entry?')) {
      return;
    }

    try {
      await timetableService.delete(entryId);
      setTimetables(prev => prev.filter(t => t.Id !== entryId));
      toast.success('Timetable entry deleted successfully');
    } catch (error) {
      toast.error('Failed to delete timetable entry');
    }
  };

  const handleCopyTimetable = async () => {
    if (!selectedClass) {
      toast.error('Please select a class first');
      return;
    }

    const targetClassId = window.prompt('Enter the ID of the target class:');
    if (!targetClassId) return;

    try {
      const copiedEntries = await timetableService.copyTimetable(selectedClass.Id, parseInt(targetClassId));
      setTimetables(prev => [...prev, ...copiedEntries]);
      toast.success(`Timetable copied successfully to class ${targetClassId}`);
    } catch (error) {
      toast.error(error.message || 'Failed to copy timetable');
    }
  };

  const handleAddEntry = (day, period) => {
    setModalDay(day);
    setModalPeriod(period);
    setEditingEntry(null);
    setModalOpen(true);
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setModalDay(entry.day);
    setModalPeriod(entry.period);
    setModalOpen(true);
  };

  if (loading) return <Loading message="Loading timetable data..." />;
  if (error) return <Error message={error} onRetry={loadInitialData} />;

  const tabs = [
    { id: 'class-timetables', name: 'Class Timetables', icon: 'Calendar' },
    { id: 'teacher-schedules', name: 'Teacher Schedules', icon: 'Users' },
    { id: 'room-management', name: 'Room Management', icon: 'Map' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timetable Management</h1>
          <p className="text-gray-600">Manage class schedules, teacher assignments, and room allocations</p>
        </div>
        
        {conflicts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
            <ApperIcon name="AlertTriangle" size={16} className="text-red-500" />
            <span className="text-sm text-red-700">
              {conflicts.length} conflict{conflicts.length > 1 ? 's' : ''} detected
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ApperIcon name={tab.icon} size={16} />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Class Timetables Tab */}
      {activeTab === 'class-timetables' && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Class
                  </label>
                  <Select
                    value={selectedClass?.Id || ''}
                    onChange={(e) => {
                      const classId = parseInt(e.target.value);
                      setSelectedClass(classes.find(c => c.Id === classId));
                    }}
                  >
                    {classes.map(cls => (
                      <option key={cls.Id} value={cls.Id}>
                        {cls.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={handleCopyTimetable} variant="outline">
                  <ApperIcon name="Copy" size={16} className="mr-2" />
                  Copy Timetable
                </Button>
              </div>
            </div>

            {selectedClass && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Class Information</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Grade:</span>
                      <span className="ml-2 font-medium">{selectedClass.grade}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Section:</span>
                      <span className="ml-2 font-medium">{selectedClass.section}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Strength:</span>
                      <span className="ml-2 font-medium">{selectedClass.strength}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Room:</span>
                      <span className="ml-2 font-medium">
                        {rooms.find(r => r.Id === selectedClass.roomId)?.name}
                      </span>
                    </div>
                  </div>
                </div>

                <TimetableGrid
                  selectedClass={selectedClass}
                  timetables={timetables}
                  subjects={subjects}
                  teachers={teachers}
                  rooms={rooms}
                  conflicts={conflicts}
                  onEdit={handleEditEntry}
                  onDelete={handleDeleteTimetableEntry}
                  onAdd={handleAddEntry}
                />
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Teacher Schedules Tab */}
      {activeTab === 'teacher-schedules' && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Teacher
                </label>
                <Select
                  value={selectedTeacher?.Id || ''}
                  onChange={(e) => {
                    const teacherId = parseInt(e.target.value);
                    setSelectedTeacher(teachers.find(t => t.Id === teacherId));
                  }}
                >
                  {teachers.map(teacher => (
                    <option key={teacher.Id} value={teacher.Id}>
                      {teacher.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {selectedTeacher && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Teacher Information</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Employee ID:</span>
                      <span className="ml-2 font-medium">{selectedTeacher.employeeId}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Department:</span>
                      <span className="ml-2 font-medium">{selectedTeacher.department}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Subjects:</span>
                      <span className="ml-2 font-medium">{selectedTeacher.subjects.join(', ')}</span>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 p-3 text-left">Time</th>
                        {DAYS.map(day => (
                          <th key={day} className="border border-gray-300 p-3 text-center">
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {PERIODS.map(period => (
                        <tr key={period.id}>
                          <td className="border border-gray-300 p-2 bg-gray-50">
                            <div className="font-medium">{period.name}</div>
                            <div className="text-xs text-gray-500">
                              {period.startTime} - {period.endTime}
                            </div>
                          </td>
                          {DAYS.map(day => {
                            const entry = timetables.find(t => 
                              t.teacherId === selectedTeacher.Id && 
                              t.day === day && 
                              t.period === period.id
                            );
                            const cls = entry ? classes.find(c => c.Id === entry.classId) : null;
                            const subject = entry ? subjects.find(s => s.Id === entry.subjectId) : null;
                            const room = entry ? rooms.find(r => r.Id === entry.roomId) : null;

                            return (
                              <td key={`${day}-${period.id}`} className="border border-gray-300 p-2 h-16">
                                {entry ? (
                                  <div className="text-xs">
                                    <div className="font-medium" style={{ color: subject?.color }}>
                                      {subject?.name}
                                    </div>
                                    <div className="text-gray-600">{cls?.name}</div>
                                    <div className="text-gray-500">{room?.name}</div>
                                  </div>
                                ) : (
                                  <div className="text-gray-400 text-center">Free</div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Room Management Tab */}
      {activeTab === 'room-management' && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Room
                </label>
                <Select
                  value={selectedRoom?.Id || ''}
                  onChange={(e) => {
                    const roomId = parseInt(e.target.value);
                    setSelectedRoom(rooms.find(r => r.Id === roomId));
                  }}
                >
                  {rooms.map(room => (
                    <option key={room.Id} value={room.Id}>
                      {room.name} ({room.type})
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {selectedRoom && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Room Information</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <span className="ml-2 font-medium">{selectedRoom.type}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Capacity:</span>
                      <span className="ml-2 font-medium">{selectedRoom.capacity}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Floor:</span>
                      <span className="ml-2 font-medium">{selectedRoom.floor}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Building:</span>
                      <span className="ml-2 font-medium">{selectedRoom.building}</span>
                    </div>
                  </div>
                  {selectedRoom.facilities && selectedRoom.facilities.length > 0 && (
                    <div className="mt-3">
                      <span className="text-gray-500">Facilities:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedRoom.facilities.map((facility, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {facility}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 p-3 text-left">Time</th>
                        {DAYS.map(day => (
                          <th key={day} className="border border-gray-300 p-3 text-center">
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {PERIODS.map(period => (
                        <tr key={period.id}>
                          <td className="border border-gray-300 p-2 bg-gray-50">
                            <div className="font-medium">{period.name}</div>
                            <div className="text-xs text-gray-500">
                              {period.startTime} - {period.endTime}
                            </div>
                          </td>
                          {DAYS.map(day => {
                            const entry = timetables.find(t => 
                              t.roomId === selectedRoom.Id && 
                              t.day === day && 
                              t.period === period.id
                            );
                            const cls = entry ? classes.find(c => c.Id === entry.classId) : null;
                            const subject = entry ? subjects.find(s => s.Id === entry.subjectId) : null;
                            const teacher = entry ? teachers.find(t => t.Id === entry.teacherId) : null;

                            return (
                              <td key={`${day}-${period.id}`} className="border border-gray-300 p-2 h-16">
                                {entry ? (
                                  <div className="text-xs">
                                    <div className="font-medium" style={{ color: subject?.color }}>
                                      {subject?.name}
                                    </div>
                                    <div className="text-gray-600">{cls?.name}</div>
                                    <div className="text-gray-500">{teacher?.name}</div>
                                  </div>
                                ) : (
                                  <div className="text-gray-400 text-center">Available</div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Modal */}
      <TimetableModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        entry={editingEntry}
        subjects={subjects}
        teachers={teachers}
        rooms={rooms}
        onSave={handleSaveTimetableEntry}
        selectedClass={selectedClass}
        day={modalDay}
        period={modalPeriod}
      />
    </div>
  );
}