import React, { useEffect, useState } from "react";
import axios from "axios";

const TicketDetailsModal = ({ isOpen, onClose, ticket }) => {
  // Move all useState declarations to the top level
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
  const [userInput, setUserInput] = useState("");
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [ticketDetails, setTicketDetails] = useState(null);

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

        if (
          response.data &&
          response.data.managers &&
          response.data.managers.length > 0
        ) {
          const emails = response.data.managers.map((manager) => manager.email);
          setManagerEmails(emails);
        } else {
          setManagerEmails(["No managers available"]);
        }
      } catch (error) {
        console.error("Error fetching operator details:", error.message);
      }
    };

    if (ticket) {
      setTicketId(ticket.ticketId || "");
      setResolution(ticket.resolution || "");
      setPreventiveAction(ticket.preventiveAction || "");
      setWarrantyCategory(ticket.warrantyCategory || "");
      setTicketStatus(ticket.status || "");
      setTicketDetails(ticket);
      
      if (ticket.contactNumber) {
        fetchOperatorDetails(ticket.contactNumber);
      }
    } else {
      const storedTicketId = localStorage.getItem("selectedTicketId");
      if (storedTicketId) {
        const fetchTicketDetails = async () => {
          try {
            const response = await axios.get(
              `${import.meta.env.VITE_API_URL}/ticket-details/${storedTicketId}`
            );
            setTicketDetails(response.data);
            setTicketId(response.data.ticketId);
            setResolution(response.data.resolution || "");
            setPreventiveAction(response.data.preventiveAction || "");
            setWarrantyCategory(response.data.warrantyCategory || "");
            setTicketStatus(response.data.status || "");

            if (response.data.contactNumber) {
              fetchOperatorDetails(response.data.contactNumber);
            }
          } catch (error) {
            console.error("Error fetching ticket details:", error.message);
          }
        };

        fetchTicketDetails();
      }
    }
  }, [ticket, isOpen]);

  

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

      console.log("Report Data:", reportData);

      let operatorEmail = ticketDetails?.email;
      let managerEmails = [];

      if (ticketDetails?.contactNumber) {
        const operatorResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/operators/mobile/${
            ticketDetails.contactNumber
          }`
        );

        operatorEmail = operatorResponse.data.email;
        managerEmails =
          operatorResponse.data.managers?.map((manager) => manager.email) || [];
      }

      const allEmails = [operatorEmail, ...managerEmails];
      console.log("Operator Email:", operatorEmail);
      console.log("Manager Emails:", managerEmails);
      console.log("All Emails:", allEmails);

      if (ticketStatus === "Complete") {
        console.log(
          "Ticket status is 'Complete'. Updating and closing the ticket..."
        );
         const closedMessage = `Your ticket with ${idToUses} has been marked as closed.`;
        // Send notification to operator's mobile
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

        console.log("Ticket Updated Response:", updateResponse.data);
        setTicketDetails(updateResponse.data.ticket);

        // ETA Calculation Section
        const etaData = {
          // Ensure date is in "YYYY-MM-DD" format using toLocaleDateString
          date: ticketDetails?.date
            ? new Date(ticketDetails.date).toLocaleDateString("en-CA") // "en-CA" is the format for "YYYY-MM-DD"
            : "", // Default to empty string if not available

          // Use ticketDetails?.time or current time as fallback
          time: ticketDetails?.time ? ticketDetails.time : "", // Default to empty string if not available
        };

        // Log the formatted date and time
        console.log("Calculating ETA with data:", etaData);

        console.log("Calculating ETA with data:", etaData);

        const etaResponse = await axios.post(
          `${import.meta.env.VITE_API_URL}/tickets/calculate-eta/${idToUse}`,
          etaData
        );

        const calculatedEta = etaResponse.data.eta;
        console.log("Calculated ETA Response:", etaResponse.data);
        console.log("Calculated ETA Object:", calculatedEta);

        let etaFormatted;
        if (calculatedEta && typeof calculatedEta === "object") {
          const days = calculatedEta.totalDays || 0;
          etaFormatted = `${days}`;
          console.log("Formatted ETA:", etaFormatted);
        } else {
          etaFormatted = "Invalid ETA";
          console.log("Invalid ETA Calculation.");
        }

        // Sending WhatsApp Message
        const messageData = {
          to: `+91${ticketDetails?.contactNumber}`,
          sal: "Mr.",
          name: ticketDetails?.name,
          ticketId: idToUse,
          engineerName: selectedEngineer ? selectedEngineer.name : "Engineer",
          eta: etaFormatted,
        };

        console.log("Sending WhatsApp Message Data:", messageData);
        await axios.post(
          `${import.meta.env.VITE_API_URL}/send-whatsapp-closed`,
          messageData
        );

        // Sending Email
        const emailData = {
          recipientEmails: allEmails,
          ticketId: idToUse,
          issueCategory: ticketDetails?.issueCategory || "General Issue",
          issueDescription:
            ticketDetails?.issueDescription || "No description provided.",
          firstName: ticketDetails?.name || "Customer",
        };

        console.log("Sending Email Data:", emailData);
        await axios.post(
          `${import.meta.env.VITE_API_URL}/send-closed-tickets-mail`,
          emailData
        );

        // Sending Feedback Email
        const feedbackData = {
          recipientEmails: allEmails,
          ticketId: idToUse,
          firstName: ticketDetails?.name || "Customer",
        };

        console.log("Sending Feedback Email Data:", feedbackData);
        await axios.post(
          `${import.meta.env.VITE_API_URL}/send-feedback-mail`,
          feedbackData
        );

        setShowSuccessPopup(true);
      } else if (ticketStatus === "In Progress") {
        // Handle in progress status
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

        console.log("Ticket In Progress Response:", inProgressResponse.data);
        setTicketDetails(inProgressResponse.data.ticket);
        

        const inProgressMessageData = {
          to: `+91${selectedEngineer.mobile}`,
          engineerName: selectedEngineer.name,
          ticketId: idToUse,
          companyName: ticketDetails?.companyName || "YourCompany",
          operatorName: ticketDetails?.name || "OperatorName",
          operatorMobile: ticketDetails?.contactNumber || "OperatorMobile",
        };

        console.log(
          "Sending In Progress WhatsApp Message Data:",
          inProgressMessageData
        );
        await axios.post(
          `${import.meta.env.VITE_API_URL}/send-whatsapp-assign-engineer`,
          inProgressMessageData
        );

        const emailDataInProgress = {
          recipientEmails: allEmails,
          ticketId: idToUse,
          issueCategory: ticketDetails?.issueCategory || "General Issue",
          issueDescription:
            ticketDetails?.issueDescription || "No description provided.",
          firstName: ticketDetails?.name || "Customer",
        };

        console.log("Sending In Progress Email Data:", emailDataInProgress);
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

        console.log("Sending In Progress WhatsApp Message:", inProgressMessage);
        await axios.post(
          `${import.meta.env.VITE_API_URL}/send-whatsapp-inprogress`,
          inProgressMessage
        );
      } else {
        // Handle other status updates
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
    <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50">
      <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50">
        <div className="custom-div bg-white shadow-lg p-8 rounded-lg w-[90vw] max-w-7xl h-[80vh] max-h-[90vh] relative overflow-hidden mt-20 flex flex-col">
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
          <div className="flex items-center justify-between mb-4">
            {/* Ticket Details Heading aligned slightly towards right */}
            <div className="text-center pl-[43%]">
              <h2 className="text-xl font-semibold text-left font-poppins flex-1 ml-4">
                Ticket Details
              </h2>
            </div>
            {/* Checkbox and Label aligned on the right side */}
            <div className="flex items-center mr-10 hidden">
              <label
                htmlFor="specialCheckbox"
                className="mr-4 text-sm font-poppins cursor-pointer"
              >
                Under Observation
              </label>
              <input
                type="checkbox"
                id="specialCheckbox"
                checked={isCheckboxChecked}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-buttoncolor rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Option Selection Popup */}
          {showOptionPopup && (
            <div className="fixed inset-0 flex items-center justify-center z-60 bg-black bg-opacity-50">
              <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                <h3 className="text-lg font-semibold mb-4 font-poppins text-center">
                  Select a Time Range
                </h3>
                <div className="flex flex-col space-y-3">
                  {/* Dropdown Options 0 to 9 and Custom Input */}
                  <label className="block text-gray-700 font-poppins">
                    Select Time Range:
                  </label>
                  <select
                    value={selectedOptions}
                    onChange={(e) => setSelectedOptions(e.target.value)}
                    className="block w-full bg-gray-200 border border-gray-300 text-gray-700 py-2 px-3 rounded font-poppins"
                  >
                    {/* Placeholder Option */}
                    <option value="" disabled>
                      Select a time range
                    </option>

                    {/* Options 0-9 */}
                    {[...Array(10).keys()].map((i) => (
                      <option key={i} value={`${i}`}>
                        {i} days
                      </option>
                    ))}

                    {/* Custom Input Option */}
                    <option value="custom">Custom Input</option>
                  </select>

                  {/* Custom Input Option - Shows input field if "Custom Input" is selected */}
                  {selectedOptions === "custom" && (
                    <div className="mt-4">
                      <label className="block text-gray-700 font-poppins">
                        Enter Custom Number:
                      </label>
                      <input
                        type="number"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        className="block w-full bg-gray-200 border border-gray-300 text-gray-700 py-1 px-2 rounded font-poppins"
                        placeholder="Enter a number"
                      />
                    </div>
                  )}
                </div>

                {/* Submit Button - Disabled until a valid option is selected */}
                <button
                  onClick={handleSubmitInput} // Handle submit for either predefined or custom input
                  className={`mt-4 bg-buttoncolor text-white py-2 px-4 rounded  transition duration-200 font-poppins w-full ${
                    !selectedOptions ||
                    (selectedOptions === "custom" && !userInput)
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={
                    !selectedOptions ||
                    (selectedOptions === "custom" && !userInput)
                  } // Disable if no option or custom input is empty
                >
                  Submit
                </button>

                <button
                  onClick={() => {
                    setShowOptionPopup(false); // Close the option popup
                    setSelectedOptions(""); // Reset selected option
                    setUserInput(""); // Clear custom input value
                    setIsCheckboxChecked(false); // Reset the checkbox state
                  }}
                  className="mt-4 text-gray-600 hover:text-gray-800 py-2 px-4 w-full text-sm font-poppins bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="ticket flex items-center justify-center mb-4">
            <span style={{ marginRight: "8px" }} className="font-poppins">
              Your Deskassure ID is
            </span>
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
              // Image after copying
              <img
                src="/copy_green.png" // Path to the "green copy" icon (after copy)
                alt="Copied Icon"
                className="h-6 w-6 ml-3 cursor-pointer"
              />
            )}

            {/* Copied Message */}
            {copiedTicketId && (
              <span className="ml-2 text-green-500 text-sm font-poppins">
                Copied!
              </span>
            )}
          </div>

          {/* Flex container for User Input and Admin Input side by side */}
          <div className="flex flex-grow mb-4">
            {/* Left Section: User Input */}
            <div className="w-full sm:w-1/2 p-2 border-r border-gray-300 overflow-y-auto max-h-[80vh] pr-10">
              <h3 className="text-md font-semibold mb-1 font-poppins">
                User Input
              </h3>

              {/* User Information Fields */}

              <div className="mb-2 mt-2 hidden">
                {/* <label className="block text-gray-700 font-poppins">Created Date & Time</label> */}
                <p className="block text-gray-700 font-poppins">
                  Created Date and Time:{" "}
                  {ticketDetails?.date && ticketDetails?.time
                    ? `${ticketDetails.date} ${ticketDetails.time}`
                    : "N/A"}
                </p>
              </div>
              <div className="mb-2">
                <label className="block text-gray-700 font-poppins">
                  Name:
                </label>
                <input
                  type="text"
                  value={ticketDetails?.name || ""}
                  readOnly
                  className="block w-full bg-gray-200 border border-gray-300 text-gray-700 py-1 px-2 rounded font-poppins read-only: cursor-not-allowed"
                />
              </div>
              {/* Manager Email */}
              <div className="mb-2 hidden">
                <label className="block text-gray-700 font-poppins">
                  Manager's Email(s):
                </label>
                <div className="block w-full bg-gray-200 border border-gray-300 text-gray-700 py-1 px-2 rounded font-poppins read-only: cursor-not-allowed">
                  {/* Display all manager emails */}
                  {managerEmails.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {managerEmails.map((email, index) => (
                        <li key={index} className="text-gray-700">
                          {email}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span>No managers available</span>
                  )}
                </div>
              </div>

              <div className="mb-2">
                <label className="block text-gray-700 font-poppins">
                  Contact Number:
                </label>
                <input
                  type="text"
                  value={ticketDetails?.contactNumber || ""}
                  readOnly
                  className="block w-full bg-gray-200 border border-gray-300 text-gray-700 py-1 px-2 rounded font-poppins read-only: cursor-not-allowed"
                />
              </div>

              <div className="mb-2">
                <label className="block text-gray-700 font-poppins">
                  Email ID:
                </label>
                <input
                  type="email"
                  value={ticketDetails?.email || ""}
                  readOnly
                  className="block w-full bg-gray-200 border border-gray-300 text-gray-700 py-1 px-2 rounded font-poppins read-only: cursor-not-allowed"
                />
              </div>

              {/* Other Fields */}
              <div className="mb-2">
                <label className="block text-gray-700 font-poppins">
                  Issue Category:
                </label>
                <input
                  type="text"
                  value={ticketDetails?.issueCategory || "N/A"}
                  readOnly
                  className="block w-full bg-gray-200 border border-gray-300 text-gray-700 py-1 px-2 rounded font-poppins read-only: cursor-not-allowed"
                />
              </div>

              <div className="mb-2">
                <label className="block text-gray-700 font-poppins">
                  Issue Description:
                </label>
                <textarea
                  value={ticketDetails?.issueDescription || ""}
                  readOnly
                  className="block w-full bg-gray-200 border border-gray-300 text-gray-700 py-1 px-2 rounded font-poppins read-only: cursor-not-allowed"
                />
              </div>
              <div className="mb-2 hidden ">
                <label className="block text-gray-700 font-poppins">
                  Created Date
                </label>
                <input
                  value={ticketDetails?.date || ""}
                  readOnly
                  className="block w-full bg-gray-200 border border-gray-300 text-gray-700 py-1 px-2 rounded font-poppins"
                />
              </div>
              <div className="mb-2 hidden">
                <label className="block text-gray-700 font-poppins">
                  Created Time
                </label>
                <input
                  value={ticketDetails?.time || ""}
                  readOnly
                  className="block w-full bg-gray-200 border border-gray-300 text-gray-700 py-1 px-2 rounded font-poppins"
                />
              </div>
            </div>

            {/* Right Section: Admin Input */}
            <div className="w-full sm:w-1/2 p-2 overflow-y-auto max-h-[80vh] pl-10">
              <h3 className="text-md font-semibold mb-1 font-poppins">
                Admin Input
              </h3>
              {/* Other Admin Fields */}
              <div className="mb-2">
                <label className="block text-gray-700 font-poppins">
                  Resolution:
                </label>
                <textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="block w-full bg-white border border-gray-300 text-gray-700 py-1 px-2 rounded font-poppins"
                  placeholder="Enter resolution details"
                />
              </div>

              <div className="mb-2">
                <label className="block text-gray-700 font-poppins">
                  Preventive Action:
                </label>
                <input
                  value={preventiveAction}
                  onChange={(e) => setPreventiveAction(e.target.value)}
                  className="block w-full bg-white border border-gray-300 text-gray-700 py-1 px-2 rounded font-poppins"
                  placeholder="Enter preventive action details"
                />
              </div>

              {/* Dropdowns */}
              <div className="mb-2">
                <label className="block text-gray-700 font-poppins">
                  Warranty Category:
                </label>
                <select
                  value={warrantyCategory}
                  onChange={(e) => setWarrantyCategory(e.target.value)}
                  className="block w-full bg-white border border-gray-300 text-gray-700 py-1 px-2 rounded font-poppins"
                >
                  <option value="">Please select</option>
                  <option>Comprehensive AMC</option>
                  <option>Non Comprehensive AMC</option>
                  <option>In-Warranty</option>
                  <option>Out-of-Warranty</option>
                </select>
              </div>

              <div className="mb-2">
                <label className="block text-gray-700 font-poppins">
                  Engineer:
                </label>
                <select
                  value={engineerId}
                  onChange={(e) => setEngineerId(e.target.value)}
                  className="block w-full bg-white border border-gray-300 text-gray-700 py-1 px-2 rounded font-poppins"
                >
                  <option value="">Select Engineer</option>
                  {engineers.map((engineer) => (
                    <option key={engineer._id} value={engineer._id}>
                      {engineer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="block text-gray-700 font-poppins">
                  Ticket Status:
                </label>
                <select
                  value={ticketStatus}
                  onChange={(e) => setTicketStatus(e.target.value)}
                  className="block w-full bg-white border border-gray-300 text-gray-700 py-1 px-2 rounded font-poppins"
                >
                  <option value="">Select Status</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In-Progress</option>
                  <option value="Complete">Complete</option>
                </select>
              </div>
              {/* Current Date and Time */}
              <div className="mb-2 ml-56">
                {/* <label className="block text-gray-700 font-poppins">Current Date and Time:</label> */}
                <p className="block text-gray-700 font-poppins text-sm ">
                  Current Date and Time:{" "}
                  {currentDateTime ? currentDateTime.toLocaleString() : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center mt-2">
            <button
              onClick={handleSubmit}
              className="bg-buttoncolor text-white py-2 px-4 rounded transition duration-200 h-10 w-40 font-poppins"
            >
              Submit
            </button>
          </div>
        </div>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-60">
          <div className="bg-white rounded-lg shadow-lg p-4 w-80 text-center">
            <h3 className="text-lg font-bold mb-2">Success</h3>
            <p>Ticket has been closed successfully!</p>
            <button
              onClick={handleClosePopup}
              className="bg-blue-500 text-white py-1 px-4 rounded hover:bg-blue-600 transition duration-200 mt-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetailsModal;
