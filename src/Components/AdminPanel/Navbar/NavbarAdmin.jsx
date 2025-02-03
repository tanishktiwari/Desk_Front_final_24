import React from "react";
import { Menu } from "@headlessui/react";
import { useNavigate } from "react-router-dom";

const NavbarAdmin = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/admin-login");
  };

  return (
    <nav className="bg-white w-full fixed top-0 left-0 z-50 shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <div className="logo" />
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Notification Bell */}
            <button className="p-2 rounded-md bg-custom-gradient transition-colors">
              <img
                src="/bell.png"
                alt="Notification Bell"
                className="w-5 h-5 sm:w-6 sm:h-6"
              />
            </button>

            {/* Profile Menu */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                <span className="sr-only">Open user menu</span>
                <div className="h-8 w-8 sm:h-9 sm:w-9 bg-yellow-200 rounded-full flex justify-center items-center text-yellow-500 text-lg sm:text-2xl font-mono">
                  AD
                </div>
              </Menu.Button>

              <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleLogout}
                      className={`${
                        active ? "bg-gray-100" : ""
                      } block w-full px-4 py-2 text-left text-sm text-gray-700`}
                    >
                      Sign out
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Menu>
          </div>
        </div>
      </div>
      
      {/* Horizontal line - now full width */}
      <div className="w-full border-b border-[#C8CBD9]" />
    </nav>
  );
};

export default NavbarAdmin;