// components/EngineerPanel/Dashboard/EngineerDashboard.jsx
import React from "react";
import { BarChart3, Ticket, CheckCircle, Clock } from "lucide-react";

const EngineerDashboard = () => {
  // Sample data - replace with actual data from your backend
  const dashboardStats = {
    monthlyOpenTickets: 45,
    totalOpenTickets: 120,
    totalClosedTickets: 350,
    averageETA: "4.5 hours",
  };

  const openTickets = [
    {
      id: "TK001",
      title: "Network Outage",
      priority: "High",
      status: "Open",
      createdAt: "2024-02-20",
      customer: "Tech Corp",
    },
    {
      id: "TK002",
      title: "Server Maintenance",
      priority: "Medium",
      status: "Open",
      createdAt: "2024-02-19",
      customer: "Data Systems",
    },
  ];

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

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Ticket No.</th>
                  <th className="text-left py-3 px-4">Title</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Created</th>
                  <th className="text-left py-3 px-4">Company</th>
                </tr>
              </thead>
              <tbody>
                {openTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{ticket.id}</td>
                    <td className="py-3 px-4">{ticket.title}</td>
                    <td className="py-3 px-4">{ticket.status}</td>
                    <td className="py-3 px-4">{ticket.createdAt}</td>
                    <td className="py-3 px-4">{ticket.customer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile/Tablet Card View */}
          <div className="lg:hidden space-y-4">
            {openTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white border rounded-lg p-4 shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{ticket.title}</h3>
                    <p className="text-sm text-gray-500">
                      Ticket No: {ticket.id}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Status:</span>
                    <span>{ticket.status}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Created:</span>
                    <span>{ticket.createdAt}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Customer:</span>
                    <span>{ticket.customer}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngineerDashboard;
