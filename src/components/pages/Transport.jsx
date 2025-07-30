import React, { useState, useEffect } from 'react';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';
import SearchBar from '@/components/molecules/SearchBar';
import FilterDropdown from '@/components/molecules/FilterDropdown';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import RouteForm from '@/components/organisms/RouteForm';
import StopForm from '@/components/organisms/StopForm';
import VehicleForm from '@/components/organisms/VehicleForm';
import { routeService, vehicleService, driverService, transportReportService } from '@/services/api/transportService';

const Transport = () => {
  const [activeTab, setActiveTab] = useState('routes');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Routes & Stops State
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [showRouteForm, setShowRouteForm] = useState(false);
  const [showStopForm, setShowStopForm] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [editingStop, setEditingStop] = useState(null);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState([]);
  
  // Vehicle Management State
  const [vehicles, setVehicles] = useState([]);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  
  // Drivers State
  const [drivers, setDrivers] = useState([]);
  
  // Reports State
  const [dashboardMetrics, setDashboardMetrics] = useState({});
  
  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const tabs = [
    { id: 'routes', label: 'Routes & Stops', icon: 'MapPin' },
    { id: 'allocation', label: 'Student Allocation', icon: 'Users' },
    { id: 'vehicles', label: 'Vehicle Management', icon: 'Truck' },
    { id: 'reports', label: 'Transport Reports', icon: 'BarChart3' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
    { value: 'Maintenance', label: 'Maintenance' }
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'Morning Pickup', label: 'Morning Pickup' },
    { value: 'Afternoon Drop', label: 'Afternoon Drop' },
    { value: 'Both', label: 'Both' }
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [routesData, vehiclesData, driversData, metricsData] = await Promise.all([
        routeService.getAll(),
        vehicleService.getAll(),
        driverService.getAll(),
        transportReportService.getDashboardMetrics()
      ]);
      
      setRoutes(routesData);
      setVehicles(vehiclesData);
      setDrivers(driversData);
      setDashboardMetrics(metricsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoute = async (routeData) => {
    try {
      const newRoute = await routeService.create(routeData);
      setRoutes(prev => [...prev, newRoute]);
      setShowRouteForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateRoute = async (routeId, routeData) => {
    try {
      const updatedRoute = await routeService.update(routeId, routeData);
      setRoutes(prev => prev.map(r => r.Id === routeId ? updatedRoute : r));
      setEditingRoute(null);
      setShowRouteForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteRoute = async (routeId) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      try {
        await routeService.delete(routeId);
        setRoutes(prev => prev.filter(r => r.Id !== routeId));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleOptimizeRoute = async (routeId) => {
    try {
      const suggestions = await routeService.optimizeRoute(routeId);
      setOptimizationSuggestions(suggestions);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateVehicle = async (vehicleData) => {
    try {
      const newVehicle = await vehicleService.create(vehicleData);
      setVehicles(prev => [...prev, newVehicle]);
      setShowVehicleForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateVehicle = async (vehicleId, vehicleData) => {
    try {
      const updatedVehicle = await vehicleService.update(vehicleId, vehicleData);
      setVehicles(prev => prev.map(v => v.Id === vehicleId ? updatedVehicle : v));
      setEditingVehicle(null);
      setShowVehicleForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await vehicleService.delete(vehicleId);
        setVehicles(prev => prev.filter(v => v.Id !== vehicleId));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const getFilteredRoutes = () => {
    return routes.filter(route => {
      const matchesSearch = route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          route.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || route.status === statusFilter;
      const matchesType = typeFilter === 'all' || route.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  };

  const getFilteredVehicles = () => {
    return vehicles.filter(vehicle => {
      const matchesSearch = vehicle.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  };

  if (loading) return <Loading message="Loading transport data..." />;
  if (error) return <Error message={error} onRetry={loadInitialData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">Transport Management</h1>
          <p className="text-gray-600 mt-1">Manage routes, vehicles, drivers, and transport operations</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => loadInitialData()}
            className="flex items-center"
          >
            <ApperIcon name="RefreshCw" size={16} className="mr-2" />
            Refresh Data
          </Button>
          
          {activeTab === 'routes' && (
            <Button
              variant="primary"
              onClick={() => setShowRouteForm(true)}
              className="flex items-center"
            >
              <ApperIcon name="Plus" size={16} className="mr-2" />
              Add Route
            </Button>
          )}
          
          {activeTab === 'vehicles' && (
            <Button
              variant="primary"
              onClick={() => setShowVehicleForm(true)}
              className="flex items-center"
            >
              <ApperIcon name="Plus" size={16} className="mr-2" />
              Add Vehicle
            </Button>
          )}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Routes</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardMetrics.totalRoutes || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <ApperIcon name="MapPin" className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Vehicles</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardMetrics.activeVehicles || 0}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <ApperIcon name="Truck" className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Students Transported</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardMetrics.totalStudents || 0}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <ApperIcon name="Users" className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">On-Time Performance</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardMetrics.onTimePerformance || '0%'}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <ApperIcon name="Clock" className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ApperIcon name={tab.icon} size={16} className="mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'routes' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search routes by name or code..."
              />
            </div>
            <div className="flex gap-4">
              <FilterDropdown
                label="Status"
                value={statusFilter}
                onChange={setStatusFilter}
                options={statusOptions}
              />
              <FilterDropdown
                label="Type"
                value={typeFilter}
                onChange={setTypeFilter}
                options={typeOptions}
              />
            </div>
          </div>

          {/* Routes List */}
          {getFilteredRoutes().length === 0 ? (
            <Empty
              title="No routes found"
              message="Get started by creating your first transport route."
              icon="MapPin"
              actionLabel="Add Route"
              onAction={() => setShowRouteForm(true)}
              type="default"
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {getFilteredRoutes().map((route) => (
                <Card key={route.Id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{route.name}</h3>
                      <p className="text-sm text-gray-600">{route.code}</p>
                    </div>
                    <Badge variant={route.status === 'Active' ? 'success' : 'danger'}>
                      {route.status}
                    </Badge>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <ApperIcon name="Clock" size={16} className="mr-2" />
                      {route.startTime} - {route.endTime}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <ApperIcon name="MapPin" size={16} className="mr-2" />
                      {route.stops?.length || 0} stops • {route.totalDistance}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <ApperIcon name="Users" size={16} className="mr-2" />
                      {route.currentOccupancy}/{route.maxCapacity} students
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRoute(route);
                        setEditingRoute(route);
                        setShowRouteForm(true);
                      }}
                    >
                      <ApperIcon name="Edit" size={14} className="mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOptimizeRoute(route.Id)}
                    >
                      <ApperIcon name="Zap" size={14} className="mr-1" />
                      Optimize
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteRoute(route.Id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <ApperIcon name="Trash2" size={14} className="mr-1" />
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Optimization Suggestions */}
          {optimizationSuggestions.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Route Optimization Suggestions
              </h3>
              <div className="space-y-4">
                {optimizationSuggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start p-4 bg-blue-50 rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-full mr-4">
                      <ApperIcon name="Lightbulb" className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{suggestion.type}</h4>
                      <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                      <p className="text-xs text-gray-500 mt-2">{suggestion.details}</p>
                    </div>
                    <Badge variant={suggestion.impact === 'High' ? 'success' : suggestion.impact === 'Medium' ? 'warning' : 'default'}>
                      {suggestion.impact} Impact
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'allocation' && (
        <Card className="p-8 text-center">
          <div className="p-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full w-20 h-20 mx-auto mb-6">
            <ApperIcon name="Users" className="w-8 h-8 text-white mt-2" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Student Allocation</h3>
          <p className="text-gray-600 mb-6">Assign students to transport routes and manage pickup/drop points.</p>
          <Badge variant="warning">Coming Soon</Badge>
        </Card>
      )}

      {activeTab === 'vehicles' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search vehicles by number, brand, or model..."
              />
            </div>
            <div className="flex gap-4">
              <FilterDropdown
                label="Status"
                value={statusFilter}
                onChange={setStatusFilter}
                options={statusOptions}
              />
            </div>
          </div>

          {/* Vehicles List */}
          {getFilteredVehicles().length === 0 ? (
            <Empty
              title="No vehicles found"
              message="Get started by adding your first vehicle to the fleet."
              icon="Truck"
              actionLabel="Add Vehicle"
              onAction={() => setShowVehicleForm(true)}
              type="default"
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {getFilteredVehicles().map((vehicle) => (
                <Card key={vehicle.Id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{vehicle.vehicleNumber}</h3>
                      <p className="text-sm text-gray-600">{vehicle.brand} {vehicle.model}</p>
                    </div>
                    <Badge variant={vehicle.status === 'Active' ? 'success' : vehicle.status === 'Maintenance' ? 'warning' : 'danger'}>
                      {vehicle.status}
                    </Badge>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <ApperIcon name="Calendar" size={16} className="mr-2" />
                      Year: {vehicle.year}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <ApperIcon name="Users" size={16} className="mr-2" />
                      Capacity: {vehicle.capacity} students
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <ApperIcon name="Fuel" size={16} className="mr-2" />
                      {vehicle.fuelType} • {vehicle.mileage}
                    </div>
                    {vehicle.currentRoute && (
                      <div className="flex items-center text-sm text-gray-600">
                        <ApperIcon name="Route" size={16} className="mr-2" />
                        {vehicle.currentRoute}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingVehicle(vehicle);
                        setShowVehicleForm(true);
                      }}
                    >
                      <ApperIcon name="Edit" size={14} className="mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteVehicle(vehicle.Id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <ApperIcon name="Trash2" size={14} className="mr-1" />
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'reports' && (
        <Card className="p-8 text-center">
          <div className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full w-20 h-20 mx-auto mb-6">
            <ApperIcon name="BarChart3" className="w-8 h-8 text-white mt-2" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Transport Reports</h3>
          <p className="text-gray-600 mb-6">Generate comprehensive reports on transport operations, performance metrics, and analytics.</p>
          <Badge variant="warning">Coming Soon</Badge>
        </Card>
      )}

      {/* Modals */}
      {showRouteForm && (
        <RouteForm
          route={editingRoute}
          onSubmit={editingRoute ? (data) => handleUpdateRoute(editingRoute.Id, data) : handleCreateRoute}
          onCancel={() => {
            setShowRouteForm(false);
            setEditingRoute(null);
          }}
          drivers={drivers}
          vehicles={vehicles}
        />
      )}

      {showStopForm && (
        <StopForm
          stop={editingStop}
          onSubmit={(stopData) => {
            // Handle stop creation/update
            setShowStopForm(false);
            setEditingStop(null);
          }}
          onCancel={() => {
            setShowStopForm(false);
            setEditingStop(null);
          }}
        />
      )}

      {showVehicleForm && (
        <VehicleForm
          vehicle={editingVehicle}
          onSubmit={editingVehicle ? (data) => handleUpdateVehicle(editingVehicle.Id, data) : handleCreateVehicle}
          onCancel={() => {
            setShowVehicleForm(false);
            setEditingVehicle(null);
          }}
          drivers={drivers}
        />
      )}
    </div>
  );
};

export default Transport;