import { toast } from 'react-toastify';
import routesData from '@/services/mockData/routes.json';
import vehiclesData from '@/services/mockData/vehicles.json';
import driversData from '@/services/mockData/drivers.json';
import transportReportsData from '@/services/mockData/transportReports.json';

// Routes Service
let routes = [...routesData];
let routeCounter = Math.max(...routes.map(r => r.Id)) + 1;

export const routeService = {
  getAll: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...routes]);
      }, 500);
    });
  },

  getById: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const route = routes.find(r => r.Id === parseInt(id));
        if (route) {
          resolve({ ...route });
        } else {
          reject(new Error('Route not found'));
        }
      }, 300);
    });
  },

  create: (routeData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newRoute = {
          ...routeData,
          Id: routeCounter++,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
          stops: routeData.stops?.map((stop, index) => ({
            ...stop,
            Id: Date.now() + index,
            sequence: index + 1
          })) || []
        };
        routes.push(newRoute);
        toast.success('Route created successfully!');
        resolve({ ...newRoute });
      }, 800);
    });
  },

  update: (id, routeData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = routes.findIndex(r => r.Id === parseInt(id));
        if (index !== -1) {
          routes[index] = {
            ...routes[index],
            ...routeData,
            Id: parseInt(id),
            updatedAt: new Date().toISOString().split('T')[0]
          };
          toast.success('Route updated successfully!');
          resolve({ ...routes[index] });
        } else {
          toast.error('Route not found');
          reject(new Error('Route not found'));
        }
      }, 800);
    });
  },

  delete: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = routes.findIndex(r => r.Id === parseInt(id));
        if (index !== -1) {
          routes.splice(index, 1);
          toast.success('Route deleted successfully!');
          resolve();
        } else {
          toast.error('Route not found');
          reject(new Error('Route not found'));
        }
      }, 500);
    });
  },

  optimizeRoute: (routeId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const suggestions = [
          {
            type: 'Time Optimization',
            description: 'Reduce total travel time by 12 minutes',
            impact: 'High',
            details: 'Reorder stops 3 and 4 to avoid traffic congestion'
          },
          {
            type: 'Distance Optimization',
            description: 'Save 3.2 km daily distance',
            impact: 'Medium',
            details: 'Alternative route through Highway bypass'
          },
          {
            type: 'Student Distribution',
            description: 'Balance passenger load',
            impact: 'Low',
            details: 'Move 3 students from Route A to Route B'
          }
        ];
        resolve(suggestions);
      }, 1000);
    });
  }
};

// Vehicles Service
let vehicles = [...vehiclesData];
let vehicleCounter = Math.max(...vehicles.map(v => v.Id)) + 1;

export const vehicleService = {
  getAll: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...vehicles]);
      }, 500);
    });
  },

  getById: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const vehicle = vehicles.find(v => v.Id === parseInt(id));
        if (vehicle) {
          resolve({ ...vehicle });
        } else {
          reject(new Error('Vehicle not found'));
        }
      }, 300);
    });
  },

  create: (vehicleData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newVehicle = {
          ...vehicleData,
          Id: vehicleCounter++,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0]
        };
        vehicles.push(newVehicle);
        toast.success('Vehicle added successfully!');
        resolve({ ...newVehicle });
      }, 800);
    });
  },

  update: (id, vehicleData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = vehicles.findIndex(v => v.Id === parseInt(id));
        if (index !== -1) {
          vehicles[index] = {
            ...vehicles[index],
            ...vehicleData,
            Id: parseInt(id),
            updatedAt: new Date().toISOString().split('T')[0]
          };
          toast.success('Vehicle updated successfully!');
          resolve({ ...vehicles[index] });
        } else {
          toast.error('Vehicle not found');
          reject(new Error('Vehicle not found'));
        }
      }, 800);
    });
  },

  delete: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = vehicles.findIndex(v => v.Id === parseInt(id));
        if (index !== -1) {
          vehicles.splice(index, 1);
          toast.success('Vehicle deleted successfully!');
          resolve();
        } else {
          toast.error('Vehicle not found');
          reject(new Error('Vehicle not found'));
        }
      }, 500);
    });
  }
};

// Drivers Service
let drivers = [...driversData];
let driverCounter = Math.max(...drivers.map(d => d.Id)) + 1;

export const driverService = {
  getAll: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...drivers]);
      }, 500);
    });
  },

  getById: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const driver = drivers.find(d => d.Id === parseInt(id));
        if (driver) {
          resolve({ ...driver });
        } else {
          reject(new Error('Driver not found'));
        }
      }, 300);
    });
  },

  create: (driverData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newDriver = {
          ...driverData,
          Id: driverCounter++,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0]
        };
        drivers.push(newDriver);
        toast.success('Driver added successfully!');
        resolve({ ...newDriver });
      }, 800);
    });
  },

  update: (id, driverData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = drivers.findIndex(d => d.Id === parseInt(id));
        if (index !== -1) {
          drivers[index] = {
            ...drivers[index],
            ...driverData,
            Id: parseInt(id),
            updatedAt: new Date().toISOString().split('T')[0]
          };
          toast.success('Driver updated successfully!');
          resolve({ ...drivers[index] });
        } else {
          toast.error('Driver not found');
          reject(new Error('Driver not found'));
        }
      }, 800);
    });
  },

  delete: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = drivers.findIndex(d => d.Id === parseInt(id));
        if (index !== -1) {
          drivers.splice(index, 1);
          toast.success('Driver deleted successfully!');
          resolve();
        } else {
          toast.error('Driver not found');
          reject(new Error('Driver not found'));
        }
      }, 500);
    });
  }
};

// Transport Reports Service
let transportReports = [...transportReportsData];

export const transportReportService = {
  getAll: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...transportReports]);
      }, 500);
    });
  },

  getDashboardMetrics: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const metrics = {
          totalRoutes: routes.length,
          activeRoutes: routes.filter(r => r.status === 'Active').length,
          totalVehicles: vehicles.length,
          activeVehicles: vehicles.filter(v => v.status === 'Active').length,
          totalStudents: routes.reduce((sum, route) => sum + (route.currentOccupancy || 0), 0),
          onTimePerformance: '95%',
          fuelEfficiency: '8.7 km/l',
          maintenanceAlerts: vehicles.filter(v => v.status === 'Maintenance').length
        };
        resolve(metrics);
      }, 300);
    });
  },

  generateReport: (reportType, filters) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const reportData = {
          Id: Date.now(),
          reportType,
          filters,
          generatedAt: new Date().toISOString(),
          data: transportReports[0] // Mock report data
        };
        toast.success('Report generated successfully!');
        resolve(reportData);
      }, 1500);
    });
  }
};

export default {
  routes: routeService,
  vehicles: vehicleService,
  drivers: driverService,
  reports: transportReportService
};