import React, { useState } from 'react';
import { Outlet } from 'react-router-dom'; // Import Outlet for nested routing
import Navbar from './Navbar/Navbar';
import Sidebar from './Sidebar/Sidebar';
import Footer from '../../Footer/Footer'; // Adjust path as necessary

const Dashboard = () => {
  const [isFooterHidden, setIsFooterHidden] = useState(true);
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6"> {/* Main content area */}
          <Outlet /> {/* Renders the matched child route */}
        </main>
      </div>
      <Footer className={isFooterHidden ? 'hidden' : ''} />
    </div>
  );
};

export default Dashboard;
