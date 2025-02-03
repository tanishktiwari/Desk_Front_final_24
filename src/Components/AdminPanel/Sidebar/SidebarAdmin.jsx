import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const SidebarAdmin = () => {
  const [activeItem, setActiveItem] = useState("Home"); // Default to "Home"
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(true); // Initially collapsed
  const [showMaintenancePopup, setShowMaintenancePopup] = useState(false);
  const [showTriggerPopup, setShowTriggerPopup] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State to control sidebar visibility
  const popupRef = useRef(null);

  // Check for mobile screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth < 768) {
        setIsCollapsed(true); // Keep collapsed on small screens
      } else {
        setIsCollapsed(false); // Always expanded on larger screens
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Default navigation to Home on component mount
  useEffect(() => {
    handleNavigation("Home");
  }, []);

  const handleMaintenanceClick = () => {
    setShowMaintenancePopup(true);
  };

  const handleTriggerClick = () => {
    setShowTriggerPopup(true);
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setShowMaintenancePopup(false);
    setShowTriggerPopup(false);

    const routes = {
      "PPM": "/dashboardadmin/ppm",
      "Health Check": "/dashboardadmin/healthcheck",
      "periodic-report": "/dashboardadmin/periodicreport",
      "Contact Matrix": "/dashboardadmin/contact-matrix",
      "promptmanager": "/dashboardadmin/promptmanager",
      "homeadmin": "/dashboardadmin/homeadmin"
    };
    
    if (routes[option]) {
      navigate(routes[option]);
    }
  };

  const handleNavigation = (item) => {
    setActiveItem(item);
    const routes = {
      "Home": "/dashboardadmin/homeadmin", // Default home route
      "Open": "/dashboardadmin/openticketadmin",
      "Close": "/dashboardadmin/closeticketadmin",
      "Report": "/dashboardadmin/reports-admin",
      "Operator": "/dashboardadmin/operator",
      "Company": "/dashboardadmin/company",
      "Engineer": "/dashboardadmin/engineer",
      "Issue category": "/dashboardadmin/issue-category"
    };

    if (routes[item]) {
      navigate(routes[item]);
    }
  };

  const iconSize = isMobile ? "1.5rem" : "1.82rem";
  const labelSize = "text-sm";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowMaintenancePopup(false);
        setShowTriggerPopup(false);
      }
    };
    

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderNavItems = () => {
    const items = [
      { name: "Home", icon: "/dashboard.png", alt: "Dashboard Icon" },
      { name: "Open", icon: "/open.png", alt: "Open Icon" },
      { name: "Close", icon: "/closed.png", alt: "Close Icon" },
      { name: "Company", icon: "/company.png", alt: "Company Icon" },
      { name: "Operator", icon: "/operator.png", alt: "Operator Icon" },
      { name: "Engineer", icon: "/engineer.png", alt: "Engineer Icon" },
      { name: "Issue category", icon: "/categories.png", alt: "Issue Category Icon" },
      { name: "Report", icon: "/reports.png", alt: "Report Icon" },
      { name: "Maintenance", icon: "/maintenance.png", alt: "Maintenance Icon", onClick: handleMaintenanceClick },
      { name: "Trigger", icon: "/thunder.png", alt: "Trigger Icon", onClick: handleTriggerClick }
    ];

    return items.map((item) => (
      <li
        key={item.name}
        className={`flex items-center cursor-pointer ${isMobile ? 'flex-col justify-center' : ''}`}
        onClick={() => {
          if (item.onClick) item.onClick();
          else handleNavigation(item.name);
          if (isMobile) setIsSidebarOpen(false); // Close sidebar on mobile after clicking an item
        }}
      >
        <img
          src={item.icon}
          alt={item.alt}
          style={{ 
            height: iconSize, 
            width: iconSize,
            margin: isMobile ? '0 auto' : undefined 
          }}
          className={item.name === "Engineer" || item.name === "Issue category" ? "relative right-1" : ""}
        />
        {(!isCollapsed || isMobile) && (
          <span className={`
            ${labelSize} 
            ${isMobile ? 'text-xs mt-1' : 'ml-5 mt-1'} 
            font-poppins 
            ${!isMobile && 'text-xl'}
          `}>
            {item.name}
          </span>
        )}
      </li>
    ));
  };

  // Mobile sidebar layout
  const sidebarClass = isMobile
    ? `fixed top-16 left-0 h-screen bg-[#F1F2F7] text-[#273236]  transform transition-transform duration-300 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } z-50`
    : `sidebar bg-[#F1F2F7] text-[#273236] fixed top-0 left-0 h-screen transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-60"
      } flex flex-col items-center`;  // Always expanded on larger screens

  return (
    <>
      {/* Toggle Button for Mobile */}
      {isMobile && (
        <button
          className="fixed top-4 left-4 z-50 p-2 bg-[#F1F2F7] rounded-lg shadow-md w-"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <img src="/menu.png" alt="Menu" className="h-6 w-6" />
        </button>
      )}

      {/* Sidebar */}
      <div className={sidebarClass}>
        {!isMobile && (
          <>
            <div className="logo-container mt-3 mb-0 ml-0">
              <Link to="/dashboard/home">
                <img
                  src={isCollapsed ? "/logo.png" : "../../../../../public/logo_black_full.png"}
                  alt="Logo"
                  className="logo mb-0"
                  style={{
                    height: "40px",
                    width: isCollapsed ? "40px" : "90%",
                  }}
                />
              </Link>
            </div>
            <div className="border-t border-gray-300 w-full my-4" />
          </>
        )}

        {/* Navigation Items */}
        <div className={` 
          ${isMobile 
            ? 'sidebar-items flex flex-col items-start pt-2 space-y-6 px-4' 
            : 'sidebar-items flex flex-col items-center pt-2 space-y-6'
          }
        `}>
          <ul className={` 
            ${isMobile 
              ? 'flex flex-col items-start space-y-6' 
              : `flex flex-col items-start ${isCollapsed ? 'space-y-5' : 'space-y-6'}`}
          `}>
            {renderNavItems()}
          </ul>
        </div>
      </div>

      {/* Overlay for Mobile Sidebar */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Popups */}
      {(showMaintenancePopup || showTriggerPopup) && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div
            className="bg-white rounded-2xl shadow-lg w-11/12 md:w-1/4 max-w-md shadow-slate-400"
            ref={popupRef}
          >
            <div className="bg-gray-800 text-white flex items-center justify-center p-2 rounded-t-2xl relative">
              <img src="/logo.png" alt="" className="h-8 w-auto" />
              <span className="ml-5 font-poppins text-xl">
                {showMaintenancePopup ? 'Maintenance' : 'Trigger'}
              </span>
            </div>

            <div className="p-4 justify-center">
              {showMaintenancePopup ? (
                <>
                  <button
                    className="w-full py-2 text-gray-700 font-semibold border border-gray-300 rounded-md hover:bg-gray-100 mb-4 shadow-sm"
                    onClick={() => handleOptionSelect("PPM")}
                  >
                    PPM
                  </button>
                  <button
                    className="w-full py-2 text-gray-700 font-semibold border border-gray-300 rounded-md hover:bg-gray-100 shadow-sm"
                    onClick={() => handleOptionSelect("Health Check")}
                  >
                    Health Check
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="w-full py-2 text-gray-700 font-semibold border border-gray-300 rounded-md hover:bg-gray-100 mb-4 shadow-sm"
                    onClick={() => handleOptionSelect("periodic-report")}
                  >
                    Periodic Reports
                  </button>
                  <button
                    className="w-full py-2 text-gray-700 font-semibold border border-gray-300 rounded-md hover:bg-gray-100 mb-4 shadow-sm"
                    onClick={() => handleOptionSelect("Contact Matrix")}
                  >
                    Contact Matrix
                  </button>
                  <button
                    className="w-full py-2 text-gray-700 font-semibold border border-gray-300 rounded-md hover:bg-gray-100 shadow-sm"
                    onClick={() => handleOptionSelect("promptmanager")}
                  >
                    Prompt Manager
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SidebarAdmin;
