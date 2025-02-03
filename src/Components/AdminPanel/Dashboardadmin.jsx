import React from 'react';
import SidebarAdmin from './Sidebar/SidebarAdmin';  // Ensure the correct path
import NavbarAdmin from './Navbar/NavbarAdmin';    // Ensure the correct path
import Footer from '../Footer/Footer';
import { Outlet } from 'react-router-dom'   // Ensure the correct path

const Dashboardadmin = () => {
  return (
    <div className="flex flex-col h-screen bg-white">
      <NavbarAdmin />
      <div className="flex flex-1 ">
        <SidebarAdmin />
        <main className="flex-1">
          {/* Render the child components here */}
         <Outlet />
        </main>
      </div>
      <Footer />
    </div> 
  );
};

export default Dashboardadmin;
