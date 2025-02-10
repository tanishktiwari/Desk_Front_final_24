import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaEnvelope, FaPhone } from "react-icons/fa";

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
  const [searchCategory, setSearchCategory] = useState("all"); // New state for search category
  const [searchVisible, setSearchVisible] = useState(false);
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

  // Modified search logic to handle category-based filtering
  const filteredEngineers = engineers.filter((engineer) => {
    const searchValue = searchTerm.toLowerCase();
    
    switch (searchCategory) {
      case "name":
        return engineer.name && engineer.name.toLowerCase().includes(searchValue);
      case "email":
        return engineer.email && engineer.email.toLowerCase().includes(searchValue);
      case "mobile":
        return engineer.mobile && engineer.mobile.toLowerCase().includes(searchValue);
      case "title":
        return engineer.title && engineer.title.toLowerCase().includes(searchValue);
      case "all":
      default:
        return (
          (engineer.title && engineer.title.toLowerCase().includes(searchValue)) ||
          (engineer.name && engineer.name.toLowerCase().includes(searchValue)) ||
          (engineer.email && engineer.email.toLowerCase().includes(searchValue)) ||
          (engineer.mobile && engineer.mobile.toLowerCase().includes(searchValue)) ||
          (engineer.contractType && engineer.contractType.toLowerCase().includes(searchValue)) ||
          (engineer.managerName && engineer.managerName.toLowerCase().includes(searchValue))
        );
    }
  });

  const totalEntries = filteredEngineers.length;
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalEntries);
  const paginatedEngineers = filteredEngineers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredEngineers.length / itemsPerPage);

  // Rest of the handlers remain the same
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
    <div className="flex flex-col mt-20 ml-32 h-full w-[88%] xl:pl-[10%] 2xl:pl-[10%] lg:pl-[15%] font-poppins">
      {/* Statistics section */}
      <div className="flex justify-between items-center bg-white p-6 shadow-md rounded-md mb-6">
        <div className="flex items-center justify-center md:justify-start p-4 bg-gray-50 rounded-lg">
          <img src="/Group_10.png" alt="Operator Icon" className="mr-2 md:mr-4 h-12 w-12 md:h-16 md:w-16" />
          <div className="flex flex-col">
            <div className="text-2xl md:text-4xl font-semibold text-green-600">{totalEntries}</div>
            <div className="text-sm md:text-base text-gray-500">Total Engineer</div>
          </div>
        </div>

        <div className="flex items-center justify-center md:justify-start p-4 bg-gray-50 rounded-lg">
          <img src="/Group_11.png" alt="Company Icon" className="mr-2 md:mr-4 h-12 w-12 md:h-16 md:w-16" />
          <div className="flex flex-col">
            <div className="text-2xl md:text-4xl font-semibold text-gray-800">{companyCount}</div>
            <div className="text-sm md:text-base text-gray-500">Companies</div>
            <div className="text-xs md:text-sm text-red-500">↓ 1% this month</div>
          </div>
        </div>

        <div className="flex items-center justify-center md:justify-start p-4 bg-gray-50 rounded-lg">
          <img src="/Group_12.png" alt="Ticket Icon" className="mr-2 md:mr-4 h-12 w-12 md:h-16 md:w-16" />
          <div className="flex flex-col">
            <div className="text-2xl md:text-4xl font-semibold text-green-600">189</div>
            <div className="text-sm md:text-base text-gray-500">Active Tickets</div>
          </div>
        </div>
      </div>

      {/* Main content section */}
      <div className="bg-white p-6 shadow-md rounded-md">
        {/* Header and Search */}
        <div className="bg-white p-3 md:p-6 shadow-md rounded-md mb-4 md:mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-xl md:text-2xl font-semibold">Engineer Details</h2>
            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              <button onClick={() => setSearchVisible(!searchVisible)} className="relative">
                <img src='/search.png' alt="Search" className="w-6 h-6" />
              </button>
              {searchVisible && (
                <div className="flex gap-2">
                  <select
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    className="border rounded-md py-1 md:py-2 px-2 md:px-4"
                  >
                    <option value="all">All</option>
                    <option value="name">Name</option>
                    <option value="email">Email</option>
                    <option value="mobile">Mobile</option>
                    <option value="title">Title</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border rounded-md py-1 md:py-2 px-2 md:px-4 w-full md:w-auto"
                  />
                </div>
              )}
              <button
                className="bg-buttoncolor text-white px-3 md:px-4 py-1 md:py-2 rounded-md text-sm md:text-base w-full md:w-auto"
                onClick={handleAddClick}
              >
                ADD Engineer
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b-2 p-2 md:p-4 text-left">Engineer Name</th>
                <th className="border-b-2 p-2 md:p-4 text-left">Email</th>
                <th className="border-b-2 p-2 md:p-4 text-left">Mobile</th>
                <th className="border-b-2 p-2 md:p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEngineers.map((engineer) => (
                <tr key={engineer._id}>
                  <td className="border-b p-2 md:p-4">{engineer.name}</td>
                  <td className="border-b p-2 md:p-4">{engineer.email}</td>
                  <td className="border-b p-2 md:p-4">{engineer.mobile}</td>
                  <td className="border-b p-2 md:p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClick(engineer)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(engineer._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      {/* Mobile Cards (hidden on desktop) */}
        <div className="md:hidden grid grid-cols-1 gap-4">
          {paginatedEngineers.map((engineer) => (
            <div key={engineer._id} className="bg-gray-50 p-4 rounded-lg shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{engineer.name}</h3>
                  {engineer.title && (
                    <p className="text-gray-600 text-sm">{engineer.title}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditClick(engineer)}
                    className="text-blue-500 hover:text-blue-700 p-2"
                  >
                    <FaEdit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(engineer._id)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <FaTrash size={18} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <FaEnvelope className="text-gray-400" />
                  <span className="text-sm">{engineer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FaPhone className="text-gray-400" />
                  <span className="text-sm">{engineer.mobile}</span>
                </div>
                {engineer.contractType && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Contract: </span>
                    {engineer.contractType}
                  </div>
                )}
                {engineer.managerName && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Manager: </span>
                    {engineer.managerName}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Responsive pagination */}
      <div className="flex justify-between items-center mt-6">
        <div className="text-center md:text-left">
          Showing data {startIndex} to {endIndex} of {totalEntries} entries
        </div>

        <div className="flex items-center space-x-2">
          <button
            className="px-3 md:px-4 py-1 md:py-2 border rounded-md"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &lt;
          </button>

          <button
            className="px-3 md:px-4 py-1 md:py-2 text-white rounded-md"
            style={{ backgroundColor: '#5932EA' }}
          >
            {currentPage}
          </button>

          <button
            className="px-3 md:px-4 py-1 md:py-2 border rounded-md"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            &gt;
          </button>
        </div>
      </div>

      {/* Keep the existing popup component */}
      {/* ... */}
	   {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">
                {editingEngineerId ? "Edit Engineer" : "Create Engineer"}
              </h3>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Title<span className="text-red-500">*</span>
                  </label>
                  <input
                    name="title"
                    type="text"
                    placeholder="Enter title"
                    value={engineerData.title}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Engineer Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    type="text"
                    placeholder="Enter engineer name"
                    value={engineerData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email<span className="text-red-500">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    placeholder="Enter email"
                    value={engineerData.email}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Mobile<span className="text-red-500">*</span>
                  </label>
                  <input
                    name="mobile"
                    type="text"
                    placeholder="Enter mobile number"
                    value={engineerData.mobile}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                  {errors.mobile && (
                    <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Contract Type
                  </label>
                  <input
                    name="contractType"
                    type="text"
                    placeholder="Enter contract type"
                    value={engineerData.contractType}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Manager Name
                  </label>
                  <input
                    name="managerName"
                    type="text"
                    placeholder="Enter manager name"
                    value={engineerData.managerName}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t flex justify-end gap-2">
              <button
                className="px-4 py-2 border rounded-md text-gray-600"
                onClick={handleClosePopup}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
                onClick={handleSubmit}
              >
                {editingEngineerId ? "Update" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Engineers;