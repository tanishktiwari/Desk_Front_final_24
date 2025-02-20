// components/layout/Navbar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';

const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('loggedInEngineerMobileNumber');
    navigate('/engineer-login');
  };

  return (
    <nav className="bg-white shadow-md px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between lg:justify-start lg:space-x-8">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className="flex-1 flex justify-center lg:justify-start">
          <img 
            src="/logo_black_full.png" 
            alt="Logo" 
            className="h-10 w-auto lg:h-8"
          />
        </div>

        <div className="hidden lg:block">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200"
          >
            <span>Logout</span>
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;