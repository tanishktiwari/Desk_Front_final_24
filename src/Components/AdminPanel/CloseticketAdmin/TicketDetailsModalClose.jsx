import React, { useEffect, useState } from "react";
import axios from "axios";

const TicketDetailsModalClose = ({ ticketDetails, onClose }) => {
  const {
    ticketId,
    name,
    contactNumber,
    email,
    issueCategory,
    issueDescription,
    resolution,
    preventiveAction,
    warrantyCategory,
    status,
    date,
    time,
    engineerName,
  } = ticketDetails;

  const [copiedTicketId, setCopiedTicketId] = useState(false); // State to handle copy state
  const [resolutionState, setResolution] = useState(resolution);
  const [preventiveActionState, setPreventiveAction] = useState(preventiveAction);
  const [warrantyCategoryState, setWarrantyCategory] = useState(warrantyCategory);
  const [ticketStatus, setTicketStatus] = useState(status);

  // Effect to update copiedTicketId if ticketId changes
  useEffect(() => {
    setCopiedTicketId(false); // Reset copy state on ticketId change
  }, [ticketId]);

  // Custom clipboard function
  const copyToClipboard = (text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text; // Set the value to the text you want to copy
    document.body.appendChild(textArea); // Append the textarea to the DOM

    textArea.select(); // Select the text inside the textarea
    textArea.setSelectionRange(0, 99999); // For mobile devices

    try {
      document.execCommand('copy'); // Execute the copy command
      setCopiedTicketId(true); // Set copied state to true after copying

      // Set a timeout to remove the "Copied!" message after 10 seconds
      setTimeout(() => {
        setCopiedTicketId(false);
      }, 10000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }

    document.body.removeChild(textArea); // Remove the textarea after copying
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50">
      <div className="custom-div bg-white shadow-lg p-8 rounded-lg w-[90vw] max-w-7xl h-[75vh] max-h-[90vh] relative overflow-hidden mt-20 flex flex-col">
        {/* Logo centered above the title */}
        <div className="flex justify-center mt-0 -mb-6 pt-0 -top-8 relative">
          <img src="/4.png" alt="Logo" className="h-20" />
        </div>

        {/* Close Button (x) positioned on the top right */}
        <button
          type="button"
          className="text-gray-600 bg-none h-12 w-12 text-4xl hover:text-gray-900 absolute top-0 right-0 mt-0 mr-4 font-poppins"
          onClick={onClose}
        >
          &times;
        </button>

        {/* Modal Title */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-center w-full font-poppins">Ticket Details</h2>
        </div>

        {/* Ticket ID */}
        <div className="ticket flex items-center justify-center mb-4">
          <span style={{ marginRight: '8px' }} className="font-poppins">Your Deskassure ID is</span>
          <strong className="font-poppins">{ticketId}</strong>

          {/* Image before copying */}
          {!copiedTicketId ? (
            <img
              src="/copy.png" // Path to the "copy" icon (before copy)
              alt="Copy Icon"
              className="h-4 w-4 ml-3 -mt-1 cursor-pointer"
              onClick={() => copyToClipboard(ticketId)} // Trigger copy on click
            />
          ) : (
            <img
              src="/copy_green.png" // Path to the "green copy" icon (after copy)
              alt="Copied Icon"
              className="h-6 w-6 ml-3 cursor-pointer"
            />
          )}

          {/* Copied Message */}
          {copiedTicketId && (
            <span className="ml-2 text-green-500 text-sm font-poppins">Copied!</span>
          )}
        </div>

        {/* Flex container for User Input and Admin Input side by side */}
        <div className="flex flex-grow mb-4">
          {/* Left Section: User Input */}
          <div className="w-full sm:w-1/2 p-2 border-r border-gray-300 overflow-y-auto max-h-[80vh] pr-10">
            <h3 className="text-md font-semibold mb-1 font-poppins">User Input</h3>

            {/* User Information Fields */}
            <div className="mb-2">
              <label className="block text-gray-700 font-poppins">Name:</label>
              <input
                type="text"
                value={name || ""}
                readOnly
                className="block w-full bg-gray-200 border border-gray-300 text-gray-700 py-1 px-2 rounded font-poppins read-only: cursor-not-allowed"
              />
            </div>

            <div className="mb-2">
              <label className="block text-gray-700 font-poppins">Contact Number:</label>
              <input
                type="text"
                value={contactNumber || ""}
                readOnly
                className="block w-full bg-gray-200 border border-gray-300 text-gray-700 py-1 px-2 rounded font-poppins read-only: cursor-not-allowed"
              />
            </div>

            <div className="mb-2">
              <label className="block text-gray-700 font-poppins">Email ID:</label>
              <input
                type="email"
                value={email || ""}
                readOnly
                className="block w-full bg-gray-200 border border-gray-300 text-gray-700 py-1 px-2 rounded font-poppins read-only: cursor-not-allowed"
              />
            </div>

            <div className="mb-2">
              <label className="block text-gray-700 font-poppins">Issue Category:</label>
              <input
                type="text"
                value={issueCategory || "N/A"}
                readOnly
                className="block w-full bg-gray-200 border border-gray-300 text-gray-700 py-1 px-2 rounded font-poppins read-only: cursor-not-allowed"
              />
            </div>

            <div className="mb-2">
              <label className="block text-gray-700 font-poppins">Issue Description:</label>
              <textarea
                value={issueDescription || ""}
                readOnly
                className="block w-full bg-gray-200 border border-gray-300 text-gray-700 py-1 px-2 rounded font-poppins read-only: cursor-not-allowed"
              />
            </div>
          </div>

          {/* Right Section: Admin Input */}
          <div className="w-full sm:w-1/2 p-2 overflow-y-auto max-h-[80vh] pl-10">
            <h3 className="text-md font-semibold mb-1 font-poppins">Admin Input</h3>

            {/* Admin Fields */}
            <div className="mb-2">
              <label className="block text-gray-700 font-poppins">Resolution:</label>
              <textarea
                value={resolutionState}
                onChange={(e) => setResolution(e.target.value)}
                className="block w-full bg-gray-200 border border-gray-300 text-gray-700 py-1 px-2 rounded font-poppins read-only: cursor-not-allowed"
                placeholder="Enter resolution details"
              />
            </div>

            <div className="mb-2">
              <label className="block text-gray-700 font-poppins">Preventive Action:</label>
              <input
                value={preventiveActionState}
                onChange={(e) => setPreventiveAction(e.target.value)}
                className="block w-full bg-gray-200 border border-gray-300 text-gray-700 py-1 px-2 rounded font-poppins read-only: cursor-not-allowed"
                placeholder="Enter preventive action details"
              />
            </div>

            {/* Warranty Category */}
            <div className="mb-2">
              <label className="block text-gray-700 font-poppins">Warranty Category:</label>
              <select
                value={warrantyCategoryState}
                onChange={(e) => setWarrantyCategory(e.target.value)}
                className="block w-full bg-gray-200 border border-gray-300 text-gray-700 py-1 px-2 rounded font-poppins read-only: cursor-not-allowed"
              >
                <option value="">Please select</option>
                <option>Comprehensive AMC</option>
                <option>Non Comprehensive AMC</option>
                <option>In-Warranty</option>
                <option>Out-of-Warranty</option>
              </select>
            </div>

            {/* Ticket Status */}
            <div className="mb-3">
              <label className="block text-gray-700 font-poppins">Ticket Status:</label>
              <select
                value={ticketStatus}
                onChange={(e) => setTicketStatus(e.target.value)}
                className="block w-full bg-gray-200 border border-gray-300 text-gray-700 py-1 px-2 rounded font-poppins read-only: cursor-not-allowed"
              >
                <option value="">Select Status</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            {/* Engineer Name */}
            <div className="mb-2">
              <label className="block text-gray-700 font-poppins">Engineer Name:</label>
              <input
                type="text"
                value={engineerName || "N/A"}
                readOnly
                className="block w-full bg-gray-200 border border-gray-300 text-gray-700 py-1 px-2 rounded font-poppins read-only: cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailsModalClose;
