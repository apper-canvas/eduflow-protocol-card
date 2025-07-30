import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MetricCard from '@/components/molecules/MetricCard';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import ApperIcon from '@/components/ApperIcon';
import { schoolService } from '@/services/api/schoolService';
import { format } from 'date-fns';

const Dashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await schoolService.getDashboardData();
      setDashboardData(data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Loading dashboard..." />;
  }

  if (error) {
    return <Error message={error} onRetry={loadDashboardData} />;
  }

  const { metrics, recentActivities, recentStudents, quickStats } = dashboardData;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 font-display">Welcome to EduFlow Pro</h1>
            <p className="text-white/90 text-lg">Manage your school efficiently with our comprehensive system</p>
          </div>
          <div className="hidden md:block">
            <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
              <ApperIcon name="GraduationCap" className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Students"
          value={metrics.totalStudents.toLocaleString()}
          change="+12 this month"
          changeType="positive"
          icon="Users"
          gradient="from-primary-500 to-primary-600"
        />
        <MetricCard
          title="Total Teachers"
          value={metrics.totalTeachers}
          change="+3 this month"
          changeType="positive"
          icon="UserCheck"
          gradient="from-secondary-500 to-secondary-600"
        />
        <MetricCard
          title="Attendance Rate"
          value={`${metrics.attendanceRate}%`}
          change="+2.3% this week"
          changeType="positive"
          icon="Calendar"
          gradient="from-green-500 to-green-600"
        />
        <MetricCard
          title="Fee Collection"
          value={`${metrics.feeCollectionRate}%`}
          change="-1.2% this month"
          changeType="negative"
          icon="CreditCard"
          gradient="from-accent-500 to-accent-600"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-500 rounded-lg mr-4">
              <ApperIcon name="Clock" className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Today's Attendance</p>
              <p className="text-2xl font-bold text-blue-900">{quickStats.todayAttendance}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center">
            <div className="p-3 bg-orange-500 rounded-lg mr-4">
              <ApperIcon name="AlertCircle" className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-orange-600 font-medium">Pending Fees</p>
              <p className="text-2xl font-bold text-orange-900">{quickStats.pendingFees}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center">
            <div className="p-3 bg-purple-500 rounded-lg mr-4">
              <ApperIcon name="CalendarDays" className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-purple-600 font-medium">Upcoming Events</p>
              <p className="text-2xl font-bold text-purple-900">{quickStats.upcomingEvents}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-500 rounded-lg mr-4">
              <ApperIcon name="UserPlus" className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">New Enquiries</p>
              <p className="text-2xl font-bold text-green-900">{quickStats.newEnquiries}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activities */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 font-display">Recent Activities</h3>
            <Button variant="ghost" size="sm">
              <ApperIcon name="MoreHorizontal" className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className={`p-2 rounded-lg ${
                  activity.type === 'admission' ? 'bg-green-100' :
                  activity.type === 'fee' ? 'bg-blue-100' :
                  activity.type === 'exam' ? 'bg-purple-100' :
                  'bg-orange-100'
                }`}>
                  <ApperIcon 
                    name={
                      activity.type === 'admission' ? 'UserPlus' :
                      activity.type === 'fee' ? 'CreditCard' :
                      activity.type === 'exam' ? 'FileText' :
                      'Calendar'
                    } 
                    className={`w-4 h-4 ${
                      activity.type === 'admission' ? 'text-green-600' :
                      activity.type === 'fee' ? 'text-blue-600' :
                      activity.type === 'exam' ? 'text-purple-600' :
                      'text-orange-600'
                    }`} 
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 font-medium">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Students */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 font-display">Recent Students</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/students')}
            >
              View All
            </Button>
          </div>
          
          <div className="space-y-4">
            {recentStudents.map((student) => (
              <div 
                key={student.Id} 
                className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 cursor-pointer transition-all duration-200"
                onClick={() => navigate(`/students/${student.Id}`)}
              >
                <img
                  src={student.photo}
                  alt={`${student.firstName} ${student.lastName}`}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {student.firstName} {student.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {student.class} - {student.section} • ID: {student.rollNumber}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {format(new Date(student.admissionDate), 'MMM dd')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 font-display">Quick Actions</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="flex flex-col items-center p-6 h-auto space-y-2"
            onClick={() => navigate('/students/new')}
          >
            <ApperIcon name="UserPlus" className="w-6 h-6 text-primary-600" />
            <span className="text-sm font-medium">Add Student</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex flex-col items-center p-6 h-auto space-y-2"
            onClick={() => navigate('/attendance')}
          >
            <ApperIcon name="Calendar" className="w-6 h-6 text-secondary-600" />
            <span className="text-sm font-medium">Mark Attendance</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex flex-col items-center p-6 h-auto space-y-2"
            onClick={() => navigate('/examinations')}
          >
            <ApperIcon name="FileText" className="w-6 h-6 text-accent-600" />
            <span className="text-sm font-medium">Schedule Exam</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex flex-col items-center p-6 h-auto space-y-2"
            onClick={() => navigate('/reports')}
          >
            <ApperIcon name="BarChart3" className="w-6 h-6 text-green-600" />
            <span className="text-sm font-medium">View Reports</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;