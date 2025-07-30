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
import Communications from '@/components/pages/Communications';
import Timetable from '@/components/pages/Timetable';
import Finance from '@/components/pages/Finance';
import Examinations from '@/components/pages/Examinations';
import Transport from '@/components/pages/Transport';
import Reports from '@/components/pages/Reports';
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
                
<Route path="/communications" element={<Communications />} />
                
<Route path="/timetable" element={<Timetable />} />
                
                <Route path="/examinations" element={<Examinations />} />
                
<Route path="/finance" element={<Finance />} />
                <Route 
path="/transport" 
                element={<Transport />} 
              />
                
<Route path="/reports" element={<Reports />} />
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