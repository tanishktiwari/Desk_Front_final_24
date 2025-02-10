import React, { useEffect, useState } from "react";
import axios from "axios";

const TicketDetailsModal = ({ isOpen, onClose, ticket }) => {
const [engineers, setEngineers] = useState([]);
  const [resolution, setResolution] = useState("");
  const [preventiveAction, setPreventiveAction] = useState("");
  const [warrantyCategory, setWarrantyCategory] = useState("");
  const [ticketStatus, setTicketStatus] = useState("");
  const [engineerId, setEngineerId] = useState("");
  const [ticketId, setTicketId] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [operatorName, setOperatorName] = useState("");
  const [operatorMobile, setOperatorMobile] = useState("");
  const [managerEmails, setManagerEmails] = useState([]);
  const [copiedTicketId, setCopiedTicketId] = useState(false);
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
  const [showOptionPopup, setShowOptionPopup] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [ticketDetails, setTicketDetails] = useState(null);

  // Handle close button validation
  const handleClose = () => {
    if(engineerId === '') {
      alert("Please select an engineer before closing.");
      return;
    }
    onClose();
  };

  // Handler for checkbox change
  const handleCheckboxChange = (e) => {
    setIsCheckboxChecked(e.target.checked);
    if (e.target.checked) {
      setShowOptionPopup(true);
    }
  };

  // Handler for option selection
  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setShowOptionPopup(false);
  };

  // Handler for custom input submission
  const handleSubmitInput = () => {
    if (userInput) {
      setSelectedOption(parseInt(userInput, 10));
      setShowOptionPopup(false);
    }
  };

  // Copy to clipboard functionality
  const copyToClipboard = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setCopiedTicketId(true);
          setTimeout(() => {
            setCopiedTicketId(false);
          }, 2000);
        })
        .catch((err) => {
          console.error("Failed to copy text using Clipboard API", err);
        });
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      textArea.setSelectionRange(0, 99999);

      try {
        const successful = document.execCommand("copy");
        if (successful) {
          setCopiedTicketId(true);
          setTimeout(() => {
            setCopiedTicketId(false);
          }, 2000);
        }
      } catch (err) {
        console.error("Error copying text: ", err);
      } finally {
        document.body.removeChild(textArea);
      }
    }
  };

  // Effect for updating current date/time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Effect for fetching engineers
  useEffect(() => {
    const fetchEngineers = async () => {
      if (isOpen) {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/engineers`
          );
          setEngineers(response.data);
        } catch (error) {
          console.error("Error fetching engineers:", error.message);
        }
      }
    };

    fetchEngineers();
  }, [isOpen]);

  // Effect for handling ticket details
  useEffect(() => {
    const fetchOperatorDetails = async (contactNumber) => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/operators/mobile/${contactNumber}`
        );

        if (response.data && response.data.managers && response.data.managers.length > 0) {
          const emails = response.data.managers.map((manager) => manager.email);
          setManagerEmails(emails);
        } else {
          setManagerEmails(["No managers available"]);
        }
      } catch (error) {
        console.error("Error fetching operator details:", error.message);
      }
    };

    const fetchTicketDetails = async (id) => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/ticket-details/${id}`
        );
        const details = response.data;
        
        // Update the state with API response data
        setTicketDetails(details);
        setTicketId(details.ticketId || "");
        setResolution(details.resolution || "");
        setPreventiveAction(details.preventiveAction || "");
        setWarrantyCategory(details.warrantyCategory || "");
        setTicketStatus(details.status || "");
        
        // If there's an engineer assigned, find their ID from the engineers list
        if (details.engineerName && engineers.length > 0) {
          const engineer = engineers.find(e => e.name === details.engineerName);
          if (engineer) {
            setEngineerId(engineer._id);
          }
        }

        if (details.contactNumber) {
          fetchOperatorDetails(details.contactNumber);
        }
      } catch (error) {
        console.error("Error fetching ticket details:", error.message);
      }
    };

    if (ticket) {
      fetchTicketDetails(ticket.ticketId);
    } else {
      const storedTicketId = localStorage.getItem("selectedTicketId");
      if (storedTicketId) {
        fetchTicketDetails(storedTicketId);
      }
    }
  }, [ticket, isOpen, engineers]);

  // Handle submit functionality
  const handleSubmit = async () => {
    try {
      console.log("Submitting report...");

      const selectedEngineer = engineers.find(
        (engineer) => engineer._id === engineerId
      );
      
      const idToUses = ticket ? ticket.ticketId : ticketId;
      const contactNumber = ticketDetails?.contactNumber || "";

      if (!selectedEngineer && ticketStatus !== "In Progress") {
        alert("Please select a valid engineer.");
        return;
      }

      const inProgressMessage = `Your ticket with ${idToUses} is now in-progress and engineer ${selectedEngineer.name} has been assigned.`;
      
      // Send notification to operator's mobile
      if (contactNumber) {
        await axios.put(`${import.meta.env.VITE_API_URL}/notification/${contactNumber}`, {
          message: inProgressMessage
        });
      }

      const createdDate = ticketDetails?.createdDate
        ? new Date(ticketDetails.createdDate).toISOString().split("T")[0]
        : currentDateTime.toISOString().split("T")[0];
      const createdTime = ticketDetails?.createdTime
        ? new Date(`1970-01-01T${ticketDetails.createdTime}`)
            .toISOString()
            .split("T")[1]
            .slice(0, 5)
        : currentDateTime.toISOString().split("T")[1].slice(0, 5);

      const reportData = {
        resolution,
        preventiveAction,
        warrantyCategory,
        engineerName: selectedEngineer ? selectedEngineer.name : "Engineer",
        engineerId,
        closeDate: currentDateTime.toISOString().split("T")[0],
        closeTime: currentDateTime.toISOString().split("T")[1].slice(0, 5),
        createdDate,
        createdTime,
      };

      const idToUse = ticket ? ticket.ticketId : ticketId;

      let operatorEmail = ticketDetails?.email;
      let managerEmails = [];

      if (ticketDetails?.contactNumber) {
        const operatorResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/operators/mobile/${ticketDetails.contactNumber}`
        );

        operatorEmail = operatorResponse.data.email;
        managerEmails = operatorResponse.data.managers?.map((manager) => manager.email) || [];
      }

      const allEmails = [operatorEmail, ...managerEmails];

      if (ticketStatus === "Complete") {
        const closedMessage = `Your ticket with ${idToUses} has been marked as closed.`;
        
        if (contactNumber) {
          await axios.put(`${import.meta.env.VITE_API_URL}/notification/${contactNumber}`, {
            message: closedMessage
          });
        }
       
        const updateResponse = await axios.put(
          `${import.meta.env.VITE_API_URL}/tickets/close/${idToUse}`,
          {
            closeDate: reportData.closeDate,
            closeTime: reportData.closeTime,
            createdDate: reportData.createdDate,
            createdTime: reportData.createdTime,
            resolution: reportData.resolution,
            preventiveAction: reportData.preventiveAction,
            warrantyCategory: reportData.warrantyCategory,
            engineerName: reportData.engineerName,
          }
        );

        setTicketDetails(updateResponse.data.ticket);

        const etaData = {
          date: ticketDetails?.date
            ? new Date(ticketDetails.date).toLocaleDateString("en-CA")
            : "",
          time: ticketDetails?.time ? ticketDetails.time : "",
        };

        const etaResponse = await axios.post(
          `${import.meta.env.VITE_API_URL}/tickets/calculate-eta/${idToUse}`,
          etaData
        );

        const calculatedEta = etaResponse.data.eta;
        let etaFormatted;
        if (calculatedEta && typeof calculatedEta === "object") {
          const days = calculatedEta.totalDays || 0;
          etaFormatted = `${days}`;
        } else {
          etaFormatted = "Invalid ETA";
        }

        // Send WhatsApp message
        const messageData = {
          to: `+91${ticketDetails?.contactNumber}`,
          sal: "Mr.",
          name: ticketDetails?.name,
          ticketId: idToUse,
          engineerName: selectedEngineer ? selectedEngineer.name : "Engineer",
          eta: etaFormatted,
        };

        await axios.post(
          `${import.meta.env.VITE_API_URL}/send-whatsapp-closed`,
          messageData
        );

        // Send email
        const emailData = {
          recipientEmails: allEmails,
          ticketId: idToUse,
          issueCategory: ticketDetails?.issueCategory || "General Issue",
          issueDescription: ticketDetails?.issueDescription || "No description provided.",
          firstName: ticketDetails?.name || "Customer",
        };

        await axios.post(
          `${import.meta.env.VITE_API_URL}/send-closed-tickets-mail`,
          emailData
        );

        // Send feedback email
        const feedbackData = {
          recipientEmails: allEmails,
          ticketId: idToUse,
          firstName: ticketDetails?.name || "Customer",
        };

        await axios.post(
          `${import.meta.env.VITE_API_URL}/send-feedback-mail`,
          feedbackData
        );

        setShowSuccessPopup(true);
      } else if (ticketStatus === "In Progress") {
        if (!selectedEngineer) {
          alert("Engineer not found or selected incorrectly.");
          return;
        }

        const inProgressResponse = await axios.put(
          `${import.meta.env.VITE_API_URL}/tickets/in-progress/${idToUse}`,
          {
            engineerName: selectedEngineer.name,
          }
        );

        setTicketDetails(inProgressResponse.data.ticket);

        const inProgressMessageData = {
          to: `+91${selectedEngineer.mobile}`,
          engineerName: selectedEngineer.name,
          ticketId: idToUse,
          companyName: ticketDetails?.companyName || "YourCompany",
          operatorName: ticketDetails?.name || "OperatorName",
          operatorMobile: ticketDetails?.contactNumber || "OperatorMobile",
        };

        await axios.post(
          `${import.meta.env.VITE_API_URL}/send-whatsapp-assign-engineer`,
          inProgressMessageData
        );

        const emailDataInProgress = {
          recipientEmails: allEmails,
          ticketId: idToUse,
          issueCategory: ticketDetails?.issueCategory || "General Issue",
          issueDescription: ticketDetails?.issueDescription || "No description provided.",
          firstName: ticketDetails?.name || "Customer",
        };

        await axios.post(
          `${import.meta.env.VITE_API_URL}/send-in-progress-tickets-mail`,
          emailDataInProgress
        );

        const inProgressMessage = {
          to: `+91${ticketDetails?.contactNumber}`,
          sal: "Mr.",
          name: ticketDetails?.name,
          ticketId: idToUse,
          engineerName: selectedEngineer ? selectedEngineer.name : "Engineer",
          engineerMobile: selectedEngineer ? selectedEngineer.mobile : "N/A",
        };

        await axios.post(
          `${import.meta.env.VITE_API_URL}/send-whatsapp-inprogress`,
          inProgressMessage
        );
      } else {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/tickets/update/${idToUse}`,
          reportData
        );
      }

      onClose();
    } catch (error) {
      console.error("Error submitting report:", error.message);
      if (error.response) {
        console.error("Response data:", error.response.data);
        alert(
          `Error: ${
            error.response.data.message ||
            "An error occurred. Please try again."
          }`
        );
      }
    }
  };

  const handleClosePopup = () => {
    setShowSuccessPopup(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
  <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50 p-4">
    <div className="bg-white shadow-lg rounded-lg w-full max-w-7xl h-[90vh] md:h-[80vh] relative overflow-hidden flex flex-col">
      {/* Logo and Header Section */}
      <div className="flex justify-center -mb-6 pt-2 relative">
        <img src="/4.png" alt="Logo" className="h-16 md:h-20" />
      </div>

      {/* Close Button */}
      <button
        type="button"
        className="absolute top-2 right-2 text-gray-600 text-4xl hover:text-gray-900 font-poppins"
        onClick={handleClose}
      >
        &times;
      </button>

      {/* Title Section */}
      <div className="flex items-center justify-between px-4">
        <div className="text-center w-full">
          <h2 className="text-xl font-semibold font-poppins">Ticket Details</h2>
        </div>
      </div>

      {/* Ticket ID Section */}
      <div className="flex items-center justify-center gap-2 p-2 mt-2">
        <span className="font-poppins">Your Deskassure ID is</span>
        <strong className="font-poppins">{ticketId}</strong>
        <img
          src={copiedTicketId ? "/copy_green.png" : "/copy.png"}
          alt="Copy Icon"
          className={`h-4 w-4 cursor-pointer ${copiedTicketId ? 'h-6 w-6' : ''}`}
          onClick={() => copyToClipboard(ticketId)}
        />
        {copiedTicketId && (
          <span className="text-green-500 text-sm font-poppins">Copied!</span>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-grow overflow-auto px-4 pb-4">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Section - User Input */}
          <div className="w-full md:w-1/2 space-y-4">
            <h3 className="text-md font-semibold font-poppins">User Input</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-gray-700 font-poppins">Name:</label>
                <input
                  type="text"
                  value={ticketDetails?.name || ""}
                  readOnly
                  className="w-full bg-gray-200 border border-gray-300 text-gray-700 py-1 px-2 rounded font-poppins cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-poppins">Contact Number:</label>
                <input
                  type="text"
                  value={ticketDetails?.contactNumber || ""}
                  readOnly
                  className="w-full bg-gray-200 border border-gray-300 text-gray-700 py-1 px-2 rounded font-poppins cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-poppins">Email ID:</label>
                <input
                  type="email"
                  value={ticketDetails?.email || ""}
                  readOnly
                  className="w-full bg-gray-200 border border-gray-300 text-gray-700 py-1 px-2 rounded font-poppins cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-poppins">Issue Category:</label>
                <input
                  type="text"
                  value={ticketDetails?.issueCategory || "N/A"}
                  readOnly
                  className="w-full bg-gray-200 border border-gray-300 text-gray-700 py-1 px-2 rounded font-poppins cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-poppins">Issue Description:</label>
                <textarea
                  value={ticketDetails?.issueDescription || ""}
                  readOnly
                  className="w-full bg-gray-200 border border-gray-300 text-gray-700 py-1 px-2 rounded font-poppins cursor-not-allowed min-h-[100px]"
                />
              </div>
            </div>
          </div>

          {/* Right Section - Admin Input */}
          <div className="w-full md:w-1/2 space-y-4">
            <h3 className="text-md font-semibold font-poppins">Admin Input</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-gray-700 font-poppins">Resolution:</label>
                <textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-gray-700 py-1 px-2 rounded font-poppins min-h-[100px]"
                  placeholder="Enter resolution details"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-poppins">Preventive Action:</label>
                <input
                  value={preventiveAction}
                  onChange={(e) => setPreventiveAction(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-gray-700 py-1 px-2 rounded font-poppins"
                  placeholder="Enter preventive action details"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-poppins">Warranty Category:</label>
                <select
                  value={warrantyCategory}
                  onChange={(e) => setWarrantyCategory(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-gray-700 py-1 px-2 rounded font-poppins"
                >
                  <option value="">Please select</option>
                  <option>Comprehensive AMC</option>
                  <option>Non Comprehensive AMC</option>
                  <option>In-Warranty</option>
                  <option>Out-of-Warranty</option>
                </select>
              </div>

              <div>
          <label className="block text-gray-700 font-poppins">Engineer:</label>
          <select
            value={engineerId}
            onChange={(e) => setEngineerId(e.target.value)}
            className="w-full bg-white border border-gray-300 text-gray-700 py-1 px-2 rounded font-poppins"
          >
            <option value="">Select Engineer</option>
            {engineers.map((engineer) => (
              <option 
                key={engineer._id} 
                value={engineer._id}
                selected={ticketDetails?.engineerName === engineer.name}
              >
                {engineer.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-poppins">Ticket Status:</label>
          <select
            value={ticketStatus}
            onChange={(e) => setTicketStatus(e.target.value)}
            className="w-full bg-white border border-gray-300 text-gray-700 py-1 px-2 rounded font-poppins"
          >
            <option value="">Select Status</option>
            <option value="Open">Open</option>
            <option value="In-Progress">In-Progress</option>
            <option value="Complete">Complete</option>
          </select>
        </div>

              <div className="text-right">
                <p className="text-gray-700 font-poppins text-sm">
                  Current Date and Time: {currentDateTime ? currentDateTime.toLocaleString() : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="p-4 flex justify-center">
        <button
          onClick={handleSubmit}
          className="bg-buttoncolor text-white py-2 px-8 rounded transition duration-200 font-poppins hover:bg-opacity-90"
        >
          Submit
        </button>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-60">
          <div className="bg-white rounded-lg shadow-lg p-4 w-80 text-center">
            <h3 className="text-lg font-bold mb-2 font-poppins">Success</h3>
            <p className="font-poppins">Ticket has been closed successfully!</p>
            <button
              onClick={handleClosePopup}
              className="bg-blue-500 text-white py-1 px-4 rounded hover:bg-blue-600 transition duration-200 mt-2 font-poppins"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Option Selection Popup */}
      {showOptionPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-60 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4 font-poppins text-center">
              Select a Time Range
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-poppins">Select Time Range:</label>
                <select
                  value={selectedOptions}
                  onChange={(e) => setSelectedOptions(e.target.value)}
                  className="w-full bg-gray-200 border border-gray-300 text-gray-700 py-2 px-3 rounded font-poppins mt-1"
                >
                  <option value="" disabled>Select a time range</option>
                  {[...Array(10).keys()].map((i) => (
                    <option key={i} value={`${i}`}>{i} days</option>
                  ))}
                  <option value="custom">Custom Input</option>
                </select>
              </div>

              {selectedOptions === "custom" && (
                <div>
                  <label className="block text-gray-700 font-poppins">Enter Custom Number:</label>
                  <input
                    type="number"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="w-full bg-gray-200 border border-gray-300 text-gray-700 py-2 px-3 rounded font-poppins mt-1"
                    placeholder="Enter a number"
                  />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleSubmitInput}
                  className={`w-full bg-buttoncolor text-white py-2 px-4 rounded font-poppins transition duration-200 ${
                    !selectedOptions || (selectedOptions === "custom" && !userInput)
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-opacity-90"
                  }`}
                  disabled={!selectedOptions || (selectedOptions === "custom" && !userInput)}
                >
                  Submit
                </button>
                <button
                  onClick={() => {
                    setShowOptionPopup(false);
                    setSelectedOptions("");
                    setUserInput("");
                    setIsCheckboxChecked(false);
                  }}
                  className="w-full bg-gray-300 text-gray-600 hover:text-gray-800 py-2 px-4 rounded font-poppins"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);
};

export default TicketDetailsModal;