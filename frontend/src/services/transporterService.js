import api from './api';

export const transporterService = {
  // Transport Bookings & Trips
  getActiveTrips: () => api.get('/transport/active-trips'),
  getAvailableLoads: () => api.get('/transport/available-loads'),
  acceptLoad: (loadId) => api.post(`/transport/loads/${loadId}/accept`),
  updateTripStatus: (tripId, status, telemetry) => api.patch(`/transport/trips/${tripId}`, { status, telemetry }),
  
  // Fleet & Drivers
  getFleet: () => api.get('/transport/fleet'),
  addVehicle: (data) => api.post('/transport/fleet', data),
  getDrivers: () => api.get('/transport/drivers'),
  addDriver: (data) => api.post('/transport/drivers', data),

  // Earnings & Profile
  getEarnings: () => api.get('/transport/earnings'),
  getProfile: () => api.get('/transport/profile')
};

export default transporterService;
