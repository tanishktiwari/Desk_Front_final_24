import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaEnvelope, FaPhone, FaBuilding, FaBriefcase } from "react-icons/fa";

const Operator = () => {
  // ... Keep all existing state and functions the same ...
    const [showPopup, setShowPopup] = useState(false);
  const [operatorName, setOperatorName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [contractType, setContractType] = useState("");
  const [managerName, setManagerName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [title, setTitle] = useState("");
  const [operators, setOperators] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [editingOperatorId, setEditingOperatorId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchVisible, setSearchVisible] = useState(false); // Added this line
  const itemsPerPage = 10;
  const companyCount = localStorage.getItem("totalCompanyCount") || "0";

  // Fetch all operators and companies on component mount
  useEffect(() => {
    const fetchOperators = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/operators`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setOperators(data);
      } catch (error) {
        console.error("Error fetching operators:", error);
      }
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

    fetchOperators();
    fetchCompanies();
  }, []);

  const handleAddClick = () => {
    setShowPopup(true);
    setEditingOperatorId(null);
    setOperatorName("");
    setEmail("");
    setMobile("");
    setContractType("");
    setManagerName("");
    setCompanyName(""); // Reset companyName for new entry
    setTitle("");
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setEditingOperatorId(null);
    setOperatorName("");
    setEmail("");
    setMobile("");
    setContractType("");
    setManagerName("");
    setCompanyName(""); // Reset companyName
    setTitle("");
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    switch (id) {
      case "operator-name":
        setOperatorName(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "mobile":
        setMobile(value);
        break;
      case "contract-type":
        setContractType(value);
        break;
      case "manager-name":
        setManagerName(value);
        break;
      case "company-name":
        setCompanyName(value);
        break;
      case "title-box":
        setTitle(value);
        break;
      default:
        break;
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleSubmit = async () => {
    if (!operatorName || !email || !companyName || !title) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const method = editingOperatorId ? "PUT" : "POST";
      const url = editingOperatorId
        ? `${import.meta.env.VITE_API_URL}/operators/${editingOperatorId}`
        : `${import.meta.env.VITE_API_URL}/operators`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          operatorName,
          email,
          companyName,
          mobile,
          contractType,
          managerName,
          title,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();

      if (editingOperatorId) {
        setOperators(
          operators.map((operator) =>
            operator._id === editingOperatorId ? result : operator
          )
        );
      } else {
        setOperators([...operators, result]);

        // Send email to the new operator
        await sendNewUserEmail(email, operatorName);
      }

      setShowPopup(false);
      setOperatorName("");
      setEmail("");
      setMobile("");
      setContractType("");
      setManagerName("");
      setCompanyName("");
      setTitle("");
    } catch (error) {
      console.error("Error adding or updating operator:", error);
    }
  };

  // Function to send the new user email
  const sendNewUserEmail = async (recipientEmail, firstName) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/send-new-user-mail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientEmail,
          firstName,
        }),
      });

      if (!response.ok) {
        throw new Error("Error sending email");
      }

      await response.json();
      alert("New user email sent successfully.");
    } catch (error) {
      console.error("Error sending new user email:", error);
      alert("Failed to send email.");
    }
  };

  const handleEditClick = (operator) => {
    setEditingOperatorId(operator._id);
    setOperatorName(operator.operatorName);
    setEmail(operator.email);
    setMobile(operator.mobile);
    setContractType(operator.contractType);
    setManagerName(operator.managerName);
    setCompanyName(operator.companyName); // Set the companyName
    setTitle(operator.title);
    setShowPopup(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this operator?")) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/operators/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        setOperators(operators.filter((operator) => operator._id !== id));
      } catch (error) {
        console.error("Error deleting operator:", error);
      }
    }
  };

  // Search functionality across multiple fields
  const filteredOperators = operators.filter((operator) => {
    const search = searchTerm.toLowerCase();
    return (
      operator.title.toLowerCase().includes(search) ||
      operator.operatorName.toLowerCase().includes(search) ||
      operator.email.toLowerCase().includes(search) ||
      operator.companyName.toLowerCase().includes(search) ||
      operator.mobile.toLowerCase().includes(search) ||
      operator.contractType.toLowerCase().includes(search) ||
      operator.managerName.toLowerCase().includes(search)
    );
  });

  // Pagination logic
  const paginatedOperators = filteredOperators.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalEntries = filteredOperators.length; // Move this here
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalEntries);
  // const paginatedOperators = filteredOperators.slice(
  //   (currentPage - 1) * itemsPerPage,
  //   currentPage * itemsPerPage
  // );
  const totalPages = Math.ceil(totalEntries / itemsPerPage);
  return (
    <div className="max-w-7xl mx-auto p-2 md:p-4 md:ml-[12%] mt-4 md:mt-20 2xl:pl-[10%] 2xl:pt-20 lg:pl-[15%] lg:pt-20 sm:mt-20 xs:mt-20">
      {/* Statistics section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-3 md:p-6 shadow-md rounded-md mb-4 md:mb-6">
        <div className="flex items-center justify-center md:justify-start p-4 bg-gray-50 rounded-lg">
          <img src="/Group_10.png" alt="Operator Icon" className="mr-2 md:mr-4 h-12 w-12 md:h-16 md:w-16" />
          <div className="flex flex-col">
            <div className="text-2xl md:text-4xl font-semibold text-green-600">{totalEntries}</div>
            <div className="text-sm md:text-base text-gray-500">Total Operators</div>
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
      <div className="bg-white p-3 md:p-6 shadow-md rounded-md">
        {/* Header and Search */}
        <div className="bg-white p-3 md:p-6 shadow-md rounded-md mb-4 md:mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-xl md:text-2xl font-semibold">Ticket Owner Details</h2>
            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              <button onClick={() => setSearchVisible(!searchVisible)} className="relative">
                <img src="/search.png" alt="Search" className="w-6 h-6" />
              </button>
              {searchVisible && (
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border rounded-md py-1 md:py-2 px-2 md:px-4 w-full md:w-auto"
                />
              )}
              <button
                className="bg-blue-500 text-white px-3 md:px-4 py-1 md:py-2 rounded-md text-sm md:text-base w-full md:w-auto"
                onClick={handleAddClick}
              >
                ADD TICKET OWNER
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Table (hidden on mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b-2 p-4 text-left">Operator Name</th>
                <th className="border-b-2 p-4 text-left">Email</th>
                <th className="border-b-2 p-4 text-left">Company Name</th>
                <th className="border-b-2 p-4 text-left">Mobile</th>
                <th className="border-b-2 p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOperators.map((operator) => (
                <tr key={operator._id}>
                  <td className="border-b p-4">{operator.operatorName}</td>
                  <td className="border-b p-4">{operator.email}</td>
                  <td className="border-b p-4">{operator.companyName}</td>
                  <td className="border-b p-4">{operator.mobile}</td>
                  <td className="border-b p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClick(operator)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(operator._id)}
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
          {paginatedOperators.map((operator) => (
            <div key={operator._id} className="bg-gray-50 p-4 rounded-lg shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{operator.operatorName}</h3>
                  {operator.title && (
                    <p className="text-gray-600 text-sm">{operator.title}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditClick(operator)}
                    className="text-blue-500 hover:text-blue-700 p-2"
                  >
                    <FaEdit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(operator._id)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <FaTrash size={18} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <FaEnvelope className="text-gray-400" />
                  <span className="text-sm">{operator.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FaBuilding className="text-gray-400" />
                  <span className="text-sm">{operator.companyName}</span>
                </div>
                {operator.mobile && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaPhone className="text-gray-400" />
                    <span className="text-sm">{operator.mobile}</span>
                  </div>
                )}
                {operator.contractType && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaBriefcase className="text-gray-400" />
                    <span className="text-sm">Contract: {operator.contractType}</span>
                  </div>
                )}
                {operator.managerName && (
                  <div className="text-sm text-gray-600 mt-2">
                    <span className="font-medium">Manager: </span>
                    {operator.managerName}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Responsive pagination */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-4 md:mt-6 gap-2 text-sm md:text-base">
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

      {/* Modal Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">
                {editingOperatorId ? "Edit Ticket Owner" : "Create Ticket Owner"}
              </h3>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    id="title-box"
                    type="text"
                    placeholder="Enter title"
                    value={title}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Operator Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    id="operator-name"
                    type="text"
                    placeholder="Enter operator name"
                    value={operatorName}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email<span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Mobile</label>
                  <input
                    id="mobile"
                    type="text"
                    placeholder="Enter mobile number"
                    value={mobile}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Contract Type</label>
                  <input
                    id="contract-type"
                    type="text"
                    placeholder="Enter contract type"
                    value={contractType}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Manager Name</label>
                  <input
                    id="manager-name"
                    type="text"
                    placeholder="Enter manager name"
                    value={managerName}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Company Name<span className="text-red-500">*</span>
                  </label>
                  <select
                    id="company-name"
                    value={companyName}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select a company</option>
                    {companies.map((company) => (
                      <option key={company._id} value={company.name}>
                        {company.name}
                      </option>
                    ))}
                  </select>
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
                {editingOperatorId ? "Update" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Operator;