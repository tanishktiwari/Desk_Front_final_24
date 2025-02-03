// IssueCategoryDetails.jsx
import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaSearch, FaTimes } from "react-icons/fa";

// CSS styles
const styles = `
.popup-overlay-issue {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.popup-container-issue {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
}

.popup-header-issue {
  margin-bottom: 20px;
}

.popup-header-issue h3 {
  font-size: 1.5rem;
  font-weight: 600;
}

.popup-body-issue {
  margin-bottom: 20px;
}

.popup-body-issue label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.popup-body-issue input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.popup-footer-issue {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.required-star {
  color: red;
  margin-left: 2px;
}

.cancel-button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
}

.submit-button {
  padding: 8px 16px;
  background: #5932EA;
  color: white;
  border: none;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .popup-container-issue {
    width: 95%;
    margin: 10px;
    padding: 15px;
  }
}
`;

const IssueCategoryDetails = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [issueCategory, setIssueCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchBox, setShowSearchBox] = useState(false);
  const itemsPerPage = 10;

  // Inject CSS
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/issue-categories`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching issue categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleAddClick = () => {
    setShowPopup(true);
    setEditingCategoryId(null);
    setIssueCategory("");
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setEditingCategoryId(null);
    setIssueCategory("");
  };

  const handleInputChange = (e) => {
    setIssueCategory(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSubmit = async () => {
    if (!issueCategory) {
      alert("Issue Category is required");
      return;
    }

    try {
      const method = editingCategoryId ? "PUT" : "POST";
      const url = editingCategoryId
        ? `${import.meta.env.VITE_API_URL}/issue-categories/${editingCategoryId}`
        : `${import.meta.env.VITE_API_URL}/issue-categories`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: issueCategory }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      if (editingCategoryId) {
        setCategories(categories.map((category) =>
          category._id === editingCategoryId ? result : category
        ));
      } else {
        setCategories([...categories, result]);
      }

      setShowPopup(false);
      setIssueCategory("");
    } catch (error) {
      console.error("Error adding or updating issue category:", error);
    }
  };

  const handleEditClick = (category) => {
    setEditingCategoryId(category._id);
    setIssueCategory(category.name);
    setShowPopup(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/issue-categories/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        setCategories(categories.filter((category) => category._id !== id));
      } catch (error) {
        console.error("Error deleting issue category:", error);
      }
    }
  };

  const StatCard = ({ icon, title, value, trend }) => (
    <div className="bg-white p-4 rounded-lg shadow-md w-full">
      <div className="flex items-center space-x-3">
        <img src={icon} alt={title} className="w-12 h-12 md:w-16 md:h-16" />
        <div>
          <div className="text-2xl md:text-4xl font-semibold text-green-600">{value}</div>
          <div className="text-sm md:text-base text-gray-500">{title}</div>
          {trend && <div className="text-xs text-red-500">{trend}</div>}
        </div>
      </div>
    </div>
  );

  const MobileTableCard = ({ category }) => (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <div className="flex justify-between items-center">
        <div className="font-medium">{category.name}</div>
        <div className="flex space-x-3">
          <button
            onClick={() => handleEditClick(category)}
            className="text-blue-500 hover:text-blue-700"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => handleDeleteClick(category._id)}
            className="text-red-500 hover:text-red-700"
          >
            <FaTrash />
          </button>
        </div>
      </div>
    </div>
  );

  // Filter and pagination logic
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalEntries = filteredCategories.length;
  const totalPages = Math.ceil(totalEntries / itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto p-2 md:p-4 md:ml-[12%] mt-4 md:mt-20 2xl:pl-[10%] 2xl:pt-20 lg:pl-[15%] lg:pt-20 sm:mt-20 xs:mt-20  ">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          icon="/Group_10.png"
          title="Total Issue Categories"
          value={totalEntries}
        />
        <StatCard
          icon="/Group_11.png"
          title="Companies"
          value={totalEntries}
        />
        <StatCard
          icon="/Group_12.png"
          title="Active Tickets"
          value="189"
        />
      </div>

      {/* Main Content */}
      <div className="bg-white p-4 md:p-6 shadow-md rounded-md">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
          <h2 className="text-xl md:text-2xl font-semibold">Company Details</h2>
          
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto">
            <div className="relative w-full md:w-auto">
              {showSearchBox && (
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full md:w-auto border rounded-md py-2 px-4 pr-10"
                />
              )}
              <button
                onClick={() => setShowSearchBox(!showSearchBox)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                {showSearchBox ? <FaTimes /> : <FaSearch />}
              </button>
            </div>
            
            <button
              className="w-full md:w-auto bg-blue-500 text-white px-4 py-2 rounded-md"
              onClick={handleAddClick}
            >
              ADD Category
            </button>
          </div>
        </div>

        {/* Table/Cards */}
        <div className="hidden md:block">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b-2 p-4 text-left">Issue - Category Name</th>
                <th className="border-b-2 p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCategories.map((category) => (
                <tr key={category._id}>
                  <td className="border-b p-4">{category.name}</td>
                  <td className="border-b p-4">
                    <button
                      onClick={() => handleEditClick(category)}
                      className="mr-2 text-blue-500 hover:text-blue-700"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(category._id)}
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

        {/* Mobile Cards */}
        <div className="md:hidden">
          {paginatedCategories.map((category) => (
            <MobileTableCard key={category._id} category={category} />
          ))}
        </div>

        {/* Pagination */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-6 space-y-4 md:space-y-0">
          <div className="text-sm text-center md:text-left">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalEntries)} of {totalEntries} entries
          </div>

          <div className="flex items-center space-x-2">
            <button
              className="px-3 py-1 md:px-4 md:py-2 border rounded-md"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &lt;
            </button>

            <button
              className="px-3 py-1 md:px-4 md:py-2 text-white rounded-md"
              style={{ backgroundColor: "#5932EA" }}
            >
              {currentPage}
            </button>

            <button
              className="px-3 py-1 md:px-4 md:py-2 border rounded-md"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">
                {editingCategoryId ? "Edit Issue Category" : "Create Issue Category"}
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Issue Category<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter your category issue"
                  value={issueCategory}
                  onChange={handleInputChange}
                  className="w-full border rounded-md p-2"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  className="px-4 py-2 border rounded-md"
                  onClick={handleClosePopup}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded-md"
                  onClick={handleSubmit}
                >
                  {editingCategoryId ? "Update" : "Add"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueCategoryDetails;