import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../Open/PopUpForm.css";

const PopUpForm = ({ onClose, ticketNumber }) => {
  const [copied, setCopied] = useState(false);  // Track if the ticket number is copied
  const [ticketDetails, setTicketDetails] = useState({
    name: '',
    contactNumber: '',
    email: '',
    companyName: '',
    issueCategory: '',
    issueDescription: '',
    resolution: '',
    preventiveAction: '',
    warrantyCategory: '',
    status: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [copiedTicketNos, setCopiedTicketNos] = useState({}); // Track copied status for each ticket number

  const copyToClipboard = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedTicketNos((prev) => ({ ...prev, [text]: true }));  // Mark ticket as copied
        setTimeout(() => {
          setCopiedTicketNos((prev) => ({ ...prev, [text]: false }));  // Reset after 2 seconds
        }, 2000);
      }).catch((err) => {
        console.error("Failed to copy text using Clipboard API", err);
      });
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      textArea.setSelectionRange(0, 99999); // For mobile devices

      try {
        const successful = document.execCommand("copy");
        if (successful) {
          setCopiedTicketNos((prev) => ({ ...prev, [text]: true }));
          setTimeout(() => {
            setCopiedTicketNos((prev) => ({ ...prev, [text]: false }));
          }, 2000);
        } else {
          console.error("Failed to copy text using execCommand");
        }
      } catch (err) {
        console.error("Error copying text: ", err);
      } finally {
        document.body.removeChild(textArea); // Clean up
      }
    }
  };

  useEffect(() => {
    // Fetch ticket details using the provided ticketNumber
    const fetchTicketDetails = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/ticket-details/${ticketNumber}`);
        setTicketDetails(response.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to load ticket details');
        setLoading(false);
      }
    };

    if (ticketNumber) {
      fetchTicketDetails();
    }
  }, [ticketNumber]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50">
      <div className="custom-div bg-white shadow-lg p-8 rounded-lg w-[900px] h-[700px] relative mt-12">
        
        {/* Logo positioned on the left */}
        <div className="flex justify-center mt-0 -mb-6 pt-6 -top-8 relative">
      <img src="/4.png" alt="Logo" className="h-20" />
    </div>

        {/* Close Button (x) positioned on the right */}
        <button
          type="button"
          className="text-gray-600 bg-none h-12 w-12 hover:text-gray-900 absolute top-1 right-2 mt-0 mr-4 text-7xl"
          onClick={onClose}
        >
          &times;
        </button>

        {/* Modal Content */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl  text-center ml-[40%] font-poppins">Ticket Details</h2>
        </div>
          <div className="ticket flex items-center justify-center mb-12">
            <span style={{ marginRight: '8px' }} className="font-poppins ">Your Deskassure ID is</span>
            <strong className="font-poppins">{ticketNumber}</strong>

            {/* Image before copying */}
            {!copiedTicketNos[ticketNumber] ? (
              <img
                src="/copy.png" // Path to the "copy" icon (before copy)
                alt="Copy Icon"
                className="h-4 w-4 ml-3 -mt-1 cursor-pointer"
                onClick={() => copyToClipboard(ticketNumber)} // Trigger copy on click
              />
            ) : (
              // Image after copying
              <img
                src="/copy_green.png" // Path to the "green copy" icon (after copy)
                alt="Copied Icon"
                className="h-6 w-6 ml-3 cursor-pointer"
              />
            )}

            {/* Copied Message */}
            {copiedTicketNos[ticketNumber] && (
              <span className="ml-2 text-green-500 text-sm font-poppins">Copied!</span>
            )}
          </div>

        {/* Form Fields */}
        <form className="space-y-6">
          {/* Ticket Number Display with Copy to Clipboard Image */}

          {/* Name and Contact Number */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 font-poppins">Name</label>
              <input
                type="text"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-200 font-poppins"
                value={ticketDetails.name}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 font-poppins">Contact Number</label>
              <input
                type="text"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-200 font-poppins"
                value={ticketDetails.contactNumber}
                readOnly
              />
            </div>
          </div>

          {/* Email and Company Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 font-poppins">Email</label>
              <input
                type="email"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-200 font-poppins"
                value={ticketDetails.email}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 font-poppins">Company Name</label>
              <input
                type="text"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-200 font-poppins"
                value={ticketDetails.companyName}
                readOnly
              />
            </div>
          </div>

          {/* Issue Category as a Non-Editable Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 font-poppins">Issue Category</label>
            <select
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-200 font-poppins"
              value={ticketDetails.issueCategory}
              disabled
            >
              <option value={ticketDetails.issueCategory}>{ticketDetails.issueCategory}</option>
            </select>
          </div>

          {/* Issue Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 font-poppins">Description</label>
            <textarea
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-200 font-poppins"
              rows="4"
              value={ticketDetails.issueDescription}
              readOnly
            ></textarea>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PopUpForm;
