import React, { useState, useEffect } from "react";
import { BarChart3, Ticket, CheckCircle, Clock, AlertCircle } from "lucide-react";
import axios from 'axios';

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

  // Get the logged-in engineer's mobile number from localStorage
  const loggedInEngineerMobileNumber = localStorage.getItem("loggedInEngineerMobileNumber");

  useEffect(() => {
    if (!loggedInEngineerMobileNumber) {
      setError("Mobile number is missing or not logged in.");
      setLoading(false);
      return;
    }

    const fetchTickets = async () => {
      try {
        // Fetch open tickets data for the engineer
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
        // Fetch stats for engineer using mobile number
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/engineer-stats`, {
          params: { mobile: loggedInEngineerMobileNumber }
        });

        const { monthlyOpenTickets, totalOpenTickets, totalClosedTickets, averageEtaHours, averageEtaDays } = response.data;

        // Format the average ETA
        let averageETA = "";
        if (averageEtaDays > 0) {
          averageETA = `${averageEtaDays.toFixed(1)} days`; // Show 1 decimal place
        } else {
          averageETA = `${averageEtaHours.toFixed(1)} hours`;
        }

        // Update dashboard stats state
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
                        <td className="py-3 px-4">{ticket.issueCategory}</td>
                        <td className="py-3 px-4">{ticket.engineerName}</td>
                        <td className="py-3 px-4">
                          {new Date(ticket.date).toLocaleDateString()} {ticket.time}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={ticket.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile/Tablet Card View */}
              <div className="lg:hidden space-y-4">
                {openTickets.map((ticket) => (
                  <div
                    key={ticket.ticketNo || ticket._id}
                    className="bg-white border rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">{ticket.name}</h3>
                        <p className="text-sm text-gray-500">
                          Ticket No: {ticket.ticketNo}
                        </p>
                      </div>
                      <StatusBadge status={ticket.status} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Company:</span>
                        <span>{ticket.companyName}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Category:</span>
                        <span>{ticket.issueCategory}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Assigned To:</span>
                        <span>{ticket.engineerName}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Date & Time:</span>
                        <span>{new Date(ticket.date).toLocaleDateString()} {ticket.time}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Description:</span>
                        <p className="mt-1">{ticket.issueDescription}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EngineerDashboard;
