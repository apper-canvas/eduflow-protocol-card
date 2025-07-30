import schoolMetricsData from '@/services/mockData/schoolMetrics.json';
import { studentService } from './studentService';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const schoolService = {
  async getMetrics() {
    await delay(300);
    return { ...schoolMetricsData };
  },

  async getDashboardData() {
    await delay(400);
    const metrics = await this.getMetrics();
    const recentStudents = await studentService.getAll();
    
    return {
      metrics,
      recentActivities: [
        {
          id: 1,
          type: "admission",
          message: "New admission: Aarav Sharma (10th A)",
          time: "2 hours ago"
        },
        {
          id: 2,
          type: "fee",
          message: "Fee payment received from Priya Patel",
          time: "4 hours ago"
        },
        {
          id: 3,
          type: "exam",
          message: "Mid-term exam schedule updated",
          time: "1 day ago"
        },
        {
          id: 4,
          type: "attendance",
          message: "Attendance marked for all classes",
          time: "1 day ago"
        }
      ],
      recentStudents: recentStudents.slice(0, 5),
      quickStats: {
        todayAttendance: 92.3,
        pendingFees: 15,
        upcomingEvents: 3,
        newEnquiries: 7
      }
    };
  }
};