import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Sidebar from '@/components/organisms/Sidebar';
import Header from '@/components/organisms/Header';
import Dashboard from '@/components/pages/Dashboard';
import Students from '@/components/pages/Students';
import Admissions from '@/components/pages/Admissions';
import MarkAttendance from '@/components/pages/MarkAttendance';
import Academics from '@/components/pages/Academics';
import PlaceholderPage from '@/components/pages/PlaceholderPage';
function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header onMenuClick={handleMenuClick} />
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
            <div className="container mx-auto px-6 py-8">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/students" element={<Students />} />
                <Route path="/students/:id" element={<Students />} />
                <Route path="/students/:id/edit" element={<Students />} />
                <Route path="/students/new" element={<Students />} />
                
<Route path="/admissions" element={<Admissions />} />
                <Route path="/admissions/enquiries/:id" element={<Admissions />} />
                <Route path="/admissions/applications/:id" element={<Admissions />} />
                
<Route path="/academics" element={<Academics />} />
                
<Route 
                  path="/attendance" 
                  element={<MarkAttendance />} 
                />
                
                <Route 
                  path="/communications" 
                  element={
                    <PlaceholderPage
                      title="Communications Hub"
                      description="Centralized communication platform for school-wide announcements, messaging, and notifications."
                      icon="MessageSquare"
                      gradient="from-pink-500 to-rose-600"
                      comingSoonFeatures={[
                        {
                          icon: "Mail",
                          title: "Messaging System",
                          description: "Direct messaging between teachers, students, and parents"
                        },
                        {
                          icon: "Megaphone",
                          title: "Announcements",
                          description: "School-wide announcements and important notifications"
                        },
                        {
                          icon: "Phone",
                          title: "SMS Integration",
                          description: "Automated SMS notifications for important updates"
                        }
                      ]}
                    />
                  } 
                />
                
                <Route 
                  path="/timetable" 
                  element={
                    <PlaceholderPage
                      title="Timetable Management"
                      description="Smart timetable creation and management system with conflict detection and teacher allocation."
                      icon="Clock"
                      gradient="from-orange-500 to-amber-600"
                      comingSoonFeatures={[
                        {
                          icon: "Calendar",
                          title: "Class Scheduling",
                          description: "Automated class scheduling with conflict detection"
                        },
                        {
                          icon: "Users",
                          title: "Teacher Allocation",
                          description: "Efficient teacher assignment and workload management"
                        },
                        {
                          icon: "Map",
                          title: "Room Management",
                          description: "Classroom allocation and resource management"
                        }
                      ]}
                    />
                  } 
                />
                
                <Route 
                  path="/examinations" 
                  element={
                    <PlaceholderPage
                      title="Examination Management"
                      description="Complete examination management system from scheduling to result processing and report generation."
                      icon="FileText"
                      gradient="from-red-500 to-pink-600"
                      comingSoonFeatures={[
                        {
                          icon: "Calendar",
                          title: "Exam Scheduling",
                          description: "Create and manage exam schedules with automatic notifications"
                        },
                        {
                          icon: "ClipboardList",
                          title: "Result Processing",
                          description: "Efficient result entry and grade calculation system"
                        },
                        {
                          icon: "FileBarChart",
                          title: "Report Cards",
                          description: "Automated report card generation and distribution"
                        }
                      ]}
                    />
                  } 
                />
                
                <Route 
                  path="/finance" 
                  element={
                    <PlaceholderPage
                      title="Finance Management"
                      description="Comprehensive financial management system for fee collection, payments, and financial reporting."
                      icon="CreditCard"
                      gradient="from-green-500 to-teal-600"
                      comingSoonFeatures={[
                        {
                          icon: "DollarSign",
                          title: "Fee Management",
                          description: "Automated fee calculation and collection tracking"
                        },
                        {
                          icon: "Receipt",
                          title: "Payment Processing",
                          description: "Multiple payment methods with receipt generation"
                        },
                        {
                          icon: "TrendingUp",
                          title: "Financial Reports",
                          description: "Detailed financial reports and analytics"
                        }
                      ]}
                    />
                  } 
                />
                
                <Route 
                  path="/transport" 
                  element={
                    <PlaceholderPage
                      title="Transport Management"
                      description="Complete transport management system with route planning, vehicle tracking, and safety monitoring."
                      icon="Bus"
                      gradient="from-yellow-500 to-orange-600"
                      comingSoonFeatures={[
                        {
                          icon: "MapPin",
                          title: "Route Management",
                          description: "Optimize bus routes and manage pickup/drop points"
                        },
                        {
                          icon: "Navigation",
                          title: "Vehicle Tracking",
                          description: "Real-time GPS tracking of school vehicles"
                        },
                        {
                          icon: "Shield",
                          title: "Safety Monitoring",
                          description: "Student safety alerts and emergency notifications"
                        }
                      ]}
                    />
                  } 
                />
                
                <Route 
                  path="/reports" 
                  element={
                    <PlaceholderPage
                      title="Reports & Analytics"
                      description="Comprehensive reporting and analytics dashboard with customizable reports and data insights."
                      icon="BarChart3"
                      gradient="from-indigo-500 to-purple-600"
                      comingSoonFeatures={[
                        {
                          icon: "PieChart",
                          title: "Custom Reports",
                          description: "Create custom reports with flexible filtering and grouping"
                        },
                        {
                          icon: "TrendingUp",
                          title: "Analytics Dashboard",
                          description: "Interactive charts and graphs for data visualization"
                        },
                        {
                          icon: "Download",
                          title: "Export Options",
                          description: "Export reports in multiple formats (PDF, Excel, CSV)"
                        }
                      ]}
                    />
                  } 
                />
              </Routes>
            </div>
          </main>
        </div>
        
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </BrowserRouter>
  );
}

export default App;