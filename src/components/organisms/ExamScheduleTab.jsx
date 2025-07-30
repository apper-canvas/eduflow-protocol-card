import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import ExamForm from '@/components/organisms/ExamForm';
import SubjectScheduleForm from '@/components/organisms/SubjectScheduleForm';
import ExamCalendar from '@/components/organisms/ExamCalendar';
import { examService } from '@/services/api/examService';
import { classService } from '@/services/api/classService';
import { subjectService } from '@/services/api/subjectService';
import { roomService } from '@/services/api/roomService';

const ExamScheduleTab = () => {
  const [activeView, setActiveView] = useState('list');
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showExamForm, setShowExamForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [examsData, classesData, subjectsData, roomsData, schedulesData] = await Promise.all([
        examService.getAll(),
        classService.getAll(),
        subjectService.getAll(),
        roomService.getAll(),
        examService.getSchedules()
      ]);
      
      setExams(examsData);
      setClasses(classesData);
      setSubjects(subjectsData);
      setRooms(roomsData);
      setSchedules(schedulesData);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load examination data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExam = async (examData) => {
    try {
      const newExam = await examService.create(examData);
      setExams([...exams, newExam]);
      setShowExamForm(false);
      toast.success('Exam created successfully');
    } catch (err) {
      toast.error('Failed to create exam');
    }
  };

  const handleCreateSchedule = async (scheduleData) => {
    try {
      const newSchedule = await examService.createSchedule(scheduleData);
      setSchedules([...schedules, newSchedule]);
      setShowScheduleForm(false);
      toast.success('Exam schedule created successfully');
    } catch (err) {
      toast.error('Failed to create exam schedule');
    }
  };

  const handleDeleteExam = async (examId) => {
    if (!confirm('Are you sure you want to delete this exam? This will also delete all related schedules.')) {
      return;
    }

    try {
      await examService.delete(examId);
      setExams(exams.filter(e => e.Id !== examId));
      setSchedules(schedules.filter(s => s.examId !== examId));
      toast.success('Exam deleted successfully');
    } catch (err) {
      toast.error('Failed to delete exam');
    }
  };

  const handlePublishExam = async (examId, target) => {
    try {
      const updatedExam = await examService.publish(examId, target);
      setExams(exams.map(e => e.Id === examId ? updatedExam : e));
      toast.success(`Exam published to ${target} successfully`);
    } catch (err) {
      toast.error('Failed to publish exam');
    }
  };

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || exam.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const views = [
    { id: 'list', name: 'List View', icon: 'List' },
    { id: 'calendar', name: 'Calendar View', icon: 'Calendar' },
    { id: 'schedule', name: 'Schedule View', icon: 'Clock' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'Draft', label: 'Draft' },
    { value: 'Scheduled', label: 'Scheduled' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Cancelled', label: 'Cancelled' }
  ];

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Search exams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={statusOptions}
            className="w-48"
          />
        </div>

        <div className="flex items-center space-x-3">
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {views.map((view) => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === view.id
                    ? 'bg-white text-red-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <ApperIcon name={view.icon} size={16} />
                  <span className="hidden sm:inline">{view.name}</span>
                </div>
              </button>
            ))}
          </div>

          <Button
            onClick={() => setShowExamForm(true)}
            className="bg-red-600 hover:bg-red-700"
          >
            <ApperIcon name="Plus" size={16} />
            <span className="ml-2">Create Exam</span>
          </Button>
        </div>
      </div>

      {/* Content */}
      {activeView === 'list' && (
        <div className="space-y-4">
          {filteredExams.length === 0 ? (
            <Card className="p-8 text-center">
              <ApperIcon name="FileText" size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No exams found</h3>
              <p className="text-gray-600 mb-4">Create your first exam to get started</p>
              <Button
                onClick={() => setShowExamForm(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                <ApperIcon name="Plus" size={16} />
                <span className="ml-2">Create Exam</span>
              </Button>
            </Card>
          ) : (
            filteredExams.map((exam) => (
              <ExamCard
                key={exam.Id}
                exam={exam}
                schedules={schedules.filter(s => s.examId === exam.Id)}
                classes={classes}
                subjects={subjects}
                rooms={rooms}
                onDelete={handleDeleteExam}
                onPublish={handlePublishExam}
                onSchedule={(exam) => {
                  setSelectedExam(exam);
                  setShowScheduleForm(true);
                }}
              />
            ))
          )}
        </div>
      )}

      {activeView === 'calendar' && (
        <ExamCalendar
          schedules={schedules}
          exams={exams}
          classes={classes}
          subjects={subjects}
          rooms={rooms}
        />
      )}

      {activeView === 'schedule' && (
        <ScheduleView
          schedules={schedules}
          exams={exams}
          classes={classes}
          subjects={subjects}
          rooms={rooms}
        />
      )}

      {/* Modals */}
      {showExamForm && (
        <ExamForm
          classes={classes}
          onSubmit={handleCreateExam}
          onCancel={() => setShowExamForm(false)}
        />
      )}

      {showScheduleForm && selectedExam && (
        <SubjectScheduleForm
          exam={selectedExam}
          classes={classes}
          subjects={subjects}
          rooms={rooms}
          onSubmit={handleCreateSchedule}
          onCancel={() => {
            setShowScheduleForm(false);
            setSelectedExam(null);
          }}
        />
      )}
    </div>
  );
};

const ExamCard = ({ exam, schedules, classes, subjects, rooms, onDelete, onPublish, onSchedule }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-800';
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const examClasses = classes.filter(c => exam.classes.includes(c.Id));
  const scheduledCount = schedules.length;
  const totalSubjects = examClasses.length * subjects.filter(s => s.isCore).length;

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{exam.name}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(exam.status)}`}>
              {exam.status}
            </span>
          </div>
          
          <p className="text-gray-600 mb-3">{exam.description}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Type:</span>
              <p className="font-medium">{exam.type}</p>
            </div>
            <div>
              <span className="text-gray-500">Date Range:</span>
              <p className="font-medium">{exam.startDate} to {exam.endDate}</p>
            </div>
            <div>
              <span className="text-gray-500">Classes:</span>
              <p className="font-medium">{examClasses.map(c => c.name).join(', ')}</p>
            </div>
            <div>
              <span className="text-gray-500">Progress:</span>
              <p className="font-medium">{scheduledCount}/{totalSubjects} scheduled</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 mt-4 text-sm">
            <div className="flex items-center space-x-1">
              <ApperIcon name={exam.publishedToStudents ? "CheckCircle" : "Circle"} size={16} 
                className={exam.publishedToStudents ? "text-green-500" : "text-gray-400"} />
              <span className={exam.publishedToStudents ? "text-green-700" : "text-gray-500"}>
                Published to Students
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <ApperIcon name={exam.publishedToParents ? "CheckCircle" : "Circle"} size={16} 
                className={exam.publishedToParents ? "text-green-500" : "text-gray-400"} />
              <span className={exam.publishedToParents ? "text-green-700" : "text-gray-500"}>
                Published to Parents
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSchedule(exam)}
          >
            <ApperIcon name="Calendar" size={14} />
            <span className="ml-1">Schedule</span>
          </Button>
          
          {exam.status === 'Scheduled' && (
            <div className="relative group">
              <Button size="sm" variant="outline" className="bg-green-50 border-green-200 text-green-700">
                <ApperIcon name="Send" size={14} />
                <span className="ml-1">Publish</span>
              </Button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 hidden group-hover:block z-10">
                <button
                  onClick={() => onPublish(exam.Id, 'students')}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  Publish to Students
                </button>
                <button
                  onClick={() => onPublish(exam.Id, 'parents')}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  Publish to Parents
                </button>
                <button
                  onClick={() => onPublish(exam.Id, 'both')}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  Publish to Both
                </button>
              </div>
            </div>
          )}
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(exam.Id)}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <ApperIcon name="Trash2" size={14} />
          </Button>
        </div>
      </div>
    </Card>
  );
};

const ScheduleView = ({ schedules, exams, classes, subjects, rooms }) => (
  <Card className="p-6">
    <h3 className="text-lg font-semibold mb-4">Detailed Schedule View</h3>
    {schedules.length === 0 ? (
      <p className="text-gray-500 text-center py-8">No schedules created yet</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {schedules.map((schedule) => {
              const exam = exams.find(e => e.Id === schedule.examId);
              const classItem = classes.find(c => c.Id === schedule.classId);
              const subject = subjects.find(s => s.Id === schedule.subjectId);
              const room = rooms.find(r => r.Id === schedule.roomId);
              
              return (
                <tr key={schedule.Id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {exam?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {classItem?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {subject?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {schedule.date} {schedule.startTime}-{schedule.endTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {room?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {schedule.duration} min
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )}
  </Card>
);

export default ExamScheduleTab;