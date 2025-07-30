import React, { useState, useEffect } from 'react';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import { examService } from '@/services/api/examService';

const ExamCalendar = ({ schedules, exams, classes, subjects, rooms }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    loadCalendarEvents();
  }, [currentDate, schedules]);

  const loadCalendarEvents = async () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const startDate = new Date(year, month, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

    try {
      const events = await examService.getCalendarEvents(startDate, endDate);
      setCalendarEvents(events);
    } catch (err) {
      console.error('Failed to load calendar events:', err);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return calendarEvents.filter(event => event.date === dateStr);
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getSubjectColor = (subjectId) => {
    const subject = subjects.find(s => s.Id === subjectId);
    return subject?.color || '#6b7280';
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const days = getDaysInMonth(currentDate);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigateMonth(-1)}
            >
              <ApperIcon name="ChevronLeft" size={16} />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={goToToday}
            >
              Today
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigateMonth(1)}
            >
              <ApperIcon name="ChevronRight" size={16} />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Weekday Headers */}
          {weekdays.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 bg-gray-50 rounded">
              {day}
            </div>
          ))}
          
          {/* Calendar Days */}
          {days.map((day, index) => {
            const events = getEventsForDate(day);
            const isToday = day && day.toDateString() === new Date().toDateString();
            
            return (
              <div
                key={index}
                className={`min-h-[100px] p-2 border border-gray-200 rounded-lg ${
                  day ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'
                } ${isToday ? 'ring-2 ring-red-500' : ''}`}
              >
                {day && (
                  <>
                    <div className={`text-sm font-medium mb-1 ${
                      isToday ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {day.getDate()}
                    </div>
                    <div className="space-y-1">
                      {events.slice(0, 3).map((event, eventIndex) => {
                        const subject = subjects.find(s => s.Id === event.subjectId);
                        const classItem = classes.find(c => c.Id === event.classId);
                        
                        return (
                          <div
                            key={eventIndex}
                            onClick={() => setSelectedEvent(event)}
                            className="text-xs p-1 rounded cursor-pointer hover:opacity-80"
                            style={{
                              backgroundColor: `${getSubjectColor(event.subjectId)}20`,
                              borderLeft: `3px solid ${getSubjectColor(event.subjectId)}`
                            }}
                          >
                            <div className="font-medium truncate">
                              {subject?.name}
                            </div>
                            <div className="text-gray-600 truncate">
                              {classItem?.name} - {formatTime(event.startTime)}
                            </div>
                          </div>
                        );
                      })}
                      {events.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{events.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Subjects</h4>
          <div className="flex flex-wrap gap-3">
            {subjects.filter(s => s.isCore).map(subject => (
              <div key={subject.Id} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: subject.color }}
                />
                <span className="text-sm text-gray-700">{subject.name}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Event Details Modal */}
      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          exam={exams.find(e => e.Id === selectedEvent.examId)}
          classItem={classes.find(c => c.Id === selectedEvent.classId)}
          subject={subjects.find(s => s.Id === selectedEvent.subjectId)}
          room={rooms.find(r => r.Id === selectedEvent.roomId)}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
};

const EventDetailsModal = ({ event, exam, classItem, subject, room, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <Card className="w-full max-w-md">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Exam Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <ApperIcon name="X" size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium text-gray-500">Exam</div>
            <div className="text-lg font-semibold text-gray-900">{exam?.name}</div>
            <div className="text-sm text-gray-600">{exam?.type}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-500">Subject</div>
              <div className="font-medium" style={{ color: subject?.color }}>
                {subject?.name}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Class</div>
              <div className="font-medium">{classItem?.name}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-500">Date</div>
              <div className="font-medium">{event.date}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Time</div>
              <div className="font-medium">
                {new Date(`2000-01-01T${event.startTime}`).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })} - {new Date(`2000-01-01T${event.endTime}`).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-500">Duration</div>
              <div className="font-medium">{event.duration} minutes</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Room</div>
              <div className="font-medium">{room?.name}</div>
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-500">Maximum Marks</div>
            <div className="font-medium">{event.maxMarks}</div>
          </div>

          {event.instructions && (
            <div>
              <div className="text-sm font-medium text-gray-500">Instructions</div>
              <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                {event.instructions}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6">
          <Button
            onClick={onClose}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            Close
          </Button>
        </div>
      </div>
    </Card>
  </div>
);

export default ExamCalendar;