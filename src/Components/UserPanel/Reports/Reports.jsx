import React, { useEffect, useState } from 'react';
import { FaHammer } from 'react-icons/fa'; // Ensure to install react-icons

const Reports = () => {
  const [displayedText, setDisplayedText] = useState('');
  const fullText = "Work in Progress";

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(fullText.slice(0, index + 1)); // Use slice to get the correct substring
        index++;
      } else {
        clearInterval(interval);
      }
    }, 300); // Adjust timing as needed

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-5xl font-bold text-gray-800 relative">
        {displayedText}
        <span className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-300 opacity-30 blur-sm"></span>
      </h1>
      {displayedText === fullText && (
        <div className="mt-4 flex items-center text-4xl text-gray-800">
          <FaHammer className="animate-bounce" />
        </div>
      )}
    </div>
  );
};

export default Reports;