import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import ApperIcon from '@/components/ApperIcon';
import { examService } from '@/services/api/examService';

const SubjectScheduleForm = ({ exam, classes, subjects, rooms, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    examId: exam.Id,
    classId: '',
    subjectId: '',
    date: '',
    startTime: '',
    endTime: '',
    duration: 120,
    roomId: '',
    maxMarks: 100,
    instructions: '',
    supervisorId: 1
  });

  const [errors, setErrors] = useState({});
  const [conflicts, setConflicts] = useState([]);
  const [checkingConflicts, setCheckingConflicts] = useState(false);

  const examClasses = classes.filter(c => exam.classes.includes(c.Id));
  const coreSubjects = subjects.filter(s => s.isCore);
  const availableRooms = rooms.filter(r => r.isAvailable);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };

      // Auto-calculate duration when times change
      if (name === 'startTime' || name === 'endTime') {
        if (newData.startTime && newData.endTime) {
          const start = new Date(`2000-01-01T${newData.startTime}`);
          const end = new Date(`2000-01-01T${newData.endTime}`);
          const diffMs = end - start;
          const diffMins = Math.floor(diffMs / (1000 * 60));
          if (diffMins > 0) {
            newData.duration = diffMins;
          }
        }
      }

      // Auto-calculate end time when duration changes
      if (name === 'duration' && newData.startTime) {
        const start = new Date(`2000-01-01T${newData.startTime}`);
        start.setMinutes(start.getMinutes() + parseInt(value));
        const endTime = start.toTimeString().slice(0, 5);
        newData.endTime = endTime;
      }

      return newData;
    });

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const checkConflicts = async () => {
    if (!formData.date || !formData.startTime || !formData.endTime || !formData.roomId || !formData.classId) {
      return;
    }

    setCheckingConflicts(true);
    try {
      const conflictResults = await examService.checkConflicts(formData);
      setConflicts(conflictResults);
    } catch (err) {
      toast.error('Failed to check conflicts');
    } finally {
      setCheckingConflicts(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      checkConflicts();
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.date, formData.startTime, formData.endTime, formData.roomId, formData.classId]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.classId) {
      newErrors.classId = 'Class is required';
    }

    if (!formData.subjectId) {
      newErrors.subjectId = 'Subject is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      const examStart = new Date(exam.startDate);
      const examEnd = new Date(exam.endDate);
      const scheduleDate = new Date(formData.date);
      
      if (scheduleDate < examStart || scheduleDate > examEnd) {
        newErrors.date = `Date must be between ${exam.startDate} and ${exam.endDate}`;
      }
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }

    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = 'End time must be after start time';
    }

    if (!formData.roomId) {
      newErrors.roomId = 'Room is required';
    }

    if (formData.duration < 30) {
      newErrors.duration = 'Duration must be at least 30 minutes';
    }

    if (formData.maxMarks < 1) {
      newErrors.maxMarks = 'Maximum marks must be greater than 0';
    }

    if (conflicts.length > 0) {
      newErrors.conflicts = 'Please resolve conflicts before proceeding';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    await onSubmit({
      ...formData,
      classId: parseInt(formData.classId),
      subjectId: parseInt(formData.subjectId),
      roomId: parseInt(formData.roomId),
      duration: parseInt(formData.duration),
      maxMarks: parseInt(formData.maxMarks)
    });
  };

  const roomOptions = availableRooms.map(room => ({
    value: room.Id,
    label: `${room.name} (${room.type}, Capacity: ${room.capacity})`
  }));

  const classOptions = examClasses.map(cls => ({
    value: cls.Id,
    label: cls.name
  }));

  const subjectOptions = coreSubjects.map(subject => ({
    value: subject.Id,
    label: subject.name
  }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Schedule Subject Exam
              </h2>
              <p className="text-gray-600 mt-1">{exam.name}</p>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <ApperIcon name="X" size={24} />
            </button>
          </div>

          {/* Conflicts Alert */}
          {conflicts.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center mb-2">
                <ApperIcon name="AlertTriangle" size={20} className="text-red-600 mr-2" />
                <h3 className="text-sm font-medium text-red-800">Scheduling Conflicts Detected</h3>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                {conflicts.map((conflict, index) => (
                  <li key={index}>• {conflict.message}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Class and Subject */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Select
                  label="Class"
                  name="classId"
                  value={formData.classId}
                  onChange={handleInputChange}
                  options={classOptions}
                  error={errors.classId}
                  placeholder="Select class"
                  required
                />
              </div>
              <div>
                <Select
                  label="Subject"
                  name="subjectId"
                  value={formData.subjectId}
                  onChange={handleInputChange}
                  options={subjectOptions}
                  error={errors.subjectId}
                  placeholder="Select subject"
                  required
                />
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Input
                  label="Date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  error={errors.date}
                  min={exam.startDate}
                  max={exam.endDate}
                  required
                />
              </div>
              <div>
                <Input
                  label="Start Time"
                  name="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  error={errors.startTime}
                  required
                />
              </div>
              <div>
                <Input
                  label="End Time"
                  name="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  error={errors.endTime}
                  required
                />
              </div>
            </div>

            {/* Duration and Room */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Duration (minutes)"
                  name="duration"
                  type="number"
                  value={formData.duration}
                  onChange={handleInputChange}
                  error={errors.duration}
                  min="30"
                  max="300"
                  required
                />
              </div>
              <div>
                <Select
                  label="Room"
                  name="roomId"
                  value={formData.roomId}
                  onChange={handleInputChange}
                  options={roomOptions}
                  error={errors.roomId}
                  placeholder="Select room"
                  required
                />
                {checkingConflicts && (
                  <p className="text-xs text-blue-600 mt-1">Checking for conflicts...</p>
                )}
              </div>
            </div>

            {/* Maximum Marks */}
            <div>
              <Input
                label="Maximum Marks"
                name="maxMarks"
                type="number"
                value={formData.maxMarks}
                onChange={handleInputChange}
                error={errors.maxMarks}
                min="1"
                max="1000"
                required
              />
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Instructions
              </label>
              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter any special instructions for this exam (optional)"
              />
            </div>

            {/* Errors */}
            {errors.conflicts && (
              <p className="text-red-600 text-sm">{errors.conflicts}</p>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-red-600 hover:bg-red-700"
                disabled={conflicts.length > 0 || checkingConflicts}
              >
                {checkingConflicts ? 'Checking...' : 'Schedule Exam'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default SubjectScheduleForm;