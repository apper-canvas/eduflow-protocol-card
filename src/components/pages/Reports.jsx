import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Select from '@/components/atoms/Select';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import { reportsService } from '@/services/api/reportsService';
import Chart from 'react-apexcharts';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('academic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({});

  const tabs = [
    { id: 'academic', label: 'Academic Analytics', icon: 'TrendingUp' },
    { id: 'financial', label: 'Financial Reports', icon: 'DollarSign' },
    { id: 'operational', label: 'Operational Insights', icon: 'BarChart3' },
    { id: 'custom', label: 'Custom Reports', icon: 'Settings' }
  ];

  useEffect(() => {
    loadReportData();
  }, [activeTab, filters]);

  const loadReportData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let reportData;
      
      switch (activeTab) {
        case 'academic':
          reportData = await reportsService.getAcademicAnalytics(filters);
          break;
        case 'financial':
          reportData = await reportsService.getFinancialReports(filters);
          break;
        case 'operational':
          reportData = await reportsService.getOperationalInsights(filters);
          break;
        case 'custom':
          reportData = await reportsService.getCustomReportData({
            dataSource: 'students',
            filters,
            metrics: ['count', 'average']
          });
          break;
        default:
          reportData = null;
      }
      
      setData(reportData);
      toast.success(`${tabs.find(t => t.id === activeTab)?.label} loaded successfully`);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const exportReport = async (format) => {
    try {
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (err) {
      toast.error('Failed to export report');
    }
  };

  if (loading && !data) return <Loading />;
  if (error && !data) return <Error message={error} onRetry={loadReportData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="mt-2 text-gray-600">Comprehensive insights and data analysis</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button
            variant="outline"
            onClick={() => exportReport('pdf')}
            className="flex items-center space-x-2"
          >
            <ApperIcon name="Download" size={16} />
            <span>Export PDF</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => exportReport('excel')}
            className="flex items-center space-x-2"
          >
            <ApperIcon name="FileSpreadsheet" size={16} />
            <span>Export Excel</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2
                ${activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <ApperIcon name={tab.icon} size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              <span className="text-gray-600">Loading...</span>
            </div>
          </div>
        )}

        {activeTab === 'academic' && data && <AcademicAnalytics data={data} filters={filters} onFilterChange={handleFilterChange} />}
        {activeTab === 'financial' && data && <FinancialReports data={data} filters={filters} onFilterChange={handleFilterChange} />}
        {activeTab === 'operational' && data && <OperationalInsights data={data} filters={filters} onFilterChange={handleFilterChange} />}
        {activeTab === 'custom' && data && <CustomReports data={data} filters={filters} onFilterChange={handleFilterChange} />}
      </div>
    </div>
  );
};

// Academic Analytics Component
const AcademicAnalytics = ({ data, filters, onFilterChange }) => {
  const performanceChartOptions = {
    chart: { type: 'line', height: 350, toolbar: { show: false } },
    stroke: { curve: 'smooth', width: 3 },
    colors: ['#2563eb', '#10b981'],
    xaxis: { categories: data.performanceData.map(d => d.month) },
    yaxis: { title: { text: 'Average Score' } },
    grid: { borderColor: '#f1f5f9' },
    legend: { position: 'top' }
  };

  const performanceChartSeries = [
    {
      name: 'Class Average',
      data: data.performanceData.map(d => d.average)
    }
  ];

  const gradeDistributionOptions = {
    chart: { type: 'donut', height: 300 },
    colors: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#6b7280'],
    labels: data.gradeDistribution.map(d => `Grade ${d.grade}`),
    legend: { position: 'bottom' },
    responsive: [{
      breakpoint: 480,
      options: { chart: { width: 200 }, legend: { position: 'bottom' } }
    }]
  };

  const gradeDistributionSeries = data.gradeDistribution.map(d => parseInt(d.count));

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="min-w-0 flex-1">
            <Select
              value={filters.class || ''}
              onChange={(e) => onFilterChange('class', e.target.value)}
              className="w-full"
            >
              <option value="">All Classes</option>
              <option value="9th">9th Grade</option>
              <option value="10th">10th Grade</option>
              <option value="11th">11th Grade</option>
              <option value="12th">12th Grade</option>
            </Select>
          </div>
          <div className="min-w-0 flex-1">
            <Select
              value={filters.subject || ''}
              onChange={(e) => onFilterChange('subject', e.target.value)}
              className="w-full"
            >
              <option value="">All Subjects</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Science">Science</option>
              <option value="English">English</option>
              <option value="Social Studies">Social Studies</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ApperIcon name="Users" className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{data.summary.totalStudents}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <ApperIcon name="TrendingUp" className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Average Grade</p>
              <p className="text-2xl font-bold text-gray-900">{data.summary.averageGrade.toFixed(1)}%</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <ApperIcon name="Calendar" className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Attendance Rate</p>
              <p className="text-2xl font-bold text-gray-900">{data.summary.attendanceRate}%</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <ApperIcon name="ArrowUp" className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Improvement</p>
              <p className="text-2xl font-bold text-gray-900">+{data.summary.improvementRate}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
          <Chart
            options={performanceChartOptions}
            series={performanceChartSeries}
            type="line"
            height={350}
          />
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Grade Distribution</h3>
          <Chart
            options={gradeDistributionOptions}
            series={gradeDistributionSeries}
            type="donut"
            height={300}
          />
        </Card>
      </div>

      {/* At-Risk Students */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">At-Risk Students</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average Grade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Factors</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.atRiskStudents.slice(0, 10).map((student) => (
                <tr key={student.Id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.firstName} {student.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.class}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.averageGrade.toFixed(1)}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.attendanceRate.toFixed(1)}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.riskFactors.join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// Financial Reports Component
const FinancialReports = ({ data, filters, onFilterChange }) => {
  const revenueChartOptions = {
    chart: { type: 'column', height: 350, toolbar: { show: false } },
    colors: ['#10b981', '#3b82f6'],
    xaxis: { categories: data.revenueAnalysis.monthlyRevenue.map(d => d.month) },
    yaxis: { title: { text: 'Revenue (₹)' } },
    legend: { position: 'top' },
    grid: { borderColor: '#f1f5f9' }
  };

  const revenueChartSeries = [
    {
      name: 'Revenue',
      data: data.revenueAnalysis.monthlyRevenue.map(d => d.revenue)
    }
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <ApperIcon name="DollarSign" className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{(data.summary.totalRevenue / 100000).toFixed(1)}L</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ApperIcon name="TrendingUp" className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Collection Rate</p>
              <p className="text-2xl font-bold text-gray-900">{data.summary.collectionRate}%</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <ApperIcon name="AlertCircle" className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Outstanding</p>
              <p className="text-2xl font-bold text-gray-900">₹{(data.summary.outstandingAmount / 100000).toFixed(1)}L</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <ApperIcon name="ArrowUp" className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Growth</p>
              <p className="text-2xl font-bold text-gray-900">+{data.summary.monthlyGrowth}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue</h3>
          <Chart
            options={revenueChartOptions}
            series={revenueChartSeries}
            type="column"
            height={350}
          />
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
          <div className="space-y-4">
            {data.paymentTrends.paymentMethods.map((method, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-green-500' : 
                    index === 1 ? 'bg-blue-500' : 
                    index === 2 ? 'bg-yellow-500' : 'bg-purple-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-900">{method.method}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{method.percentage}%</p>
                  <p className="text-xs text-gray-500">₹{(method.amount / 100000).toFixed(1)}L</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Collection Details */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Category-wise Collection</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collected</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.collectionData.categoryWise.map((category, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {category.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{category.expected.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{category.collected.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// Operational Insights Component
const OperationalInsights = ({ data, filters, onFilterChange }) => {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ApperIcon name="Users" className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Enrollment</p>
              <p className="text-2xl font-bold text-gray-900">{data.summary.totalEnrollment}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <ApperIcon name="UserCheck" className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Teacher:Student</p>
              <p className="text-2xl font-bold text-gray-900">1:{data.summary.teacherStudentRatio}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <ApperIcon name="Building" className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Capacity Usage</p>
              <p className="text-2xl font-bold text-gray-900">{data.summary.capacityUtilization}%</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <ApperIcon name="Activity" className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Efficiency</p>
              <p className="text-2xl font-bold text-gray-900">{data.summary.operationalEfficiency}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Enrollment Trends */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Class-wise Enrollment</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.enrollmentTrends.byClass.map((classData, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {classData.class}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{classData.current}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{classData.capacity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{classData.utilization}%</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      parseFloat(classData.utilization) > 90 ? 'bg-red-100 text-red-800' :
                      parseFloat(classData.utilization) > 80 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {parseFloat(classData.utilization) > 90 ? 'Overcrowded' :
                       parseFloat(classData.utilization) > 80 ? 'High' : 'Normal'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Teacher Workload */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Teacher Workload Analysis</h3>
        <div className="space-y-4">
          {data.teacherWorkload.slice(0, 8).map((teacher, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{teacher.teacherName}</p>
                <p className="text-sm text-gray-500">{teacher.subjects.join(', ')}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{teacher.totalStudents} students</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  teacher.workloadScore === 'Overloaded' ? 'bg-red-100 text-red-800' :
                  teacher.workloadScore === 'Heavy' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {teacher.workloadScore}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// Custom Reports Component
const CustomReports = ({ data, filters, onFilterChange }) => {
  const [reportConfig, setReportConfig] = useState({
    dataSource: 'students',
    groupBy: '',
    metrics: ['count']
  });

  return (
    <div className="space-y-6">
      {/* Report Builder */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Builder</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data Source</label>
            <Select
              value={reportConfig.dataSource}
              onChange={(e) => setReportConfig(prev => ({ ...prev, dataSource: e.target.value }))}
              className="w-full"
            >
              <option value="students">Students</option>
              <option value="grades">Grades</option>
              <option value="attendance">Attendance</option>
              <option value="fees">Fees</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Group By</label>
            <Select
              value={reportConfig.groupBy}
              onChange={(e) => setReportConfig(prev => ({ ...prev, groupBy: e.target.value }))}
              className="w-full"
            >
              <option value="">No Grouping</option>
              <option value="class">Class</option>
              <option value="section">Section</option>
              <option value="subject">Subject</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <Select className="w-full">
              <option value="current_month">Current Month</option>
              <option value="last_3_months">Last 3 Months</option>
              <option value="current_year">Current Year</option>
              <option value="custom">Custom Range</option>
            </Select>
          </div>
        </div>
        <div className="mt-4">
          <Button className="flex items-center space-x-2">
            <ApperIcon name="Play" size={16} />
            <span>Generate Report</span>
          </Button>
        </div>
      </Card>

      {/* Quick Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ApperIcon name="Users" className="h-5 w-5 text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-900">Student Directory</h4>
          </div>
          <p className="text-sm text-gray-500">Complete student information with contact details</p>
        </Card>
        
        <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ApperIcon name="BarChart3" className="h-5 w-5 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-900">Performance Summary</h4>
          </div>
          <p className="text-sm text-gray-500">Academic performance across all subjects</p>
        </Card>
        
        <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ApperIcon name="Calendar" className="h-5 w-5 text-yellow-600" />
            </div>
            <h4 className="font-medium text-gray-900">Attendance Report</h4>
          </div>
          <p className="text-sm text-gray-500">Monthly attendance patterns and trends</p>
        </Card>
        
        <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ApperIcon name="DollarSign" className="h-5 w-5 text-purple-600" />
            </div>
            <h4 className="font-medium text-gray-900">Fee Collection</h4>
          </div>
          <p className="text-sm text-gray-500">Fee collection status and outstanding amounts</p>
        </Card>
        
        <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <ApperIcon name="AlertTriangle" className="h-5 w-5 text-red-600" />
            </div>
            <h4 className="font-medium text-gray-900">At-Risk Analysis</h4>
          </div>
          <p className="text-sm text-gray-500">Students requiring immediate attention</p>
        </Card>
        
        <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <ApperIcon name="Users" className="h-5 w-5 text-indigo-600" />
            </div>
            <h4 className="font-medium text-gray-900">Teacher Effectiveness</h4>
          </div>
          <p className="text-sm text-gray-500">Teacher performance and student outcomes</p>
        </Card>
      </div>
    </div>
  );
};

export default Reports;