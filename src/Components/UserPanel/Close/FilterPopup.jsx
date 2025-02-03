import React, { useState, useEffect } from "react";
import "./FilterPopup.css"; // Your CSS for the pop-up styles
import axios from "axios"; // You'll use axios to make API requests

const FilterPopup = ({ closePopup, onApplyFilters }) => {
  const [category, setCategory] = useState("all"); // For the issue category filter
  const [fromDate, setFromDate] = useState(""); // For the start date (From Date)
  const [toDate, setToDate] = useState(""); // For the end date (To Date)
  const [selectedEta, setSelectedEta] = useState("all"); // For ETA filter
  const [categories, setCategories] = useState([]); // Holds the available categories
  const [loading, setLoading] = useState(true); // Loading state to show loading indicator
  const [error, setError] = useState(null); // To display errors, if any

  // Fetch categories from the API when the component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true); // Set loading to true before fetching
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/issue-categories`
        );

        console.log("Fetched Categories Response:", response.data);

        // Ensure the response is an array before setting the state
        if (Array.isArray(response.data)) {
          setCategories(response.data); // Set fetched categories
        } else {
          setError(
            "Unexpected response format: Categories data is not an array."
          );
        }
      } catch (error) {
        console.error("Error fetching issue categories:", error);
        setError("Failed to load categories.");
      } finally {
        setLoading(false); // Set loading to false after fetching completes
      }
    };

    fetchCategories(); // Call the function to fetch categories
  }, []); // Empty dependency array ensures this runs only once on mount

  // Handle the application of filters
  const handleApplyFilters = () => {
    if (typeof onApplyFilters === "function") {
      // Pass category, fromDate, toDate, and selectedEta to the parent
      onApplyFilters({ category, fromDate, toDate, selectedEta });
      closePopup(); // Close popup after applying filters
    } else {
      console.error("onApplyFilters is not a function");
    }
  };

  return (
    <div className="filter-popup-overlay">
  <div className="filter-popup rounded-xl">
    {/* Image at the top */}
    <div className="header-container bg-black mt-0 justify-between rounded-t-xl">
      <div className="logo-container">
        <img
          src="/logo.png" // Replace with your image URL
          alt="Header Logo"
          className="header-image h-12 w-auto"
        />
      </div>
      <div className="filter-title-container text-center flex-grow">
        <h3 className="filter-title text-white text-3xl">Filters</h3>
      </div>
      <button className="close-btn text-5xl text-gray-600 relative -top-6 left-2" onClick={closePopup}>
        &times;
      </button>
    </div>

    <div className="filter-content ml-10 pr-10 ">
      {/* Issue Category Filter */}
      <div className="filter-option font-poppins">
        <label>Issue Category:</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All</option>

          {loading ? (
            <option>Loading categories...</option> // Show loading message
          ) : error ? (
            <option>{error}</option> // Show error message if there's an error
          ) : categories.length > 0 ? (
            categories.map((cat) => (
              <option key={cat._id} value={cat.name}>
                {cat.name} {/* Display the category name */}
              </option>
            ))
          ) : (
            <option>No categories available</option> // Show message if no categories are available
          )}
        </select>
      </div>

      {/* Date Range Filter (From and To Date) */}
      <div className="filter-option font-poppins">
        <label>Choose a Date Range:</label>
        <div className="date-range">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            placeholder="From"
          />
          <span>to</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            placeholder="To"
          />
        </div>
      </div>

      {/* ETA (Days) Filter */}
      <div className="filter-option font-poppins">
        <label>ETA (Days):</label>
        <select value={selectedEta} onChange={(e) => setSelectedEta(e.target.value)}>
          <option value="all">All</option>
          <option value="0-2">0-2 Days</option>
          <option value="2-4">2-4 Days</option>
          <option value="4+">4+ Days</option>
        </select>
      </div>
    </div>

    {/* Footer with Apply Button */}
    <div className="filter-footer font-poppins ml-10 mr-10 mb-10">
      <button className="apply-btn bg-custom-gradient" onClick={handleApplyFilters}>
        Apply Filters
      </button>
    </div>
  </div>
</div>


  );
};

export default FilterPopup;
