import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import SearchBar from '@/components/molecules/SearchBar';
import FilterDropdown from '@/components/molecules/FilterDropdown';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import EnquiryTable from '@/components/organisms/EnquiryTable';
import ApplicationTable from '@/components/organisms/ApplicationTable';
import EnquiryForm from '@/components/organisms/EnquiryForm';
import ApplicationForm from '@/components/organisms/ApplicationForm';
import EnquiryDetails from '@/components/organisms/EnquiryDetails';
import ApplicationDetails from '@/components/organisms/ApplicationDetails';
import { enquiryService } from '@/services/api/enquiryService';
import { applicationService } from '@/services/api/applicationService';

const Admissions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Tab state
  const [activeTab, setActiveTab] = useState('enquiries');
  
  // Enquiry state
  const [enquiries, setEnquiries] = useState([]);
  const [filteredEnquiries, setFilteredEnquiries] = useState([]);
  const [enquiryLoading, setEnquiryLoading] = useState(true);
  const [enquiryError, setEnquiryError] = useState(null);
  
  // Application state
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [applicationLoading, setApplicationLoading] = useState(true);
  const [applicationError, setApplicationError] = useState(null);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState('enquiryDate');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Modal state
  const [showEnquiryForm, setShowEnquiryForm] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showEnquiryDetails, setShowEnquiryDetails] = useState(false);
  const [showApplicationDetails, setShowApplicationDetails] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [convertingEnquiry, setConvertingEnquiry] = useState(null);

  // Load data
  useEffect(() => {
    loadEnquiries();
    loadApplications();
  }, []);

  // Handle URL params
  useEffect(() => {
    if (id) {
      if (window.location.pathname.includes('/enquiries/')) {
        setActiveTab('enquiries');
        loadEnquiryDetails(id);
      } else if (window.location.pathname.includes('/applications/')) {
        setActiveTab('applications');
        loadApplicationDetails(id);
      }
    }
  }, [id]);

  // Filter and search
  useEffect(() => {
    applyFilters();
  }, [enquiries, applications, searchQuery, statusFilter, sortField, sortOrder]);

  const loadEnquiries = async () => {
    try {
      setEnquiryLoading(true);
      const data = await enquiryService.getAll();
      setEnquiries(data);
    } catch (error) {
      setEnquiryError('Failed to load enquiries');
      toast.error('Failed to load enquiries');
    } finally {
      setEnquiryLoading(false);
    }
  };

  const loadApplications = async () => {
    try {
      setApplicationLoading(true);
      const data = await applicationService.getAll();
      setApplications(data);
    } catch (error) {
      setApplicationError('Failed to load applications');
      toast.error('Failed to load applications');
    } finally {
      setApplicationLoading(false);
    }
  };

  const loadEnquiryDetails = async (enquiryId) => {
    try {
      const enquiry = await enquiryService.getById(enquiryId);
      if (enquiry) {
        setSelectedEnquiry(enquiry);
        setShowEnquiryDetails(true);
      }
    } catch (error) {
      toast.error('Failed to load enquiry details');
    }
  };

  const loadApplicationDetails = async (applicationId) => {
    try {
      const application = await applicationService.getById(applicationId);
      if (application) {
        setSelectedApplication(application);
        setShowApplicationDetails(true);
      }
    } catch (error) {
      toast.error('Failed to load application details');
    }
  };

  const applyFilters = () => {
    // Filter enquiries
    let filtered = [...enquiries];
    
    if (searchQuery) {
      filtered = filtered.filter(enquiry =>
        enquiry.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        enquiry.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        enquiry.contactNumber.includes(searchQuery) ||
        enquiry.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (statusFilter) {
      filtered = filtered.filter(enquiry => enquiry.status === statusFilter);
    }
    
    // Sort enquiries
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'enquiryDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    setFilteredEnquiries(filtered);

    // Filter applications
    let filteredApps = [...applications];
    
    if (searchQuery) {
      filteredApps = filteredApps.filter(app =>
        app.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.contactNumber.includes(searchQuery) ||
        app.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (statusFilter) {
      filteredApps = filteredApps.filter(app => app.status === statusFilter);
    }
    
    // Sort applications
    filteredApps.sort((a, b) => {
      let aValue = a[sortField === 'enquiryDate' ? 'applicationDate' : sortField];
      let bValue = b[sortField === 'enquiryDate' ? 'applicationDate' : sortField];
      
      if (sortField === 'enquiryDate' || sortField === 'applicationDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    setFilteredApplications(filteredApps);
  };

  const handleEnquirySubmit = async (enquiryData) => {
    try {
      if (selectedEnquiry) {
        await enquiryService.update(selectedEnquiry.Id, enquiryData);
        toast.success('Enquiry updated successfully');
      } else {
        await enquiryService.create(enquiryData);
        toast.success('New enquiry added successfully');
      }
      setShowEnquiryForm(false);
      setSelectedEnquiry(null);
      loadEnquiries();
    } catch (error) {
      toast.error('Failed to save enquiry');
    }
  };

  const handleApplicationSubmit = async (applicationData) => {
    try {
      if (selectedApplication) {
        await applicationService.update(selectedApplication.Id, applicationData);
        toast.success('Application updated successfully');
      } else if (convertingEnquiry) {
        // Convert enquiry to application
        const convertedApp = await enquiryService.convertToApplication(convertingEnquiry.Id, applicationData);
        await applicationService.create(convertedApp);
        toast.success('Enquiry converted to application successfully');
        loadEnquiries(); // Refresh to show updated enquiry status
      } else {
        await applicationService.create(applicationData);
        toast.success('New application added successfully');
      }
      setShowApplicationForm(false);
      setSelectedApplication(null);
      setConvertingEnquiry(null);
      loadApplications();
    } catch (error) {
      toast.error('Failed to save application');
    }
  };

  const handleEnquiryClick = (enquiry) => {
    navigate(`/admissions/enquiries/${enquiry.Id}`);
  };

  const handleApplicationClick = (application) => {
    navigate(`/admissions/applications/${application.Id}`);
  };

  const handleConvertToApplication = (enquiry) => {
    setConvertingEnquiry(enquiry);
    setShowApplicationForm(true);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const closeModals = () => {
    setShowEnquiryForm(false);
    setShowApplicationForm(false);
    setShowEnquiryDetails(false);
    setShowApplicationDetails(false);
    setSelectedEnquiry(null);
    setSelectedApplication(null);
    setConvertingEnquiry(null);
    navigate('/admissions');
  };

  const enquiryStatusOptions = [
    { value: '', label: 'All Status' },
    { value: 'New', label: 'New' },
    { value: 'Contacted', label: 'Contacted' },
    { value: 'Interested', label: 'Interested' },
    { value: 'Not Interested', label: 'Not Interested' }
  ];

  const applicationStatusOptions = [
    { value: '', label: 'All Status' },
    { value: 'Under Review', label: 'Under Review' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Waitlisted', label: 'Waitlisted' }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-display">Admissions Management</h1>
          <p className="text-gray-600 mt-1">Manage enquiries and applications</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <Card className="p-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
          <button
            onClick={() => setActiveTab('enquiries')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
              activeTab === 'enquiries'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <ApperIcon name="Users" size={16} />
              <span>Enquiries</span>
              <span className="bg-primary-100 text-primary-800 px-2 py-0.5 rounded-full text-xs">
                {filteredEnquiries.length}
              </span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
              activeTab === 'applications'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <ApperIcon name="FileText" size={16} />
              <span>Applications</span>
              <span className="bg-primary-100 text-primary-800 px-2 py-0.5 rounded-full text-xs">
                {filteredApplications.length}
              </span>
            </div>
          </button>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={`Search ${activeTab}...`}
            />
          </div>
          <div className="flex gap-2">
            <FilterDropdown
              value={statusFilter}
              onChange={setStatusFilter}
              options={activeTab === 'enquiries' ? enquiryStatusOptions : applicationStatusOptions}
              placeholder="Filter by status"
            />
            <Button
              variant="primary"
              onClick={() => {
                if (activeTab === 'enquiries') {
                  setShowEnquiryForm(true);
                } else {
                  setShowApplicationForm(true);
                }
              }}
            >
              <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
              Add New {activeTab === 'enquiries' ? 'Enquiry' : 'Application'}
            </Button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'enquiries' ? (
          enquiryLoading ? (
            <Loading type="skeleton" />
          ) : enquiryError ? (
            <Error message={enquiryError} onRetry={loadEnquiries} />
          ) : filteredEnquiries.length === 0 ? (
            <Empty
              icon="Users"
              title="No enquiries found"
              description={searchQuery || statusFilter ? "Try adjusting your search or filter criteria." : "Get started by adding your first enquiry."}
            />
          ) : (
            <EnquiryTable
              enquiries={filteredEnquiries}
              onEnquiryClick={handleEnquiryClick}
              onConvertToApplication={handleConvertToApplication}
              onSort={handleSort}
              sortField={sortField}
              sortOrder={sortOrder}
            />
          )
        ) : (
          applicationLoading ? (
            <Loading type="skeleton" />
          ) : applicationError ? (
            <Error message={applicationError} onRetry={loadApplications} />
          ) : filteredApplications.length === 0 ? (
            <Empty
              icon="FileText"
              title="No applications found"
              description={searchQuery || statusFilter ? "Try adjusting your search or filter criteria." : "Get started by adding your first application."}
            />
          ) : (
            <ApplicationTable
              applications={filteredApplications}
              onApplicationClick={handleApplicationClick}
              onSort={handleSort}
              sortField={sortField === 'enquiryDate' ? 'applicationDate' : sortField}
              sortOrder={sortOrder}
            />
          )
        )}
      </Card>

      {/* Modals */}
      {showEnquiryForm && (
        <EnquiryForm
          enquiry={selectedEnquiry}
          onSubmit={handleEnquirySubmit}
          onCancel={closeModals}
        />
      )}

      {showApplicationForm && (
        <ApplicationForm
          application={selectedApplication}
          enquiry={convertingEnquiry}
          onSubmit={handleApplicationSubmit}
          onCancel={closeModals}
        />
      )}

      {showEnquiryDetails && selectedEnquiry && (
        <EnquiryDetails
          enquiry={selectedEnquiry}
          onEdit={(enquiry) => {
            setSelectedEnquiry(enquiry);
            setShowEnquiryDetails(false);
            setShowEnquiryForm(true);
          }}
          onConvert={handleConvertToApplication}
          onClose={closeModals}
        />
      )}

      {showApplicationDetails && selectedApplication && (
        <ApplicationDetails
          application={selectedApplication}
          onEdit={(application) => {
            setSelectedApplication(application);
            setShowApplicationDetails(false);
            setShowApplicationForm(true);
          }}
          onClose={closeModals}
        />
      )}
    </div>
  );
};

export default Admissions;