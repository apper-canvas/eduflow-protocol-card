import enquiriesData from '@/services/mockData/enquiries.json';

let enquiries = [...enquiriesData];
let nextId = Math.max(...enquiries.map(e => e.Id)) + 1;

export const enquiryService = {
  // Get all enquiries
  getAll() {
    return Promise.resolve([...enquiries]);
  },

  // Get enquiry by ID
  getById(id) {
    const enquiry = enquiries.find(e => e.Id === parseInt(id));
    return Promise.resolve(enquiry ? { ...enquiry } : null);
  },

  // Create new enquiry
  create(enquiryData) {
    const newEnquiry = {
      ...enquiryData,
      Id: nextId++,
      enquiryDate: enquiryData.enquiryDate || new Date().toISOString().split('T')[0],
      status: enquiryData.status || 'New'
    };
    enquiries.push(newEnquiry);
    return Promise.resolve({ ...newEnquiry });
  },

  // Update enquiry
  update(id, enquiryData) {
    const index = enquiries.findIndex(e => e.Id === parseInt(id));
    if (index === -1) {
      return Promise.reject(new Error('Enquiry not found'));
    }
    enquiries[index] = { ...enquiries[index], ...enquiryData };
    return Promise.resolve({ ...enquiries[index] });
  },

  // Delete enquiry
  delete(id) {
    const index = enquiries.findIndex(e => e.Id === parseInt(id));
    if (index === -1) {
      return Promise.reject(new Error('Enquiry not found'));
    }
    const deleted = enquiries.splice(index, 1)[0];
    return Promise.resolve({ ...deleted });
  },

  // Search enquiries
  search(query) {
    const results = enquiries.filter(enquiry =>
      enquiry.studentName.toLowerCase().includes(query.toLowerCase()) ||
      enquiry.parentName.toLowerCase().includes(query.toLowerCase()) ||
      enquiry.contactNumber.includes(query) ||
      enquiry.email.toLowerCase().includes(query.toLowerCase())
    );
    return Promise.resolve([...results]);
  },

  // Filter enquiries by status
  filterByStatus(status) {
    const results = enquiries.filter(enquiry => enquiry.status === status);
    return Promise.resolve([...results]);
  },

  // Convert enquiry to application
  convertToApplication(enquiryId, applicationData) {
    const enquiry = enquiries.find(e => e.Id === parseInt(enquiryId));
    if (!enquiry) {
      return Promise.reject(new Error('Enquiry not found'));
    }
    
    // Update enquiry status
    enquiry.status = 'Converted';
    
    // Return application data with enquiry reference
    const application = {
      ...applicationData,
      enquiryId: enquiry.Id,
      studentName: enquiry.studentName,
      parentName: enquiry.parentName,
      contactNumber: enquiry.contactNumber,
      email: enquiry.email,
      preferredClass: enquiry.preferredClass,
      studentDateOfBirth: enquiry.studentDateOfBirth,
      studentGender: enquiry.studentGender,
      address: enquiry.address,
      fatherName: enquiry.fatherName,
      motherName: enquiry.motherName,
      fatherOccupation: enquiry.fatherOccupation,
      motherOccupation: enquiry.motherOccupation
    };
    
    return Promise.resolve(application);
  }
};