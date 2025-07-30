import { studentService } from './studentService';
import { feeService } from './feeService';
import { attendanceService } from './attendanceService';
import { gradesService } from './gradesService';
import { teacherService } from './teacherService';
import { classService } from './classService';
import { examService } from './examService';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper functions for calculations
const calculateAverage = (numbers) => {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
};

const calculatePercentileRank = (value, array) => {
  const sortedArray = [...array].sort((a, b) => a - b);
  const index = sortedArray.findIndex(val => val >= value);
  return index === -1 ? 100 : (index / sortedArray.length) * 100;
};

const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key];
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(item);
    return groups;
  }, {});
};

export const reportsService = {
  // Academic Analytics
  async getAcademicAnalytics(filters = {}) {
    await delay(500);
    
    const students = await studentService.getAll();
    const grades = await gradesService.getAll();
    const attendance = await attendanceService.getAllAttendance();
    const teachers = await teacherService.getAll();
    
    // Student Performance Trends
    const performanceData = this.calculatePerformanceTrends(grades, students, filters);
    
    // Grade Distribution
    const gradeDistribution = this.calculateGradeDistribution(grades, filters);
    
    // Attendance Correlation
    const attendanceCorrelation = this.calculateAttendancePerformanceCorrelation(attendance, grades, students);
    
    // Teacher Effectiveness
    const teacherEffectiveness = this.calculateTeacherEffectiveness(grades, teachers, students);
    
    // Subject Analysis
    const subjectAnalysis = this.calculateSubjectDifficultyAnalysis(grades, filters);
    
    // At-risk Students
    const atRiskStudents = this.identifyAtRiskStudents(grades, attendance, students);
    
    return {
      performanceData,
      gradeDistribution,
      attendanceCorrelation,
      teacherEffectiveness,
      subjectAnalysis,
      atRiskStudents,
      summary: {
        totalStudents: students.length,
        averageGrade: calculateAverage(grades.map(g => g.percentage)),
        attendanceRate: this.calculateOverallAttendanceRate(attendance),
        improvementRate: this.calculateImprovementRate(performanceData)
      }
    };
  },

  // Financial Reports
  async getFinancialReports(filters = {}) {
    await delay(400);
    
    const feeStructures = await feeService.getAll();
    const students = await studentService.getAll();
    
    // Collection Dashboard
    const collectionData = this.calculateCollectionMetrics(feeStructures, students, filters);
    
    // Revenue Analysis
    const revenueAnalysis = this.calculateRevenueAnalysis(feeStructures, students, filters);
    
    // Payment Trends
    const paymentTrends = this.calculatePaymentTrends(feeStructures, filters);
    
    // Financial Forecasting
    const forecasting = this.calculateFinancialForecasting(feeStructures, students);
    
    // Outstanding Analysis
    const outstandingAnalysis = this.calculateOutstandingAnalysis(feeStructures, students);
    
    return {
      collectionData,
      revenueAnalysis,
      paymentTrends,
      forecasting,
      outstandingAnalysis,
      summary: {
        totalRevenue: revenueAnalysis.totalRevenue,
        collectionRate: collectionData.overallRate,
        outstandingAmount: outstandingAnalysis.totalOutstanding,
        monthlyGrowth: revenueAnalysis.monthlyGrowth
      }
    };
  },

  // Operational Insights
  async getOperationalInsights(filters = {}) {
    await delay(350);
    
    const students = await studentService.getAll();
    const teachers = await teacherService.getAll();
    const classes = await classService.getAll();
    const attendance = await attendanceService.getAllAttendance();
    
    // Enrollment Trends
    const enrollmentTrends = this.calculateEnrollmentTrends(students, filters);
    
    // Teacher Workload
    const teacherWorkload = this.calculateTeacherWorkload(teachers, classes, students);
    
    // Facility Utilization
    const facilityUtilization = this.calculateFacilityUtilization(classes, students);
    
    // Communication Effectiveness
    const communicationMetrics = this.calculateCommunicationMetrics();
    
    // Performance Indicators
    const performanceIndicators = this.calculateOperationalKPIs(students, teachers, attendance);
    
    return {
      enrollmentTrends,
      teacherWorkload,
      facilityUtilization,
      communicationMetrics,
      performanceIndicators,
      summary: {
        totalEnrollment: students.length,
        teacherStudentRatio: (students.length / teachers.length).toFixed(1),
        capacityUtilization: facilityUtilization.overall,
        operationalEfficiency: performanceIndicators.efficiency
      }
    };
  },

  // Custom Reports
  async getCustomReportData(reportConfig) {
    await delay(300);
    
    const { dataSource, filters, groupBy: groupByField, metrics } = reportConfig;
    
    let data = [];
    
    switch (dataSource) {
      case 'students':
        data = await studentService.getAll();
        break;
      case 'grades':
        data = await gradesService.getAll();
        break;
      case 'attendance':
        data = await attendanceService.getAllAttendance();
        break;
      case 'fees':
        data = await feeService.getAll();
        break;
      default:
        data = [];
    }
    
    // Apply filters
    if (filters) {
      data = this.applyFilters(data, filters);
    }
    
    // Group data
    let groupedData = data;
    if (groupByField) {
      groupedData = groupBy(data, groupByField);
    }
    
    // Calculate metrics
    const results = this.calculateCustomMetrics(groupedData, metrics);
    
    return {
      data: results,
      totalRecords: data.length,
      appliedFilters: filters,
      generatedAt: new Date().toISOString()
    };
  },

  // Helper Methods for Academic Analytics
  calculatePerformanceTrends(grades, students, filters) {
    const filteredGrades = filters.class ? 
      grades.filter(g => g.classId === filters.class) : grades;
    
    const monthlyPerformance = {};
    filteredGrades.forEach(grade => {
      const month = new Date(grade.date).toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!monthlyPerformance[month]) {
        monthlyPerformance[month] = [];
      }
      monthlyPerformance[month].push(grade.percentage);
    });
    
    return Object.entries(monthlyPerformance).map(([month, percentages]) => ({
      month,
      average: calculateAverage(percentages),
      count: percentages.length
    }));
  },

  calculateGradeDistribution(grades, filters) {
    const filteredGrades = filters.subject ? 
      grades.filter(g => g.subject === filters.subject) : grades;
    
    const distribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    filteredGrades.forEach(grade => {
      distribution[grade.grade]++;
    });
    
    return Object.entries(distribution).map(([grade, count]) => ({
      grade,
      count,
      percentage: ((count / filteredGrades.length) * 100).toFixed(1)
    }));
  },

  calculateAttendancePerformanceCorrelation(attendance, grades, students) {
    const correlationData = students.map(student => {
      const studentAttendance = attendance.filter(a => a.studentId === student.Id);
      const studentGrades = grades.filter(g => g.studentId === student.Id);
      
      const attendanceRate = studentAttendance.length > 0 ? 
        (studentAttendance.filter(a => a.status === 'Present').length / studentAttendance.length) * 100 : 0;
      const averageGrade = studentGrades.length > 0 ? 
        calculateAverage(studentGrades.map(g => g.percentage)) : 0;
      
      return {
        studentId: student.Id,
        studentName: `${student.firstName} ${student.lastName}`,
        attendanceRate,
        averageGrade,
        class: student.class
      };
    });
    
    return correlationData.filter(data => data.attendanceRate > 0 && data.averageGrade > 0);
  },

  calculateTeacherEffectiveness(grades, teachers, students) {
    return teachers.map(teacher => {
      const teacherSubjects = teacher.subjects;
      const relevantGrades = grades.filter(g => teacherSubjects.includes(g.subject));
      const averagePerformance = relevantGrades.length > 0 ? 
        calculateAverage(relevantGrades.map(g => g.percentage)) : 0;
      
      return {
        teacherId: teacher.Id,
        teacherName: teacher.name,
        subjects: teacherSubjects,
        averageClassPerformance: averagePerformance,
        totalStudentsImpacted: new Set(relevantGrades.map(g => g.studentId)).size,
        effectivenessScore: this.calculateEffectivenessScore(averagePerformance)
      };
    });
  },

  calculateSubjectDifficultyAnalysis(grades, filters) {
    const subjectStats = {};
    
    grades.forEach(grade => {
      if (!subjectStats[grade.subject]) {
        subjectStats[grade.subject] = {
          subject: grade.subject,
          grades: [],
          assessments: new Set()
        };
      }
      subjectStats[grade.subject].grades.push(grade.percentage);
      subjectStats[grade.subject].assessments.add(grade.assessmentType);
    });
    
    return Object.values(subjectStats).map(stat => ({
      subject: stat.subject,
      averageScore: calculateAverage(stat.grades),
      difficulty: this.calculateDifficultyLevel(calculateAverage(stat.grades)),
      totalAssessments: stat.assessments.size,
      studentCount: stat.grades.length
    }));
  },

  identifyAtRiskStudents(grades, attendance, students) {
    return students.filter(student => {
      const studentGrades = grades.filter(g => g.studentId === student.Id);
      const studentAttendance = attendance.filter(a => a.studentId === student.Id);
      
      const averageGrade = studentGrades.length > 0 ? 
        calculateAverage(studentGrades.map(g => g.percentage)) : 100;
      const attendanceRate = studentAttendance.length > 0 ? 
        (studentAttendance.filter(a => a.status === 'Present').length / studentAttendance.length) * 100 : 100;
      
      return averageGrade < 60 || attendanceRate < 80;
    }).map(student => {
      const studentGrades = grades.filter(g => g.studentId === student.Id);
      const studentAttendance = attendance.filter(a => a.studentId === student.Id);
      
      return {
        ...student,
        averageGrade: studentGrades.length > 0 ? 
          calculateAverage(studentGrades.map(g => g.percentage)) : 0,
        attendanceRate: studentAttendance.length > 0 ? 
          (studentAttendance.filter(a => a.status === 'Present').length / studentAttendance.length) * 100 : 0,
        riskFactors: this.identifyRiskFactors(student, studentGrades, studentAttendance)
      };
    });
  },

  // Helper Methods for Financial Reports
  calculateCollectionMetrics(feeStructures, students, filters) {
    const totalExpected = feeStructures.reduce((sum, fee) => {
      const applicableStudents = students.filter(s => fee.classes.includes(s.class)).length;
      return sum + (fee.baseAmount * applicableStudents);
    }, 0);
    
    // Simulated collection data
    const collected = totalExpected * 0.892; // 89.2% collection rate
    
    return {
      totalExpected,
      totalCollected: collected,
      outstanding: totalExpected - collected,
      overallRate: ((collected / totalExpected) * 100).toFixed(1),
      categoryWise: this.calculateCategoryWiseCollection(feeStructures, students)
    };
  },

  calculateRevenueAnalysis(feeStructures, students, filters) {
    const monthlyRevenue = this.generateMonthlyRevenueData(feeStructures, students);
    const categoryRevenue = this.calculateCategoryRevenue(feeStructures, students);
    
    return {
      totalRevenue: monthlyRevenue.reduce((sum, month) => sum + month.revenue, 0),
      monthlyRevenue,
      categoryRevenue,
      monthlyGrowth: this.calculateMonthlyGrowth(monthlyRevenue)
    };
  },

  calculatePaymentTrends(feeStructures, filters) {
    // Simulated payment method data
    return {
      paymentMethods: [
        { method: 'Online', percentage: 65, amount: 2850000 },
        { method: 'Cash', percentage: 25, amount: 1100000 },
        { method: 'Cheque', percentage: 8, amount: 352000 },
        { method: 'Bank Transfer', percentage: 2, amount: 88000 }
      ],
      trends: this.generatePaymentTrends()
    };
  },

  // Helper Methods for Operational Insights
  calculateEnrollmentTrends(students, filters) {
    const enrollmentByClass = groupBy(students, 'class');
    const trends = Object.entries(enrollmentByClass).map(([className, classStudents]) => ({
      class: className,
      current: classStudents.length,
      capacity: this.getClassCapacity(className),
      utilization: ((classStudents.length / this.getClassCapacity(className)) * 100).toFixed(1)
    }));
    
    return {
      byClass: trends,
      total: students.length,
      growthRate: 5.2 // Simulated growth rate
    };
  },

  calculateTeacherWorkload(teachers, classes, students) {
    return teachers.map(teacher => {
      const teacherClasses = classes.filter(c => c.classTeacherId === teacher.Id);
      const totalStudents = teacherClasses.reduce((sum, c) => sum + c.strength, 0);
      
      return {
        teacherId: teacher.Id,
        teacherName: teacher.name,
        classesAssigned: teacherClasses.length,
        totalStudents,
        maxPeriods: teacher.maxPeriodsPerDay,
        workloadScore: this.calculateWorkloadScore(teacherClasses.length, totalStudents, teacher.maxPeriodsPerDay),
        subjects: teacher.subjects
      };
    });
  },

  calculateFacilityUtilization(classes, students) {
    const roomUtilization = classes.map(classItem => ({
      roomId: classItem.roomId,
      className: classItem.name,
      capacity: 35, // Assumed capacity
      currentStrength: classItem.strength,
      utilization: ((classItem.strength / 35) * 100).toFixed(1)
    }));
    
    const overallUtilization = calculateAverage(roomUtilization.map(r => parseFloat(r.utilization)));
    
    return {
      rooms: roomUtilization,
      overall: overallUtilization.toFixed(1),
      underutilized: roomUtilization.filter(r => parseFloat(r.utilization) < 70),
      overutilized: roomUtilization.filter(r => parseFloat(r.utilization) > 90)
    };
  },

  // Utility methods
  calculateOverallAttendanceRate(attendance) {
    const present = attendance.filter(a => a.status === 'Present').length;
    return attendance.length > 0 ? ((present / attendance.length) * 100).toFixed(1) : 0;
  },

  calculateImprovementRate(performanceData) {
    if (performanceData.length < 2) return 0;
    const latest = performanceData[performanceData.length - 1].average;
    const previous = performanceData[performanceData.length - 2].average;
    return ((latest - previous) / previous * 100).toFixed(1);
  },

  calculateEffectivenessScore(averagePerformance) {
    if (averagePerformance >= 85) return 'Excellent';
    if (averagePerformance >= 75) return 'Good';
    if (averagePerformance >= 65) return 'Average';
    return 'Needs Improvement';
  },

  calculateDifficultyLevel(averageScore) {
    if (averageScore >= 80) return 'Easy';
    if (averageScore >= 65) return 'Moderate';
    if (averageScore >= 50) return 'Difficult';
    return 'Very Difficult';
  },

  identifyRiskFactors(student, grades, attendance) {
    const factors = [];
    
    const avgGrade = grades.length > 0 ? calculateAverage(grades.map(g => g.percentage)) : 100;
    const attendanceRate = attendance.length > 0 ? 
      (attendance.filter(a => a.status === 'Present').length / attendance.length) * 100 : 100;
    
    if (avgGrade < 50) factors.push('Very Low Academic Performance');
    else if (avgGrade < 60) factors.push('Low Academic Performance');
    
    if (attendanceRate < 70) factors.push('Very Poor Attendance');
    else if (attendanceRate < 80) factors.push('Poor Attendance');
    
    return factors;
  },

  getClassCapacity(className) {
    const capacities = {
      '6th': 30, '7th': 30, '8th': 30,
      '9th': 35, '10th': 35,
      '11th': 40, '12th': 40
    };
    return capacities[className] || 30;
  },

  calculateWorkloadScore(classes, students, maxPeriods) {
    const score = (classes * 2) + (students * 0.1) + (maxPeriods * 0.5);
    if (score < 15) return 'Light';
    if (score < 25) return 'Moderate';
    if (score < 35) return 'Heavy';
    return 'Overloaded';
  },

  applyFilters(data, filters) {
    return data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        return !value || item[key] === value;
      });
    });
  },

  calculateCustomMetrics(data, metrics) {
    // Implementation for custom metrics calculation
    return data;
  },

  // Additional helper methods for simulated data
  calculateCategoryWiseCollection(feeStructures, students) {
    return feeStructures.map(fee => ({
      category: fee.categoryName,
      expected: fee.baseAmount * students.filter(s => fee.classes.includes(s.class)).length,
      collected: fee.baseAmount * students.filter(s => fee.classes.includes(s.class)).length * 0.89,
      rate: '89%'
    }));
  },

  generateMonthlyRevenueData(feeStructures, students) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, index) => ({
      month,
      revenue: 450000 + (index * 25000) + Math.random() * 50000,
      collections: 380 + (index * 15) + Math.random() * 30
    }));
  },

  calculateCategoryRevenue(feeStructures, students) {
    return feeStructures.map(fee => ({
      category: fee.categoryName,
      revenue: fee.baseAmount * students.filter(s => fee.classes.includes(s.class)).length * 0.89,
      percentage: Math.random() * 30 + 10
    }));
  },

  calculateMonthlyGrowth(monthlyRevenue) {
    if (monthlyRevenue.length < 2) return 0;
    const latest = monthlyRevenue[monthlyRevenue.length - 1].revenue;
    const previous = monthlyRevenue[monthlyRevenue.length - 2].revenue;
    return ((latest - previous) / previous * 100).toFixed(1);
  },

  generatePaymentTrends() {
    return [
      { month: 'Jan', online: 60, cash: 30, cheque: 8, transfer: 2 },
      { month: 'Feb', online: 62, cash: 28, cheque: 8, transfer: 2 },
      { month: 'Mar', online: 65, cash: 25, cheque: 8, transfer: 2 }
    ];
  },

  calculateFinancialForecasting(feeStructures, students) {
    return {
      nextQuarter: 1250000,
      nextYear: 5200000,
      growthProjection: 8.5
    };
  },

  calculateOutstandingAnalysis(feeStructures, students) {
    return {
      totalOutstanding: 485000,
      overdueAmount: 125000,
      criticalCases: 23
    };
  },

  calculateCommunicationMetrics() {
    return {
      parentEngagement: 78.5,
      responseRate: 65.2,
      notificationDelivery: 94.8
    };
  },

  calculateOperationalKPIs(students, teachers, attendance) {
    return {
      efficiency: 82.5,
      satisfaction: 88.3,
      resourceUtilization: 76.8
    };
  }
};