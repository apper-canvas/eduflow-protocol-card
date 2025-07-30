import applicationsData from '@/services/mockData/applications.json';

let applications = [...applicationsData];
let nextId = Math.max(...applications.map(a => a.Id)) + 1;
let nextAppNumber = Math.max(...applications.map(a => parseInt(a.applicationNumber.replace('APP', '')))) + 1;

export const applicationService = {
  // Get all applications
  getAll() {
    return Promise.resolve([...applications]);
  },

  // Get application by ID
  getById(id) {
    const application = applications.find(a => a.Id === parseInt(id));
    return Promise.resolve(application ? { ...application } : null);
  },

  // Create new application
  create(applicationData) {
    const newApplication = {
      ...applicationData,
      Id: nextId++,
      applicationNumber: `APP${String(nextAppNumber++).padStart(3, '0')}`,
      applicationDate: applicationData.applicationDate || new Date().toISOString().split('T')[0],
      status: applicationData.status || 'Under Review',
      documentsSubmitted: applicationData.documentsSubmitted || [],
      interviewStatus: applicationData.interviewStatus || 'Pending',
      admissionTest: applicationData.admissionTest || 'Pending',
      feePaid: applicationData.feePaid || false
    };
    applications.push(newApplication);
    return Promise.resolve({ ...newApplication });
  },

  // Update application
  update(id, applicationData) {
    const index = applications.findIndex(a => a.Id === parseInt(id));
    if (index === -1) {
      return Promise.reject(new Error('Application not found'));
    }
    applications[index] = { ...applications[index], ...applicationData };
    return Promise.resolve({ ...applications[index] });
  },

  // Delete application
  delete(id) {
    const index = applications.findIndex(a => a.Id === parseInt(id));
    if (index === -1) {
      return Promise.reject(new Error('Application not found'));
    }
    const deleted = applications.splice(index, 1)[0];
    return Promise.resolve({ ...deleted });
  },

  // Search applications
  search(query) {
    const results = applications.filter(application =>
      application.studentName.toLowerCase().includes(query.toLowerCase()) ||
      application.parentName.toLowerCase().includes(query.toLowerCase()) ||
      application.applicationNumber.toLowerCase().includes(query.toLowerCase()) ||
      application.contactNumber.includes(query) ||
      application.email.toLowerCase().includes(query.toLowerCase())
    );
    return Promise.resolve([...results]);
  },

  // Filter applications by status
  filterByStatus(status) {
    const results = applications.filter(application => application.status === status);
    return Promise.resolve([...results]);
  },

  // Update application status
  updateStatus(id, status, notes = '') {
    const index = applications.findIndex(a => a.Id === parseInt(id));
    if (index === -1) {
      return Promise.reject(new Error('Application not found'));
    }
    applications[index] = { 
      ...applications[index], 
      status,
      notes: notes || applications[index].notes
    };
    return Promise.resolve({ ...applications[index] });
  },

  // Schedule interview
  scheduleInterview(id, interviewDate) {
    const index = applications.findIndex(a => a.Id === parseInt(id));
    if (index === -1) {
      return Promise.reject(new Error('Application not found'));
    }
    applications[index] = { 
      ...applications[index], 
      interviewDate,
      interviewStatus: 'Scheduled'
    };
    return Promise.resolve({ ...applications[index] });
  }
};