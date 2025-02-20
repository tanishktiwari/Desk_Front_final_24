// components/layout/Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket, CheckCircle, PlusCircle, LogOut, LayoutDashboard } from 'lucide-react';

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen, handleLogout }) => {
  return (
    <>
      {/* Sidebar Overlay */}
      <div 
        className={`lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static w-64 bg-white shadow-md h-[calc(100vh-4rem)] transform transition-transform duration-300 z-50 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <nav className="p-4 flex flex-col h-full">
          <ul className="space-y-2">
            <li>
              <Link
                to="/engineer-dashboard"
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
                onClick={() => setIsSidebarOpen(false)}
              >
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                to="tickets/open"
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
                onClick={() => setIsSidebarOpen(false)}
              >
                <Ticket size={20} />
                <span>Open Tickets</span>
              </Link>
            </li>
            <li>
              <Link
                to="tickets/closed"
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
                onClick={() => setIsSidebarOpen(false)}
              >
                <CheckCircle size={20} />
                <span>Closed Tickets</span>
              </Link>
            </li>
            <li>
              <Link
                to="tickets/create"
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
                onClick={() => setIsSidebarOpen(false)}
              >
                <PlusCircle size={20} />
                <span>Create Ticket</span>
              </Link>
            </li>
          </ul>

          <div className="lg:hidden mt-auto pt-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 w-full p-2 rounded-lg hover:bg-gray-100 text-red-600"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;