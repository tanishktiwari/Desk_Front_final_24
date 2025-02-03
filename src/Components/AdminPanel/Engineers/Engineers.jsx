import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import "../Engineers/Engineers.css";

const Engineers = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [engineerData, setEngineerData] = useState({
    name: "",
    title: "",
    email: "",
    mobile: "",
    contractType: "",
    managerName: "",
  });
  const [engineers, setEngineers] = useState([]);
  const [editingEngineerId, setEditingEngineerId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [errors, setErrors] = useState({
    name: "",
    title: "",
    email: "",
    mobile: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [searchVisible, setSearchVisible] = useState(false);
  
  // New variable to store company count from localStorage
  const companyCount = localStorage.getItem("totalCompanyCount") || "0";

  const fetchEngineers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/engineers`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setEngineers(data);
    } catch (error) {
      console.error("Error fetching engineers:", error);
    }
  };

  useEffect(() => {
    fetchEngineers();
  }, []);

  const filteredEngineers = engineers.filter((engineer) => {
    const searchValue = searchTerm.toLowerCase();
    return (
      (engineer.title && engineer.title.toLowerCase().includes(searchValue)) ||
      (engineer.name && engineer.name.toLowerCase().includes(searchValue)) ||
      (engineer.email && engineer.email.toLowerCase().includes(searchValue)) ||
      (engineer.mobile && engineer.mobile.toLowerCase().includes(searchValue)) ||
      (engineer.contractType && engineer.contractType.toLowerCase().includes(searchValue)) ||
      (engineer.managerName && engineer.managerName.toLowerCase().includes(searchValue))
    );
  });

  const totalEntries = filteredEngineers.length;
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalEntries);
  const paginatedEngineers = filteredEngineers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredEngineers.length / itemsPerPage);

  const handleAddClick = () => {
    setShowPopup(true);
    setEditingEngineerId(null);
    setEngineerData({
      name: "",
      title: "",
      email: "",
      mobile: "",
      contractType: "",
      managerName: "",
    });
    setErrors({ name: "", title: "", email: "", mobile: "" });
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setEditingEngineerId(null);
    setEngineerData({
      name: "",
      title: "",
      email: "",
      mobile: "",
      contractType: "",
      managerName: "",
    });
    setErrors({ name: "", title: "", email: "", mobile: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEngineerData({ ...engineerData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validateFields = () => {
    let isValid = true;
    const newErrors = { name: "", title: "", email: "", mobile: "" };

    if (!engineerData.name) {
      newErrors.name = "Engineer Name is required";
      isValid = false;
    }

    if (!engineerData.title) {
      newErrors.title = "Title is required";
      isValid = false;
    }

    if (!engineerData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    }

    if (!engineerData.mobile) {
      newErrors.mobile = "Mobile is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateFields()) {
      return;
    }

    const { name, title, email, mobile, contractType, managerName } = engineerData;

    try {
      const method = editingEngineerId ? "PUT" : "POST";
      const url = editingEngineerId
        ? `${import.meta.env.VITE_API_URL}/engineers/${editingEngineerId}`
        : `${import.meta.env.VITE_API_URL}/engineers`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          title,
          email,
          mobile,
          contractType,
          managerName,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      fetchEngineers();
      setShowPopup(false);
      setEngineerData({
        name: "",
        title: "",
        email: "",
        mobile: "",
        contractType: "",
        managerName: "",
      });
    } catch (error) {
      console.error("Error adding or updating engineer:", error);
    }
  };

  const handleEditClick = (engineer) => {
    setEditingEngineerId(engineer._id);
    setEngineerData({
      name: engineer.name,
      title: engineer.title,
      email: engineer.email,
      mobile: engineer.mobile,
      contractType: engineer.contractType,
      managerName: engineer.managerName,
    });
    setShowPopup(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this engineer?")) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/engineers/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        fetchEngineers();
      } catch (error) {
        console.error("Error deleting engineer:", error);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 ml-[12%] mt-14">
      {/* Statistics section */}
      <div className="flex justify-between items-center bg-white p-6 shadow-md rounded-md mb-6">
        <div className="flex items-center">
          <img src="/Group_10.png" alt="Operator Icon" className="mr-4 h-16 w-16" />
          <div className="flex flex-col items-start">
            <div className="text-4xl font-semibold text-green-600">{totalEntries}</div>
            <div className="text-gray-500">Total Engineer</div>
          </div>
        </div>

        <div className="flex items-center">
          <img src="/Group_11.png" alt="Company Icon" className="mr-4 h-16 w-16" />
          <div className="flex flex-col items-start">
            <div className="text-4xl font-semibold text-gray-800">{companyCount}</div>
            <div className="text-gray-500">Companies</div>
            <div className="text-sm text-red-500">↓ 1% this month</div>
          </div>
        </div>

        <div className="flex items-center">
          <img src="/Group_12.png" alt="Ticket Icon" className="mr-4 h-16 w-16" />
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
            <h2 className="text-2xl font-semibold">Engineer Details</h2>
            <div className="flex items-center gap-4">
              <button onClick={() => setSearchVisible(!searchVisible)} className="relative">
                <img src='/search.png' alt="Search" className="w-6 h-6" />
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
                ADD Engineer
              </button>
            </div>
          </div>

          {showPopup && (
            <div className="popup-overlay-engineers">
              <div className="popup-container-engineers">
                <div className="popup-header-engineers">
                  <h3>{editingEngineerId ? "Edit Engineer" : "Create Engineer"}</h3>
                </div>
                <div className="popup-body-engineers">
                  <div className="title-name">
                    <label htmlFor="title">
                      Title<span className="required-star">*</span>
                    </label>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      placeholder="Enter title"
                      value={engineerData.title}
                      onChange={handleInputChange}
                    />
                    {errors.title && (
                      <p className="error-message">{errors.title}</p>
                    )}

                    <label htmlFor="name">
                      Engineer Name<span className="required-star">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter engineer name"
                      value={engineerData.name}
                      onChange={handleInputChange}
                    />
                    {errors.name && <p className="error-message">{errors.name}</p>}
                  </div>
                  <div className="title-name">
                    <label htmlFor="email">
                      Email<span className="required-star">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter email"
                      value={engineerData.email}
                      onChange={handleInputChange}
                    />
                    {errors.email && (
                      <p className="error-message">{errors.email}</p>
                    )}

                    <label htmlFor="mobile">
                      Mobile<span className="required-star">*</span>
                    </label>
                    <input
                      id="mobile"
                      name="mobile"
                      type="text"
                      placeholder="Enter mobile number"
                      value={engineerData.mobile}
                      onChange={handleInputChange}
                    />
                    {errors.mobile && (
                      <p className="error-message">{errors.mobile}</p>
                    )}
                  </div>
                  <div className="title-name">
                    <label htmlFor="contractType">Contract Type</label>
                    <input
                      id="contractType"
                      name="contractType"
                      type="text"
                      placeholder="Enter contract type"
                      value={engineerData.contractType}
                      onChange={handleInputChange}
                    />

                    <label htmlFor="managerName">Manager Name</label>
                    <input
                      id="managerName"
                      name="managerName"
                      type="text"
                      placeholder="Enter manager name"
                      value={engineerData.managerName}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="popup-footer-engineers">
                  <button className="cancel-button" onClick={handleClosePopup}>
                    Cancel
                  </button>
                  <button className="submit-button" onClick={handleSubmit}>
                    {editingEngineerId ? "Update" : "Submit"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border-b-2 p-4 text-left">Engineer Name</th>
              <th className="border-b-2 p-4 text-left">Email</th>
              <th className="border-b-2 p-4 text-left">Mobile</th>
              <th className="border-b-2 p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEngineers.map((engineer) => (
              <tr key={engineer._id}>
                <td className="border-b p-4">{engineer.name}</td>
                <td className="border-b p-4">{engineer.email}</td>
                <td className="border-b p-4">{engineer.mobile}</td>
                <td className="border-b p-4">
                  <button
                    onClick={() => handleEditClick(engineer)}
                    className="mr-2 text-blue-500 hover:text-blue-700"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(engineer._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
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
            style={{ backgroundColor: '#5932EA' }}
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
    </div>
  );
};

export default Engineers;
