import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";
import { Link } from "react-router-dom";

// SVG icons as components
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState("Home");
  const [isPpmActive, setIsPpmActive] = useState(false);
  const [showMaintenancePopup, setShowMaintenancePopup] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef(null);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  // Check screen size and set mobile state
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Handle clicks outside sidebar on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleMaintenanceClick = () => {
    setShowMaintenancePopup(true);
  };

  const handleOptionSelect = (option) => {
    setShowMaintenancePopup(false);
    if (option === "PPM") {
      navigate("/dashboard/ppm-status");
    } else if (option === "Health Check") {
      navigate("/dashboard/monthly-healthcheck");
    }
    if (isMobile) setIsOpen(false);
  };

  const handleNavigation = (item) => {
    setActiveItem(item);
    if (item === "PPM") {
      setIsPpmActive((prev) => !prev);
    } else {
      setIsPpmActive(false);
      switch (item) {
        case "Home":
          navigate("/dashboard/home");
          break;
        case "Create Ticket":
          navigate("/dashboard/create-ticket");
          break;
        case "Open":
          navigate("/dashboard/open");
          break;
        case "Close":
          navigate("/dashboard/close");
          break;
        case "Report":
          navigate("/dashboard/report");
          break;
        case "PPM Status":
          navigate("/dashboard/ppm-status");
          break;
        case "Health Check":
          navigate("/dashboard/monthly-healthcheck");
          break;
        case "Inventory Info":
          navigate("/dashboard/spare-inventory");
          break;
        default:
          break;
      }
    }
    if (isMobile) setIsOpen(false);
  };

  // Menu items data for cleaner rendering
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '/dashboard.png', action: 'Home' },
    { id: 'create-ticket', label: 'Create Ticket', icon: '/create_ticket.png', action: 'Create Ticket' },
    { id: 'open', label: 'Open', icon: '/open.png', action: 'Open' },
    { id: 'close', label: 'Close', icon: '/closed.png', action: 'Close' },
    { id: 'report', label: 'Report', icon: '/reports.png', action: 'Report' },
    { id: 'maintenance', label: 'Maintenance', icon: '/maintenance.png', action: 'maintenance' }
  ];

  return (
    <>
      {/* Mobile Menu Button - Always visible on mobile */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-lg hover:bg-gray-100 focus:outline-none"
        >
          {isOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      )}

      {/* Overlay for mobile */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-[#F1F2F7] z-40 
                   transition-all duration-300 ease-in-out
                   ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                   ${isMobile ? 'w-64 shadow-xl' : 'w-60'}
                   flex flex-col`}
      >
        {/* Logo Section */}
        <div className="p-4 flex justify-center items-center h-16 font-poppins">
          <Link to="/dashboard/home">
            <img
              src="../../../../../public/logo_black_full.png"
              alt="Logo"
              className="h-10 w-auto"
            />
          </Link>
        </div>

        <div className="w-full border-t border-gray-200 my-4" />

        {/* Menu Items */}
        <nav className="flex-1 px-4 font-poppins">
          <ul className="space-y-4 pt-[20%]">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => item.id === 'maintenance' ? handleMaintenanceClick() : handleNavigation(item.action)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg
                             transition-colors duration-150 ease-in-out
                             ${activeItem === item.action ? 'bg-gray-200' : 'hover:bg-gray-100'}
                             text-gray-700 font-medium`}
                >
                  <img
                    src={item.icon}
                    alt={`${item.label} icon`}
                    className="w-6 h-6"
                  />
                  <span className="ml-4">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Version Info */}
        <div className="mt-auto border-t border-gray-200 p-4">
          <div className="text-center text-sm text-gray-600">
            <p className="font-medium">Version 1.0.0</p>
            <p className="mt-1">© 2024 DeskAssure</p>
          </div>
        </div>
      </div>

      {/* Maintenance Popup */}
      {showMaintenancePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            ref={popupRef}
            className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-auto overflow-hidden"
          >
            {/* Popup Header */}
            <div className="bg-gray-800 p-4 flex items-center justify-between">
              <div className="flex items-center">
                <img src="/logo.png" alt="Logo" className="h-8 w-8" />
                <h3 className="ml-3 text-white font-medium">Maintenance Options</h3>
              </div>
              <button
                onClick={() => setShowMaintenancePopup(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Popup Content */}
            <div className="p-4 space-y-3">
              <button
                onClick={() => handleOptionSelect("PPM")}
                className="w-full py-3 px-4 bg-white border border-gray-300 rounded-lg
                         text-gray-700 font-medium hover:bg-gray-50 transition-colors
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                PPM
              </button>
              <button
                onClick={() => handleOptionSelect("Health Check")}
                className="w-full py-3 px-4 bg-white border border-gray-300 rounded-lg
                         text-gray-700 font-medium hover:bg-gray-50 transition-colors
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Health Check
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;