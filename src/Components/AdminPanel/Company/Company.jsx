import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaEnvelope } from "react-icons/fa";
import "../Company/Company.css";
import axios from 'axios';

const Company = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [companyData, setCompanyData] = useState({
    name: "",
    gst: "",
    website: "",
    address: "",
    logo: "",
    ppm: "default", // Default value for PPM dropdown
    maintenanceStart: "",
    maintenanceEnd: "",
    healthCheck: "default", // Default value for Health Check dropdown
    supportTimings: "default", // Default support timings
  });
  

  const [companies, setCompanies] = useState([]);
  const [editingCompanyId, setEditingCompanyId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [errors, setErrors] = useState({
    name: "",
    gst: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  // Function to format the date to dd-mm-yyyy
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // months are 0-indexed
    const year = date.getFullYear();
    return `${year}-${month}-${day}`; // format to yyyy-mm-dd for input[type="date"]
  };

  const fetchCompanies = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/companies`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setCompanies(data);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter((company) => {
    const searchValue = searchTerm.toLowerCase();
    return (
      company.name.toLowerCase().includes(searchValue) ||
      company.gst.toLowerCase().includes(searchValue) ||
      company.website.toLowerCase().includes(searchValue) ||
      company.address.toLowerCase().includes(searchValue)
    );
  });

  const totalEntries = filteredCompanies.length;
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalEntries);
  const paginatedCompanies = filteredCompanies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);

  useEffect(() => {
    localStorage.setItem("totalCompanyCount", totalEntries);
  }, [totalEntries]);

  const handleAddClick = () => {
    setShowPopup(true);
    setEditingCompanyId(null);
    setCompanyData({
      name: "",
      gst: "",
      website: "",
      address: "",
      logo: "",
      ppm: "default",
      healthCheck: "default",
    });
    setErrors({ name: "", gst: "" });
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setEditingCompanyId(null);
    setCompanyData({
      name: "",
      gst: "",
      website: "",
      address: "",
      logo: "",
      ppm: "default",
      healthCheck: "default",
    });
    setErrors({ name: "", gst: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCompanyData({ ...companyData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validateFields = () => {
    let isValid = true;
    const newErrors = { name: "", gst: "" };

    if (!companyData.name) {
      newErrors.name = "Company Name is required";
      isValid = false;
    }

    if (!companyData.gst) {
      newErrors.gst = "Company GST is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    // Prepare the payload to send to the server
    const payload = {
      name: companyData.name,
      gst: companyData.gst,
      website: companyData.website,
      address: companyData.address,
      healthCheckFrequency: companyData.healthCheck, // Ensure healthCheck is passed
      ppmCheckFrequency: companyData.ppm, // Ensure ppm is passed
      maintenanceStartDate: companyData.maintenanceStart
        ? new Date(companyData.maintenanceStart).toISOString()
        : null,
      maintenanceEndDate: companyData.maintenanceEnd
        ? new Date(companyData.maintenanceEnd).toISOString()
        : null,
      supportTimings: companyData.supportTimings, // Ensure supportTimings is passed
    };

    console.log("Sending payload:", payload); // Log the payload to verify

    // Check if required fields are missing
    if (
      !payload.name ||
      !payload.gst ||
      !payload.address ||
      !payload.healthCheckFrequency ||
      !payload.ppmCheckFrequency ||
      !payload.supportTimings
    ) {
      console.error("Missing required fields:", payload);
      alert(
        "Name, GST, address, health check frequency, and ppm check frequency, and support timings are required."
      );
      return;
    }

    try {
      const method = editingCompanyId ? "PUT" : "POST";
      const url = editingCompanyId
        ? `${import.meta.env.VITE_API_URL}/companies/${editingCompanyId}`
        : `${import.meta.env.VITE_API_URL}/companies`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response from server:", errorData);
        throw new Error(
          `Network response was not ok: ${errorData.message || "Unknown error"}`
        );
      }

      fetchCompanies();
      setShowPopup(false);
      setCompanyData({
        name: "",
        gst: "",
        website: "",
        address: "",
        logo: "",
        ppm: "", // Ensure this is set properly
        healthCheck: "", // Ensure this is set properly
        supportTimings: "default", // Reset supportTimings
        maintenanceStart: "",
        maintenanceEnd: "",
      });
    } catch (error) {
      console.error("Error adding or updating company:", error);
    }
  };

  const handleEditClick = (company) => {
    console.log("Editing company: ", company); // Check API response and structure
    setEditingCompanyId(company._id);
    setCompanyData({
      name: company.name,
      gst: company.gst,
      website: company.website,
      address: company.address,
      logo: company.logo,
      ppm: company.ppmCheck?.frequency || "default",
      healthCheck: company.healthCheck?.frequency || "default",
      maintenanceStart: formatDate(company.maintenanceStartDate), // Ensure this is being correctly formatted
      maintenanceEnd: formatDate(company.maintenanceEndDate),
      supportTimings: company.supportTimings || "default", // Ensure this is properly set
    });
    setShowPopup(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this company?")) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/companies/${id}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        fetchCompanies();
      } catch (error) {
        console.error("Error deleting company:", error);
      }
    }
  };

  // New state for email popup
  const [isEmailPopupVisible, setIsEmailPopupVisible] = useState(false);
const [userDetails, setUserDetails] = useState([
  { title: "", name: "", email: "", _id: false }
]);
const [selectedCompany, setSelectedCompany] = useState(null);


const handleOpenEmailPopup = (company) => {
  setSelectedCompany(company);
  setIsEmailPopupVisible(true);
};

const handleCloseEmailPopup = () => {
  setIsEmailPopupVisible(false);
};

const handleUserDetailChange = (index, key, value) => {
  const updatedDetails = [...userDetails];
  updatedDetails[index][key] = value;
  setUserDetails(updatedDetails);
};

const addNewUserDetail = () => {
  setUserDetails([
    ...userDetails,
    { title: "", name: "", email: "", _id: false }
  ]);
};

// Handle saving the email
  const handleSaveMail = async () => {
  const newContacts = userDetails.filter((user) => !user._id);
  if (newContacts.length === 0) return;

  try {
    const updatedUserDetails = await Promise.all(
      newContacts.map(async (user) => {
        const { title, name, email } = user;
        console.log("Sending Contact Data:", { title, name, email });  // Log contact data

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/company/${selectedCompany?.name}/contact`,
          { title, name, email }
        );

        return { ...user, _id: response.data._id };
      })
    );

    setUserDetails((prevUserDetails) => [
      ...prevUserDetails.filter((user) => user._id),
      ...updatedUserDetails,
    ]);

    console.log("Contacts saved successfully");
    alert("Contacts saved successfully")
  } catch (error) {
    console.error("Error saving contact:", error);
    if (error.response) {
      console.error('Backend error:', error.response.data);
    }
  }
};
// Fetch contacts on component mount
  useEffect(() => {
  const fetchContacts = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/company/${selectedCompany?.name}/contacts`);
      
      // If no contacts are fetched, set to a default empty row
      setUserDetails(
        response.data.length > 0 
          ? response.data 
          : [{ title: "", name: "", email: "", _id: false }]
      );
    } catch (error) {
      console.error('Error fetching contacts:', error);
      
      // If there's an error, also default to an empty row
      setUserDetails([{ title: "", name: "", email: "", _id: false }]);
    }
  };

  if (selectedCompany?.name) {
    fetchContacts();
  }
}, [selectedCompany, isEmailPopupVisible]);

  // Handle delete contact
 // Handle removing a user detail row
  const removeUserDetail = async (index) => {
  const userToRemove = userDetails[index];

  try {
    if (userToRemove._id) {
      // If the user has an _id (i.e., it exists in the database), delete from the backend
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/company/${selectedCompany?.name}/contact/${userToRemove._id}`
      );
      console.log("Contact deleted successfully");
      alert("Contact deleted successfully");
    }
  } catch (error) {
    console.error("Error deleting contact:", error);
  }

  // Regardless of whether the user was in the database or just a new row, remove from the state
  setUserDetails((prevUserDetails) =>
    prevUserDetails.filter((_, i) => i !== index)
  );
};



  return (
    <div className="max-w-6xl mx-auto p-4 ml-[12%] mt-14">
      {/* Statistics section */}
      <div className="flex justify-between items-center bg-white p-6 shadow-md rounded-md mb-6">
        <div className="flex items-center">
          <img
            src="/Group_10.png"
            alt="Operator Icon"
            className="mr-4 h-16 w-16"
          />
          <div className="flex flex-col items-start">
            <div className="text-4xl font-semibold text-green-600">
              {totalEntries}
            </div>
            <div className="text-gray-500">Total Company</div>
          </div>
        </div>
        <div className="flex items-center">
          <img
            src="/Group_11.png"
            alt="Company Icon"
            className="mr-4 h-16 w-16"
          />
          <div className="flex flex-col items-start">
            <div className="text-4xl font-semibold text-gray-800">
              {totalEntries}
            </div>
            <div className="text-gray-500">Companies</div>
          </div>
        </div>
        <div className="flex items-center">
          <img
            src="/Group_12.png"
            alt="Ticket Icon"
            className="mr-4 h-16 w-16"
          />
          <div className="flex flex-col items-start">
            <div className="text-4xl font-semibold text-green-600">189</div>
            <div className="text-gray-500">Active Tickets</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white p-6 shadow-md rounded-md">
        {/* Header and Search */}
        <div className="bg-white p-6 shadow-md rounded-md mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Company Details</h2>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSearchVisible(!searchVisible)}
                className="relative"
              >
                <img src="/search.png" alt="Search" className="w-6 h-6" />
              </button>
              {searchVisible && (
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border rounded-md py-2 px-4"
                />
              )}
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
                onClick={handleAddClick}
              >
                ADD Company
              </button>
            </div>
          </div>

          {showPopup && (
            <div className="popup-overlay-company">
              <div
                className="popup-container-company"
                style={{ marginLeft: "-120px" }}
              >
                <div className="popup-header-company">
                  <h3>
                    {editingCompanyId ? "Edit Company" : "Create Company"}
                  </h3>
                </div>
                <div className="popup-body-company">
                  <div className="title-name-company">
                    <label htmlFor="name">
                      Company Name<span className="required-star">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter company name"
                      value={companyData.name}
                      onChange={handleInputChange}
                    />
                    {errors.name && (
                      <p className="error-message">{errors.name}</p>
                    )}

                    <label htmlFor="gst">
                      Company GST<span className="required-star">*</span>
                    </label>
                    <input
                      id="gst"
                      name="gst"
                      type="text"
                      placeholder="Enter company GST"
                      value={companyData.gst}
                      onChange={handleInputChange}
                    />
                    {errors.gst && (
                      <p className="error-message">{errors.gst}</p>
                    )}
                  </div>
                  {/* PPM and Health Check Side by Side */}
                  <div className="flex space-x-6">
                    {/* PPM Dropdown */}
                    <div className="title-name-company flex-1">
                      <label htmlFor="ppm">PPM</label>
                      <select
                        id="ppm"
                        name="ppm"
                        value={companyData.ppm}
                        onChange={handleInputChange}
                      >
                        <option value="default">Please select</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>

                    {/* Health Check Dropdown */}
                    <div className="title-name-company flex-1 ">
                      <label htmlFor="healthCheck">Health Check</label>
                      <select
                        id="healthCheck"
                        name="healthCheck"
                        value={companyData.healthCheck}
                        onChange={handleInputChange}
                      >
                        <option value="default">Please select</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                  </div>

                  {/* Maintenance Date Picker */}
                  <div className="title-name-company">
                    <label htmlFor="maintenanceStart">
                      Maintenance Start Date
                    </label>
                    <input
                      id="maintenanceStart"
                      name="maintenanceStart"
                      type="date"
                      value={companyData.maintenanceStart}
                      onChange={handleInputChange}
                    />

                    <label htmlFor="maintenanceEnd">Maintenance End Date</label>
                    <input
                      id="maintenanceEnd"
                      name="maintenanceEnd"
                      type="date"
                      value={companyData.maintenanceEnd}
                      onChange={handleInputChange}
                    />
                  </div>
                  {/* New Support Timings Dropdown */}
                  <div className="title-name-company">
                    <label htmlFor="supportTimings">Support Timings</label>
                    <select
                      id="supportTimings"
                      name="supportTimings"
                      value={companyData.supportTimings}
                      onChange={handleInputChange}
                    >
                      <option value="default">Please select</option>
                      <option value="7am - 8pm">7am - 8pm</option>
                      <option value="24*7">24*7</option>
                    </select>
                  </div>

                  <div className="title-name-company">
                    <label htmlFor="website">
                      Website<span className="required-star">*</span>
                    </label>
                    <input
                      id="website"
                      name="website"
                      type="text"
                      placeholder="Enter company website"
                      value={companyData.website}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="address">Company Address</label>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      placeholder="Enter company address"
                      value={companyData.address}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="title-name-company">
                    <label htmlFor="logo">Company Logo</label>
                    <input
                      id="logo"
                      name="logo"
                      type="text"
                      placeholder="Enter company logo URL"
                      value={companyData.logo}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="popup-footer-company">
                  <button className="cancel-button" onClick={handleClosePopup}>
                    Cancel
                  </button>
                  <button className="submit-button" onClick={handleSubmit}>
                    {editingCompanyId ? "Update" : "Submit"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border-b-2 p-4 text-left">Company Name</th>
              <th className="border-b-2 p-4 text-left">GST</th>
              <th className="border-b-2 p-4 text-left">Website</th>
              <th className="border-b-2 p-4 text-left">Address</th>
              <th className="border-b-2 p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCompanies.map((company) => (
              <tr key={company._id}>
                <td className="border-b p-4">{company.name}</td>
                <td className="border-b p-4">{company.gst}</td>
                <td className="border-b p-4">{company.website}</td>
                <td className="border-b p-4">{company.address}</td>
                <td className="border-b p-4">
                  <button
                    onClick={() => handleEditClick(company)}
                    className="mr-2 text-blue-500 hover:text-blue-700"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(company._id)}
                    className="text-red-500 hover:text-red-700 mr-2"
                  >
                    <FaTrash />
                  </button>
                   <button
                      onClick={() => handleOpenEmailPopup(company)} // Email button
                      className="text-green-500 hover:text-green-700"
                    >
                      <FaEnvelope/>

                    </button>
                    
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <div>
          Showing data {startIndex} to {endIndex} of {totalEntries} entries
        </div>

        <div className="flex items-center space-x-2">
          <button
            className="px-4 py-2 border rounded-md"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &lt;
          </button>

          <button
            className="px-4 py-2 text-white rounded-md"
            style={{ backgroundColor: "#5932EA" }}
          >
            {currentPage}
          </button>

          <button
            className="px-4 py-2 border rounded-md"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            &gt;
          </button>
        </div>
      </div>
      {/* Email Popup */}
{isEmailPopupVisible && (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
    <div className="bg-white rounded-lg shadow-xl  max-w-md mx-auto">
      {/* Header */}
      <div className="bg-black text-white p-4 rounded-t-lg flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Add Email for monthly report for {selectedCompany?.name}
        </h3>
        <button 
          onClick={handleCloseEmailPopup}
          className="text-white hover:text-gray-200"
        >
          &times;
        </button>
      </div>

      {/* User Details Section */}
      <div className="p-6">
        <div className="mt-6">
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
                className="border p-2 w-1/2 rounded "
                placeholder="Title"
                disabled={user._id}
              />
              <input
                type="text"
                value={user.name}
                onChange={(e) =>
                  handleUserDetailChange(index, "name", e.target.value)
                }
                className="border p-2 w-1/2 rounded ml-2"
                placeholder="Name"
                disabled={user._id}
              />
              <input
                type="email"
                value={user.email}
                onChange={(e) =>
                  handleUserDetailChange(index, "email", e.target.value)
                }
                className="border p-2 w-1/2 rounded ml-2"
                placeholder="Email"
                disabled={user._id}
              />
              <button
                onClick={() => removeUserDetail(index)}
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

      {/* Footer */}
      <div className="bg-gray-50 p-4 rounded-b-lg flex justify-center space-x-20">
        <button 
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300" 
          onClick={handleCloseEmailPopup}
        >
          Cancel
        </button>
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          onClick={handleSaveMail}
        >
          Submit
        </button>
      </div>
    </div>
  </div>
)}


    </div>
  );
};

export default Company;
