import React, { useState, useEffect, useRef } from "react";
import { BarChart3, Ticket, CheckCircle, Clock, AlertCircle } from "lucide-react";
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom Dialog Components
const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[1000]">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
};

const DialogContent = ({ children, className = "" }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

const DialogHeader = ({ children }) => (
  <div className="mb-4 pt-2">
    {children}
  </div>
);

const DialogTitle = ({ children }) => (
  <h2 className="text-xl font-semibold">
    {children}
  </h2>
);

const DialogFooter = ({ children, className = "" }) => (
  <div className={`mt-6 flex flex-wrap justify-end gap-4 ${className}`}>
    {children}
  </div>
);

const Button = ({ variant = "default", onClick, children, className = "" }) => {
  const baseStyles = "px-4 py-2 rounded-md font-medium transition-colors";
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    destructive: "bg-red-600 text-white hover:bg-red-700"
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Alert = ({ type, message, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible) return null;

  const bgColor = type === 'success' ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500';
  const textColor = type === 'success' ? 'text-green-700' : 'text-red-700';

  return (
    <div className={`fixed top-4 right-4 p-4 rounded-md border-l-4 ${bgColor} ${textColor} max-w-md z-50`}>
      <div className="flex justify-between items-center">
        <div>{message}</div>
        <button onClick={() => { setVisible(false); if (onClose) onClose(); }} className="ml-4">
          ×
        </button>
      </div>
    </div>
  );
};

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
  const [engineerLocation, setEngineerLocation] = useState(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const mapContainerRef = useRef(null);
  
  // New state for ticket resolution form
  const [resolution, setResolution] = useState("");
  const [preventiveAction, setPreventiveAction] = useState("");
  const [warrantyCategory, setWarrantyCategory] = useState("");
  const [ticketStatus, setTicketStatus] = useState("Closed");
  
  // Alert state
  const [alertInfo, setAlertInfo] = useState(null);

  const loggedInEngineerMobileNumber = localStorage.getItem("loggedInEngineerMobileNumber");
  

  // Initialize map and marker
  useEffect(() => {
    if (!mapContainerRef.current || !engineerLocation || map) return;

    const newMap = L.map(mapContainerRef.current).setView([engineerLocation.latitude, engineerLocation.longitude], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(newMap);

    const newMarker = L.marker([engineerLocation.latitude, engineerLocation.longitude]).addTo(newMap);
    setMap(newMap);
    setMarker(newMarker);
  }, [engineerLocation, map]);

  // Update marker position
  useEffect(() => {
    if (map && marker && engineerLocation) {
      marker.setLatLng([engineerLocation.latitude, engineerLocation.longitude]);
      map.setView([engineerLocation.latitude, engineerLocation.longitude]);
    }
  }, [engineerLocation, map, marker]);

  const fetchTickets = async () => {
    try {
      if (!loggedInEngineerMobileNumber) {
        setError("Mobile number is missing or not logged in.");
        return;
      }

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/tickets/engineer`, {
        params: {
          mobile: loggedInEngineerMobileNumber
        }
      });
      
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

  // Fetch tickets and dashboard stats
  useEffect(() => {
    if (!loggedInEngineerMobileNumber) {
      setError("Mobile number is missing or not logged in.");
      setLoading(false);
      return;
    }

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

  // Watch and update engineer's location
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const newLat = position.coords.latitude;
        const newLon = position.coords.longitude;

        setEngineerLocation({
          latitude: newLat,
          longitude: newLon,
        });

        if (!loggedInEngineerMobileNumber) {
          setError("Engineer mobile number not found.");
          return;
        }

        try {
          await axios.put(
            `${import.meta.env.VITE_API_URL}/engineers/location`,
            {
              mobile: loggedInEngineerMobileNumber,
              lat: newLat,
              lon: newLon,
            }
          );
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
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [loggedInEngineerMobileNumber]);

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
    setIsDialogOpen(true);
    // Reset form fields when opening a new ticket
    setResolution("");
    setPreventiveAction("");
    setWarrantyCategory("");
    setTicketStatus("Closed"); // Default status is Closed
  };

  const handleAcceptTicket = async () => {
    if (!selectedTicket || !selectedTicket.ticketId) {
      setError("Invalid ticket information");
      return;
    }

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/tickets/${selectedTicket.ticketId}/accept`,
        {
          engineerMobile: loggedInEngineerMobileNumber
        }
      );

      if (response.status === 200) {
        await fetchTickets();
        setIsDialogOpen(false);
        setAlertInfo({
          type: 'success',
          message: 'Ticket accepted successfully!'
        });
      }
    } catch (err) {
      console.error('Error accepting ticket:', err);
      const errorMessage = err.response?.data?.message || 'Failed to accept ticket';
      setAlertInfo({
        type: 'error',
        message: errorMessage
      });
    }
  };

  const handleRejectTicket = async () => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/tickets/${selectedTicket._id}/reject`, {
        engineerMobile: loggedInEngineerMobileNumber
      });
      fetchTickets();
      setIsDialogOpen(false);
      setAlertInfo({
        type: 'success',
        message: 'Ticket rejected successfully!'
      });
    } catch (err) {
      console.error('Error rejecting ticket:', err);
      setAlertInfo({
        type: 'error',
        message: err.response?.data?.message || 'Failed to reject ticket'
      });
    }
  };

  const handleUpdateTicket = async () => {
  try {
    if (!selectedTicket || !selectedTicket.ticketId) {
      setAlertInfo({
        type: 'error',
        message: "Invalid ticket information"
      });
      return;
    }
    
    // Check if all required fields are filled
    if (!resolution || !preventiveAction || !warrantyCategory || !ticketStatus) {
      setAlertInfo({
        type: 'error',
        message: "All fields are required"
      });
      return;
    }

    // Prepare the request body according to the new API requirements
    const requestBody = {
      ticketId: selectedTicket.ticketId,
      engineerMobile: loggedInEngineerMobileNumber,
      resolution,
      preventiveAction,
      warrantyCategory,
      status: ticketStatus,
      issueCategory: selectedTicket.issueCategory?.name || '',
      issueDescription: selectedTicket.description || '',
      firstName: selectedTicket.name || ''
    };
    
    // Call the updated API endpoint
    const response = await axios.put(
      `${import.meta.env.VITE_API_URL}/close-ticket-engineer`, 
      requestBody
    );
    
    await fetchTickets();
    setIsDialogOpen(false);
    setAlertInfo({
      type: 'success',
      message: response.data.message || `Ticket ${ticketStatus === 'Closed' ? 'closed' : 'updated'} successfully!`
    });
  } catch (err) {
    console.error('Error updating ticket:', err);
    setAlertInfo({
      type: 'error',
      message: err.response?.data?.message || 'Failed to update ticket'
    });
  }
};

  const StatusBadge = ({ status }) => {
    const getStatusColor = (status) => {
      switch (status?.toLowerCase()) {
        case 'open':
          return 'bg-yellow-100 text-yellow-800';
        case 'in-progress':
          return 'bg-blue-100 text-blue-800';
        case 'closed':
          return 'bg-green-100 text-green-800';
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

  const TicketCard = ({ ticket }) => (
    <div 
      className="bg-white rounded-lg shadow-sm p-4 mb-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => handleTicketClick(ticket)} 
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-blue-600 font-medium">{ticket.ticketId}</h3>
        <StatusBadge status={ticket.status} />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Name:</span>
          <span className="font-medium">{ticket.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Company:</span>
          <span className="font-medium">{ticket.companyName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Category:</span>
          <span className="font-medium">{ticket.issueCategory.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Assigned To:</span>
          <span className="font-medium">{ticket.engineerId.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Date:</span>
          <span className="font-medium">
            {new Date(ticket.date).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: '2-digit'
            })}
          </span>
        </div>
      </div>
    </div>
  );

  const TicketDialog = () => {
  const isAccepted = selectedTicket?.acceptedByEngineer === "yes";
  const [localFormValues, setLocalFormValues] = useState({
    resolution: '',
    preventiveAction: '',
    warrantyCategory: '',
    ticketStatus: 'Closed'
  });

  // Fetch ticket details when dialog is opened
  useEffect(() => {
    if (isDialogOpen && selectedTicket) {
      const fetchTicketDetails = async () => {
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/tickets/engineer`, {
            params: {
              mobile: loggedInEngineerMobileNumber,
              ticketId: selectedTicket.ticketId // Fetch by ticketId
            }
          });

          // Find the ticket details from the API response
          const ticketDetails = response.data.find(ticket => ticket.ticketId === selectedTicket.ticketId);

          if (ticketDetails) {
            setLocalFormValues({
              resolution: ticketDetails.resolution || '',
              preventiveAction: ticketDetails.preventiveAction || '',
              warrantyCategory: ticketDetails.warrantyCategory || '',
              ticketStatus: ticketDetails.status || 'Closed'
            });
          } else {
            console.warn('Ticket details not found for ticketId:', selectedTicket.ticketId);
          }
        } catch (err) {
          console.error('Error fetching ticket details:', err);
          setAlertInfo({
            type: 'error',
            message: 'Failed to fetch ticket details'
          });
        }
      };

      fetchTicketDetails();
    }
  }, [isDialogOpen, selectedTicket]);

  // Update parent state only when submitting
  const handleSubmit = () => {
    setResolution(localFormValues.resolution);
    setPreventiveAction(localFormValues.preventiveAction);
    setWarrantyCategory(localFormValues.warrantyCategory);
    setTicketStatus(localFormValues.ticketStatus);
    handleUpdateTicket();
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ticket Details</DialogTitle>
        </DialogHeader>
        {selectedTicket && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Ticket No.</label>
                <p className="font-medium">{selectedTicket.ticketId}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Status</label>
                <p>
                  <StatusBadge status={selectedTicket.status} />
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Name</label>
                <p className="font-medium">{selectedTicket.name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Company</label>
                <p className="font-medium">{selectedTicket.companyName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Category</label>
                <p className="font-medium">{selectedTicket.issueCategory?.name || ''}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Engineer</label>
                <p className="font-medium">{selectedTicket.engineerId?.name || ''}</p>
              </div>
              <div className="col-span-1 sm:col-span-2">
                <label className="text-sm text-gray-500">Date & Time</label>
                <p className="font-medium">
                  {new Date(selectedTicket.date).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit'
                  })} {selectedTicket.time}
                </p>
              </div>
              {selectedTicket.description && (
                <div className="col-span-1 sm:col-span-2">
                  <label className="text-sm text-gray-500">Description</label>
                  <p className="font-medium">{selectedTicket.description}</p>
                </div>
              )}
            </div>

            {isAccepted && (
              <div className="mt-6 border-t pt-4">
                <h3 className="text-lg font-medium mb-4">Ticket Resolution</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Resolution:
                    </label>
                    <textarea
                      value={localFormValues.resolution}
                      onChange={(e) => setLocalFormValues(prev => ({
                        ...prev,
                        resolution: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                      placeholder="Enter resolution details"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preventive Action:
                    </label>
                    <textarea
                      value={localFormValues.preventiveAction}
                      onChange={(e) => setLocalFormValues(prev => ({
                        ...prev,
                        preventiveAction: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                      placeholder="Enter preventive action details"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Warranty Category:
                    </label>
                    <select
                      value={localFormValues.warrantyCategory}
                      onChange={(e) => setLocalFormValues(prev => ({
                        ...prev,
                        warrantyCategory: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Warranty Category</option>
                      <option value="In Warranty">Comprehensive AMC</option>
                      <option value="Out of Warranty">Non Comprehensive AMC</option>
                      <option value="Extended Warranty">In-Warranty</option>
                      <option value="Not Applicable">Out-of-Warranty</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ticket Status:
                    </label>
                    <select
                      value={localFormValues.ticketStatus}
                      onChange={(e) => setLocalFormValues(prev => ({
                        ...prev,
                        ticketStatus: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Closed">Closed</option>
                      <option value="In-Progress">In-Progress</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-center sm:justify-end">
                  <Button onClick={handleSubmit}>
                    Update Ticket
                  </Button>
                </div>
              </div>
            )}

            {!isAccepted && (
              <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                <Button
                  variant="destructive"
                  onClick={handleRejectTicket}
                  className="w-full sm:w-auto order-2 sm:order-1"
                >
                  Reject Ticket
                </Button>
                <Button
                  variant="default"
                  onClick={handleAcceptTicket}
                  className="w-full sm:w-auto order-1 sm:order-2"
                >
                  Accept Ticket
                </Button>
              </DialogFooter>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
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
      {/* Alert component */}
      {alertInfo && (
        <Alert 
          type={alertInfo.type} 
          message={alertInfo.message} 
          onClose={() => setAlertInfo(null)} 
        />
      )}

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
                {dashboardStats.totalOpenTickets}</h3>
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
            <div ref={mapContainerRef} style={{ height: "300px", width: "100%" }} className="z-0"></div>
          </div>
        ) : (
          <p className="text-gray-500">Fetching location...</p>
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
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {openTickets
                      .filter(ticket => ticket.status === "In-Progress")
                      .map((ticket) => (
                        <tr 
                          key={ticket._id} 
                          className="border-b hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleTicketClick(ticket)}
                        >
                          <td className="py-3 px-4 text-blue-600">{ticket.ticketId}</td>
                          <td className="py-3 px-4">{ticket.name}</td>
                          <td className="py-3 px-4">{ticket.companyName}</td>
                          <td className="py-3 px-4">{ticket.issueCategory.name}</td>
                          <td className="py-3 px-4">{ticket.engineerId.name}</td>
                          <td className="py-3 px-4">
                            {new Date(ticket.date).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: '2-digit',
                              year: '2-digit'
                            })}
                          </td>
                          <td className="py-3 px-4">
                            <StatusBadge status={ticket.status} />
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile and Tablet Card View */}
              <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
                {openTickets
                  .filter(ticket => ticket.status === "In-Progress")
                  .map((ticket) => (
                    <TicketCard key={ticket._id} ticket={ticket} />
                  ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Ticket Details Dialog */}
      <TicketDialog />
    </div>
  );
};

export default EngineerDashboard;