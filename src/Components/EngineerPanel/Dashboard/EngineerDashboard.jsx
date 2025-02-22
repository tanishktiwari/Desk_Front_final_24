import React, { useState, useEffect, useRef } from "react";
import { BarChart3, Ticket, CheckCircle, Clock, AlertCircle } from "lucide-react";
import axios from 'axios';
import L from 'leaflet'; // For Leaflet
import 'leaflet/dist/leaflet.css'; // Leaflet CSS

const EngineerDashboard = () => {
  const [openTickets, setOpenTickets] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    monthlyOpenTickets: 0,
    totalOpenTickets: 0,
    totalClosedTickets: 0,
    averageETA: "0 hours",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [engineerLocation, setEngineerLocation] = useState(null); // State for engineer's location
  const [map, setMap] = useState(null); // State for Leaflet map instance
  const [marker, setMarker] = useState(null); // State for Leaflet marker
  const [distance, setDistance] = useState(null); // State for distance to company
  const [estimatedTime, setEstimatedTime] = useState(null); // State for estimated time to reach
  const mapContainerRef = useRef(null); // Reference to the map container

  // Get the logged-in engineer's mobile number from localStorage
  const loggedInEngineerMobileNumber = localStorage.getItem("loggedInEngineerMobileNumber");

  // Initialize the map and marker only once
  useEffect(() => {
    if (!mapContainerRef.current || !engineerLocation || map) return; // Prevent reinitialization

    const newMap = L.map(mapContainerRef.current).setView([engineerLocation.latitude, engineerLocation.longitude], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(newMap);

    const newMarker = L.marker([engineerLocation.latitude, engineerLocation.longitude]).addTo(newMap);
    setMap(newMap);
    setMarker(newMarker);
  }, [engineerLocation, map]);

  // Update the marker position when the location changes
  useEffect(() => {
    if (map && marker && engineerLocation) {
      marker.setLatLng([engineerLocation.latitude, engineerLocation.longitude]);
      map.setView([engineerLocation.latitude, engineerLocation.longitude]);
    }
  }, [engineerLocation, map, marker]);

  // Fetch tickets and dashboard stats
  useEffect(() => {
    if (!loggedInEngineerMobileNumber) {
      setError("Mobile number is missing or not logged in.");
      setLoading(false);
      return;
    }

    const fetchTickets = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/tickets/engineer-issues`);
        setOpenTickets(Array.isArray(response.data) ? response.data : []);
        
        if (!Array.isArray(response.data)) {
          console.warn('API response is not an array:', response.data);
        }
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError(err.response?.data?.message || 'Failed to fetch tickets');
        setOpenTickets([]);
      }
    };

    const fetchDashboardStats = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/engineer-stats`, {
          params: { mobile: loggedInEngineerMobileNumber }
        });

        const { monthlyOpenTickets, totalOpenTickets, totalClosedTickets, averageEtaHours, averageEtaDays } = response.data;

        let averageETA = "";
        if (averageEtaDays > 0) {
          averageETA = `${averageEtaDays.toFixed(1)} days`;
        } else {
          averageETA = `${averageEtaHours.toFixed(1)} hours`;
        }

        setDashboardStats({
          monthlyOpenTickets,
          totalOpenTickets,
          totalClosedTickets,
          averageETA,
        });

      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError(err.response?.data?.message || 'Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
    fetchDashboardStats();
  }, [loggedInEngineerMobileNumber]);

  // New useEffect to fetch and update engineer's real-time location
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const newLat = position.coords.latitude;
        const newLon = position.coords.longitude;

        // Update the state to show real-time location on the map
        setEngineerLocation({
          latitude: newLat,
          longitude: newLon,
        });

        // Ensure mobile number is available
        if (!loggedInEngineerMobileNumber) {
          setError("Engineer mobile number not found.");
          return;
        }

        // Send the location to the backend
        try {
          await axios.put(
            `${import.meta.env.VITE_API_URL}/engineers/location`,
            {
              mobile: loggedInEngineerMobileNumber,  // Send mobile number instead of ID
              lat: newLat,
              lon: newLon,
            }
          );

          // Fetch estimated time and distance to the company
          const estimateResponse = await axios.post(`${import.meta.env.VITE_API_URL}/api/engineer-estimate`, {
            mobile: loggedInEngineerMobileNumber,
            companyName: "Foxnet Securitas",
          });

          setDistance(estimateResponse.data.distanceKm);
          setEstimatedTime(estimateResponse.data.estimatedTimeInHours);
        } catch (err) {
          console.error("Error sending location to backend:", err);
          setError("Failed to update location.");
        }
      },
      (err) => {
        console.error("Error fetching location:", err);
        setError("Failed to fetch location.");
      },
      {
        enableHighAccuracy: true, // For more accurate location
        timeout: 5000, // Timeout after 5 seconds
        maximumAge: 0, // Force fresh location
      }
    );

    // Cleanup the watcher on component unmount
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const StatusBadge = ({ status }) => {
    const getStatusColor = (status) => {
      switch (status?.toLowerCase()) {
        case 'open':
          return 'bg-yellow-100 text-yellow-800';
        case 'in-progress':
          return 'bg-blue-100 text-blue-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(status)}`}>
        {status || 'Unknown'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500 gap-2">
        <AlertCircle className="h-5 w-5" />
        <span>Error loading tickets: {error}</span>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-100 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg">Monthly Open Tickets</p>
              <h3 className="text-xl font-semibold">
                {dashboardStats.monthlyOpenTickets}
              </h3>
            </div>
            <BarChart3 className="text-blue-500" size={24} />
          </div>
        </div>

        <div className="bg-green-100 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg">Total Open Tickets</p>
              <h3 className="text-2xl font-semibold">
                {dashboardStats.totalOpenTickets}
              </h3>
            </div>
            <Ticket className="text-yellow-500" size={24} />
          </div>
        </div>

        <div className="bg-purple-100 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg">Total Closed Tickets</p>
              <h3 className="text-2xl font-semibold">
                {dashboardStats.totalClosedTickets}
              </h3>
            </div>
            <CheckCircle className="text-green-500" size={24} />
          </div>
        </div>

        <div className="bg-red-100 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Average ETA</p>
              <h3 className="text-2xl font-semibold">
                {dashboardStats.averageETA}
              </h3>
            </div>
            <Clock className="text-purple-500" size={24} />
          </div>
        </div>
      </div>

      {/* Engineer's Location and Map */}
      <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
        <h2 className="text-lg font-semibold mb-4">Your Current Location</h2>
        {engineerLocation ? (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Latitude: {engineerLocation.latitude.toFixed(6)}, Longitude: {engineerLocation.longitude.toFixed(6)}
            </p>
            <div ref={mapContainerRef} style={{ height: "300px", width: "100%" }}></div>
          </div>
        ) : (
          <p className="text-gray-500">Fetching location...</p>
        )}
      </div>

      {/* Estimated Time and Distance Section */}
      <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
        <h2 className="text-lg font-semibold mb-4">Estimated Time and Distance to Foxnet Securitas</h2>
        {distance !== null && estimatedTime !== null ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Distance</p>
              <h3 className="text-xl font-semibold">{distance.toFixed(2)} km</h3>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Estimated Time</p>
              <h3 className="text-xl font-semibold">{estimatedTime.toFixed(2)} hours</h3>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Calculating distance and time...</p>
        )}
      </div>

      {/* Tickets Section */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Open Tickets</h2>

          {openTickets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No tickets found
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Ticket No.</th>
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-left py-3 px-4">Company</th>
                      <th className="text-left py-3 px-4">Category</th>
                      <th className="text-left py-3 px-4">Assigned To</th>
                      <th className="text-left py-3 px-4">Date & Time</th>
                      <th className="text-left py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {openTickets.map((ticket) => (
                      <tr key={ticket.ticketNo || ticket._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-blue-600">{ticket.ticketNo}</td>
                        <td className="py-3 px-4">{ticket.name}</td>
                        <td className="py-3 px-4">{ticket.companyName}</td>
                        <td className="py-3 px-4">{ticket.category}</td>
                        <td className="py-3 px-4">{ticket.assignedTo}</td>
                        <td className="py-3 px-4">{new Date(ticket.timestamp).toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <StatusBadge status={ticket.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EngineerDashboard;