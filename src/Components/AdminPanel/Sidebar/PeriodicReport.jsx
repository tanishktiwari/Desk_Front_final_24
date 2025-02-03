import React, { useState, useEffect } from "react";
import axios from "axios";

const PeriodicReport = () => {
  const [companies, setCompanies] = useState([]); // List of companies
  const [selectedCompany, setSelectedCompany] = useState(""); // Selected company
  const [startDate, setStartDate] = useState(""); // Start date for range
  const [endDate, setEndDate] = useState(""); // End date for range
  const [reportData, setReportData] = useState(null); // Report data
  const [operators, setOperators] = useState([]); // List of operators
  const [error, setError] = useState(""); // Error message
  const [isReportSent, setIsReportSent] = useState(false); // To track if the report is sent
  const [isReportFetched, setIsReportFetched] = useState(false); // Track if report has been fetched

  // New state variables for the new fields
  const [healthCheck, setHealthCheck] = useState("");
  const [ppmStatus, setPpmStatus] = useState("");
  const [customerSatisfaction, setCustomerSatisfaction] = useState("");

  // State for user details input
  const [userDetails, setUserDetails] = useState([
    { title: "", name: "", email: "" },
  ]);
  // State for controlling sections
  const [showReportSection, setShowReportSection] = useState(false);
  const [showInputFields, setShowInputFields] = useState(false);

  // Fetch companies from the API
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/companies`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch companies.");
        }
        const data = await response.json();
        setCompanies(data);
      } catch (error) {
        console.error("Error fetching companies:", error);
        setError(error.message);
      }
    };

    fetchCompanies();
  }, []);

  // Fetch report data based on selected company and date range
  const fetchReportData = async () => {
  if (!selectedCompany || !startDate || !endDate) {
    setError("Please select a company and a valid date range.");
    return;
  }

  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/ticketsByCompany`,
      {
        params: {
          companyName: selectedCompany,
          startDate: startDate,
          endDate: endDate,
        },
      }
    );

    // Check if no data was returned
    if (!response.data || response.data.length === 0) {
      setError(`No data available for ${selectedCompany} between ${startDate} and ${endDate}.`);
      setReportData({
    totalTickets: 0,
    totalClosedTickets: 0,
    monthlyETA: 0,
    categoryCounts: {
      CCTV: 0,
      'Access Control': 0,
      'Fire Alarm System': 0,
      Others: 0,
    },
    averageCctvETA: 0,
    averageAccessControlETA: 0,
    averageFireAlarmETA: 0,
    averageOthersETA: 0,
    othersETAs: [],
    fireAlarmETAs: [],
  });
      setIsReportFetched(false);
      setShowReportSection(false); // Hide the report section
    } else {
      setReportData(response.data);
      setIsReportFetched(true);
      setShowReportSection(true);
      setError(""); // Clear any previous error
    }
  } catch (err) {
    console.error("Error fetching report data:", err.message);
    setError(
      err.response?.data?.message || "Failed to fetch report details."
    );
    setReportData({
    totalTickets: 0,
    totalClosedTickets: 0,
    monthlyETA: 0,
    categoryCounts: {
      CCTV: 0,
      'Access Control': 0,
      'Fire Alarm System': 0,
      Others: 0,
    },
    averageCctvETA: 0,
    averageAccessControlETA: 0,
    averageFireAlarmETA: 0,
    averageOthersETA: 0,
    othersETAs: [],
    fireAlarmETAs: [],
  });;
    setIsReportFetched(true);
    setShowReportSection(true); // Hide the report section
  }
};

  const handleNextSection = () => {
    setShowInputFields(true); // Show the next section with input fields
  };
  // Fetch saved contacts when a company is selected
  useEffect(() => {
    if (!selectedCompany) return;

    const fetchSavedContacts = async () => {
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_API_URL
          }/api/company/${selectedCompany}/contacts`
        );

        // If no contacts exist, set to a single blank row
        if (!response.data || response.data.length === 0) {
          setUserDetails([{ title: "", name: "", email: "" }]);
        } else {
          setUserDetails(response.data);
        }
      } catch (err) {
        console.error("Error fetching saved contacts:", err);
        // On error, also set to a blank row
        setUserDetails([{ title: "", name: "", email: "" }]);
      }
    };

    fetchSavedContacts();
  }, [selectedCompany]);

  // Utility function to round numbers to 2 decimal places
  const roundToTwoDecimalPlaces = (num) => {
    return num ? num.toFixed(2) : "0"; // Ensures a fallback value of "N/A" if the number is undefined or null
  };

  // Handle sending the monthly report email to each operator
  // Handle sending the monthly report email to specific contacts
  const handleSendMonthlyReport = async () => {
  if (!reportData) {
    setError("No report data available to send.");
    return;
  }

  // Filter out contacts with valid email addresses
  const validContacts = userDetails.filter(
    (user) => user.email && user.email.trim() !== ""
  );

  if (validContacts.length === 0) {
    setError("No valid email contacts to send the report.");
    return;
  }

  try {
    // Create promises to send the report emails to valid contacts
    const emailPromises = validContacts.map((contact) => {
      const emailData = {
        recipientEmails: [contact.email],
        firstName: contact.name,
        startDate: startDate,
        endDate: endDate,
        totalTickets: reportData.totalTickets || 0, // Default to 0 if no data
        totalClosedTickets: reportData.totalClosedTickets || 0, // Default to 0 if no data
        // Default to 0 if no data available for these categories
        cctvCount: reportData.categoryCounts?.CCTV || 0, // Default to 0
        averageCctvETA: roundToTwoDecimalPlaces(reportData.averageCctvETA) || 0, // Default to 0
        accessControlCount: reportData.categoryCounts?.['Access Control'] || 0, // Default to 0
        averageAccessControlETA: roundToTwoDecimalPlaces(reportData.averageAccessControlETA) || 0, // Default to 0
        fireAlarmCount: reportData.categoryCounts?.['Fire Alarm System'] || 0, // Default to 0
        averageFireAlarmETA: roundToTwoDecimalPlaces(reportData.averageFireAlarmETA) || 0, // Default to 0
        othersCount: reportData.categoryCounts?.Others || 0, // Default to 0
        averageOthersETA: roundToTwoDecimalPlaces(reportData.averageOthersETA) || 0, // Default to 0
        monthlyETA: roundToTwoDecimalPlaces(reportData.monthlyETA) || 0, // Default to 0
        healthCheck: healthCheck || 0, // Default to 0 if no healthCheck data
        ppmStatus: ppmStatus || 'Not available', // Default to 'Not available' if no data
        customerSatisfaction: customerSatisfaction || 'Not available', // Default to 'Not available' if no data
        initial: contact.title || '', // Default to empty if no title
        // Add extra information to send in the email body
        othersETAs: reportData.othersETAs || [], // Default to empty array if no ETAs available
        fireAlarmETAs: reportData.fireAlarmETAs || [], // Default to empty array if no ETAs available
      };

      // Log for debugging purposes
      console.log(`Sending email to ${contact.email}:`, emailData);

      // Send email through API
      return axios.post(
        `${import.meta.env.VITE_API_URL}/send-monthly-report-mail`,
        emailData
      );
    });

    // Wait for all email promises to resolve
    await Promise.all(emailPromises);

    console.log("Emails sent successfully to all contacts.");
    setIsReportSent(true);
    setError(""); // Clear previous errors
  } catch (err) {
    console.error("Error sending email:", err.message);
    setError("Failed to send the report emails.");
  }
};


  // Handle adding a new user detail row
  const addNewUserDetail = () => {
    setUserDetails([...userDetails, { title: "", name: "", email: "" }]);
  };

  // Handle removing a user detail row
  const removeUserDetail = async (contactId) => {
    try {
      // Send DELETE request to the backend with company name and contact ID
      await axios.delete(
        `${
          import.meta.env.VITE_API_URL
        }/api/company/${selectedCompany}/contact/${contactId}`
      );

      // After deletion, update the contacts list by filtering out the deleted contact
      setUserDetails((prevUserDetails) =>
        prevUserDetails.filter((contact) => contact._id !== contactId)
      );
    } catch (error) {
      console.error("Error deleting contact:", error);
      setError("Failed to delete contact");
    }
  };

  // Handle user detail changes
  const handleUserDetailChange = (index, field, value) => {
    const updatedUserDetails = [...userDetails];
    updatedUserDetails[index][field] = value;
    setUserDetails(updatedUserDetails);
  };

  // Handle saving the email
  const handleSaveMail = async () => {
    // Filter out only the new, unsaved contacts (those without _id)
    const newContacts = userDetails.filter((user) => !user._id);

    // If no new contacts, return early
    if (newContacts.length === 0) return;

    try {
      // Save each new contact and update the state immediately
      const updatedUserDetails = await Promise.all(
        newContacts.map(async (user) => {
          const { title, name, email } = user;
          // Send POST request to save the new contact to the backend
          const response = await axios.post(
            `${
              import.meta.env.VITE_API_URL
            }/api/company/${selectedCompany}/contact`,
            { title, name, email }
          );

          // Return the contact with the _id added from the server response
          return { ...user, _id: response.data._id };
        })
      );

      // Update the userDetails state to include the new contacts with _id
      setUserDetails((prevUserDetails) => [
        ...prevUserDetails.filter((user) => user._id), // Keep only existing contacts with _id
        ...updatedUserDetails, // Add the new contacts with _id
      ]);

      console.log("Contacts saved successfully");
    } catch (error) {
      console.error("Error saving contact:", error);
    }
  };

  return (
    <div className="flex items-center justify-center h-[100%] min-h-screen  w-[100%] bg-gray-200 font-poppins">
      {" "}
      {/* Full screen center */}
      <div className="mt-[6%] mb-[2%]">
        {" "}
        {/* Centered card with shadow */}
        <div className="p-20  rounded-2xl shadow-lg w-full max-w-7xl bg-white mb-5 ">
          <h1 className="text-2xl font-bold mb-6 text-center">Reports</h1>

          <div className="flex gap-10 mb-6 justify-center items-center">
            {/* Company Dropdown */}
            <div className="mb-4 w-40">
              <label className="block font-semibold mb-1">
                Select Company:
              </label>
              <select
                className="border border-gray-300 rounded p-2 w-full"
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
              >
                <option value="">Select Company</option>
                {companies.map((company) => (
                  <option key={company.name} value={company.name}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Inputs */}
            <div className="mb-4">
              <label className="block font-semibold mb-1">Start Date:</label>
              <input
                type="date"
                className="border border-gray-300 rounded p-2 w-40"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block font-semibold mb-1">End Date:</label>
              <input
                type="date"
                className="border border-gray-300 rounded p-2 w-40"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            {/* Fetch Report Button */}
            <div className="mb-4 self-end">
              <button
                onClick={fetchReportData}
                className="bg-buttoncolor text-white px-6 py-2 rounded-lg  transition"
              >
                Go
              </button>
            </div>
          </div>
        </div>
        {/* Error Message Display */}
{error && (
  <div className="p-20 pt-10 pb-10 rounded-2xl shadow-xl w-full max-w-7xl bg-white mb-5">
    <div className="text-center text-buttoncolor font-semibold text-lg">
      {error}
    </div>
  </div>
)}
        {/* Report Data Display */}
        {isReportFetched && (
          <div className="p-20 pt-10 pb-10  rounded-2xl shadow-xl w-full max-w-7xl bg-white mb-5">
            <div className="mt-6">
              <div className="mb-4">
                <h1 className="font-poppins text-center  font-bold text-3xl mb-5"> Report Overview</h1>
                <p className="text-center text-lg font-medium mb-10">Company Name:  {selectedCompany}</p>
                <h2 className="font-semibold text-left mb-5">
                  Report for {startDate} to {endDate}
                </h2>

                {/* Report Summary Table */}
                <table className="w-full border-collapse table-auto text-center">
                  <thead>
                    <tr>
                      <th className="border px-4 py-2">Metric</th>
                      <th className="border px-4 py-2">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border px-4 py-2">Total Tickets</td>
                      <td className="border px-4 py-2">
                        {reportData.totalTickets}
                      </td>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2">Total Closed Tickets</td>
                      <td className="border px-4 py-2">
                        {reportData.totalClosedTickets}
                      </td>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2">Monthly Average ETA:</td>
                      <td className="border px-4 py-2">
                        {roundToTwoDecimalPlaces(reportData.monthlyETA)}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Category Counts Table */}
                <div className="mt-6">
                  <h3 className="font-semibold text-left mb-2">
                    Category Counts:
                  </h3>
                  {reportData.categoryCounts &&
                  Object.entries(reportData.categoryCounts).length > 0 ? (
                    <table className="w-full border-collapse table-auto text-center">
                      <thead>
                        <tr>
                          <th className="border px-4 py-2">Category</th>
                          <th className="border px-4 py-2">Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(reportData.categoryCounts).map(
                          ([category, count]) => (
                            <tr key={category}>
                              <td className="border px-4 py-2">{category}</td>
                              <td className="border px-4 py-2">{count}</td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-center mt-2">
                      No category data available
                    </p>
                  )}
                </div>

                {/* Average ETAs Table */}
                <div className="mt-6">
                  <h3 className="font-semibold text-left mb-2">
                    Average ETA's:
                  </h3>
                  <table className="w-full border-collapse table-auto text-center">
                    <thead>
                      <tr>
                        <th className="border px-4 py-2">Category</th>
                        <th className="border px-4 py-2">Average ETA</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border px-4 py-2">CCTV</td>
                        <td className="border px-4 py-2">
                          {roundToTwoDecimalPlaces(reportData.averageCctvETA)}
                        </td>
                      </tr>
                      <tr>
                        <td className="border px-4 py-2">Access Control</td>
                        <td className="border px-4 py-2">
                          {roundToTwoDecimalPlaces(
                            reportData.averageAccessControlETA
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="border px-4 py-2">Fire Alarm</td>
                        <td className="border px-4 py-2">
                          {roundToTwoDecimalPlaces(
                            reportData.averageFireAlarmETA
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="border px-4 py-2">Others</td>
                        <td className="border px-4 py-2">
                          {roundToTwoDecimalPlaces(reportData.averageOthersETA)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-center mt-6">
                  <button
                    onClick={handleNextSection}
                    className="bg-buttoncolor text-white px-6 py-2 rounded-lg transition w-32"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Health Check, PPM, and Customer Satisfaction Inputs */}
        {showInputFields && (
          <div className="p-20  rounded-2xl shadow-xl w-full max-w-7xl bg-white mb-5">
            <div className="mt-6 flex gap-10 justify-center mb-6">
              <div className="mb-4 w-60">
                <label className="block font-semibold mb-1">
                  Health Check:
                </label>
                <input
                  type="text"
                  className="border border-gray-300 rounded p-2 w-full"
                  value={healthCheck}
                  onChange={(e) => setHealthCheck(e.target.value)}
                  placeholder="Enter Health Check Status"
                />
              </div>
              <div className="mb-4 w-60">
                <label className="block font-semibold mb-1">PPM Status:</label>
                <input
                  type="text"
                  className="border border-gray-300 rounded p-2 w-full"
                  value={ppmStatus}
                  onChange={(e) => setPpmStatus(e.target.value)}
                  placeholder="Enter PPM Status"
                />
              </div>
              <div className="mb-4 w-60">
                <label className="block font-semibold mb-1">
                  Customer Satisfaction:
                </label>
                <input
                  type="text"
                  className="border border-gray-300 rounded p-2 w-full"
                  value={customerSatisfaction}
                  onChange={(e) => setCustomerSatisfaction(e.target.value)}
                  placeholder="Enter Customer Satisfaction"
                />
              </div>
            </div>
            {/* Save Mail and Send Report Buttons */}
            <div className=" flex justify-center ">
              {isReportFetched && (
                <>
                  <button
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition hidden"
                    onClick={handleSaveMail}
                  >
                    Save Mail
                  </button>

                  <button
                    className="bg-buttoncolor text-white px-6 py-2 rounded-lg  transition"
                    onClick={handleSendMonthlyReport}
                  >
                    Send Monthly Report
                  </button>
                </>
              )}
            </div>
          </div>
        )}
        {/* Add/Remove User Details */}
        {isReportFetched && (
          <div className="p-20  rounded-2xl shadow-xl w-full max-w-7xl bg-white mb-5 hidden">
            <div className="mt-6 ">
              {userDetails.map((user, index) => (
                <div
                  key={index}
                  className="flex items-center mb-4 justify-center"
                >
                  <input
                    type="text"
                    value={user.title}
                    onChange={(e) =>
                      handleUserDetailChange(index, "title", e.target.value)
                    }
                    className="border p-2 w-1/4 rounded"
                    placeholder="Title"
                    disabled={user._id}
                  />
                  <input
                    type="text"
                    value={user.name}
                    onChange={(e) =>
                      handleUserDetailChange(index, "name", e.target.value)
                    }
                    className="border p-2 w-1/4 rounded ml-2"
                    placeholder="Name"
                    disabled={user._id}
                  />
                  <input
                    type="email"
                    value={user.email}
                    onChange={(e) =>
                      handleUserDetailChange(index, "email", e.target.value)
                    }
                    className="border p-2 w-1/4 rounded ml-2"
                    placeholder="Email"
                    disabled={user._id}
                  />
                  <button
                    onClick={() => removeUserDetail(user._id)}
                    className="ml-2 text-red-500"
                  >
                    🗑️
                  </button>
                  {userDetails.length - 1 === index && (
                    <button
                      onClick={addNewUserDetail}
                      className="ml-2 text-blue-500"
                    >
                      +
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Success Message */}
        {isReportSent && (
          <p className="text-buttoncolor mt-4 text-center">
            Report sent successfully!
          </p>
        )}
      </div>
    </div>
  );
};

export default PeriodicReport;
