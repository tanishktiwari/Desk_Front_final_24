import React, { useState, useEffect } from "react";
import axios from "axios";
import generateServiceTicketOpenAdminPDF from "./pdfGeneratoropenadmin";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import TicketDetailsModal from "./TicketDetailsModal";

const OpenticketAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [initialsMap, setInitialsMap] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchBoxVisible, setIsSearchBoxVisible] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState(new Set());
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [etaData, setEtaData] = useState({});
  const [sortOrder, setSortOrder] = useState("none");
  const navigate = useNavigate();
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [copiedTicketNos, setCopiedTicketNos] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [uniqueNames, setUniqueNames] = useState([]);
  const [uniqueCompanyNames, setUniqueCompanyNames] = useState([]);
  // New state variables for advanced filtering
  const [displayedTickets, setDisplayedTickets] = useState([]);
  const [filterCriteria, setFilterCriteria] = useState({
    ticketNo: "",
    name: "",
    companyName: "",
    issueCategory: "",
    date: "",
    time: "",
    status: "",
  });
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [uniqueIssueCategories, setUniqueIssueCategories] = useState([]);
  const [uniqueStatuses, setUniqueStatuses] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  const formatDate = (date) => {
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return date.toLocaleDateString("en-GB", options);
  };

  // Fetch tickets from the API when the component mounts
  // Fetch tickets from the API when the component mounts
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/tickets/open`
        );

        const sortedTickets = response.data.sort((a, b) => {
          const aDateTime =
            new Date(`${a.date.split("T")[0]}T${a.time}`).getTime() || 0;
          const bDateTime =
            new Date(`${b.date.split("T")[0]}T${b.time}`).getTime() || 0;
          return bDateTime - aDateTime;
        });

        // Extract unique issue categories and statuses for filters
        const categories = [
          ...new Set(
            sortedTickets.map((ticket) => ticket.issueCategory).filter(Boolean)
          ),
        ];
        const statuses = [
          ...new Set(
            sortedTickets.map((ticket) => ticket.status).filter(Boolean)
          ),
        ];
        const names = [
          ...new Set(
            sortedTickets.map((ticket) => ticket.name).filter(Boolean)
          ),
        ];
        const companyNames = [
          ...new Set(
            sortedTickets.map((ticket) => ticket.companyName).filter(Boolean)
          ),
        ];

        setUniqueIssueCategories(categories);
        setUniqueStatuses(statuses);
        setUniqueNames(names);
        setUniqueCompanyNames(companyNames);
        setTickets(sortedTickets);
        setDisplayedTickets(sortedTickets);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch tickets:", error);
        setError("Failed to fetch tickets. Please try again later.");
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // Clipboard copy function
  const copyToClipboard = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setCopiedTicketNos((prev) => ({ ...prev, [text]: true }));
          // alert("Ticket number copied to clipboard!");

          setTimeout(() => {
            setCopiedTicketNos((prev) => ({ ...prev, [text]: false }));
          }, 500);
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
          setCopiedTicketNos((prev) => ({ ...prev, [text]: true }));
          alert("Ticket number copied to clipboard!");
          setTimeout(() => {
            setCopiedTicketNos((prev) => ({ ...prev, [text]: false }));
          }, 2000);
          console.log("Text copied successfully using execCommand");
        } else {
          console.error("Failed to copy text using execCommand");
        }
      } catch (err) {
        console.error("Error copying text: ", err);
      } finally {
        document.body.removeChild(textArea);
      }
    }
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
  };

  // Enhanced search function
  const handleSearch = (event) => {
    const searchTerm = event.target.value.toLowerCase().trim();
    setSearchQuery(searchTerm);
    setCurrentPage(1);

    if (!searchTerm) {
      applyFilters();
      return;
    }

    const filtered = tickets.filter((ticket) => {
      const searchableFields = {
        ticketNo: ticket.ticketNo?.toString().toLowerCase() || "",
        name: ticket.name?.toLowerCase() || "",
        companyName: ticket.companyName?.toLowerCase() || "",
        issueCategory: ticket.issueCategory?.toLowerCase() || "",
        date: formatDate(new Date(ticket.date))?.toLowerCase() || "",
        time: ticket.time?.toLowerCase() || "",
        status: ticket.status?.toLowerCase() || "",
      };

      return Object.values(searchableFields).some((value) =>
        value.includes(searchTerm)
      );
    });

    setDisplayedTickets(filtered);
  };

  // Advanced filtering
  const handleFilterChange = (field, value) => {
    setFilterCriteria((prev) => ({
      ...prev,
      [field]: value,
    }));
    setCurrentPage(1);
  };

  const applyFilters = () => {
    let filteredResults = [...tickets];

    // Apply filters for each field
    if (filterCriteria.ticketNo) {
      filteredResults = filteredResults.filter((ticket) =>
        ticket.ticketNo
          ?.toString()
          .toLowerCase()
          .includes(filterCriteria.ticketNo.toLowerCase())
      );
    }

    if (filterCriteria.name) {
      filteredResults = filteredResults.filter((ticket) =>
        ticket.name?.toLowerCase().includes(filterCriteria.name.toLowerCase())
      );
    }

    if (filterCriteria.companyName) {
      filteredResults = filteredResults.filter((ticket) =>
        ticket.companyName
          ?.toLowerCase()
          .includes(filterCriteria.companyName.toLowerCase())
      );
    }

    // Updated multiple category filtering
    if (selectedCategories.length > 0) {
      filteredResults = filteredResults.filter((ticket) =>
        selectedCategories.includes(ticket.issueCategory)
      );
    }

    // Date range filtering
    if (dateRange.from || dateRange.to) {
      filteredResults = filteredResults.filter((ticket) => {
        const ticketDate = new Date(ticket.date).toISOString().split("T")[0];
        if (dateRange.from && dateRange.to) {
          return ticketDate >= dateRange.from && ticketDate <= dateRange.to;
        } else if (dateRange.from) {
          return ticketDate >= dateRange.from;
        } else if (dateRange.to) {
          return ticketDate <= dateRange.to;
        }
        return true;
      });
    }

    if (filterCriteria.time) {
      filteredResults = filteredResults.filter((ticket) =>
        ticket.time?.toLowerCase().includes(filterCriteria.time.toLowerCase())
      );
    }

    if (filterCriteria.status) {
      filteredResults = filteredResults.filter(
        (ticket) => ticket.status === filterCriteria.status
      );
    }

    // Apply search query if present
    if (searchQuery) {
      filteredResults = filteredResults.filter((ticket) => {
        const searchableFields = {
          ticketNo: ticket.ticketNo?.toString().toLowerCase() || "",
          name: ticket.name?.toLowerCase() || "",
          companyName: ticket.companyName?.toLowerCase() || "",
          issueCategory: ticket.issueCategory?.toLowerCase() || "",
          date: formatDate(new Date(ticket.date))?.toLowerCase() || "",
          time: ticket.time?.toLowerCase() || "",
          status: ticket.status?.toLowerCase() || "",
        };

        return Object.values(searchableFields).some((value) =>
          value.includes(searchQuery.toLowerCase())
        );
      });
    }

    setDisplayedTickets(filteredResults);
  };

  // Apply filters when criteria changes
  useEffect(() => {
    applyFilters();
  }, [
    filterCriteria,
    searchQuery,
    sortField,
    sortDirection,
    selectedCategories,
    dateRange,
  ]);

  // Sorting functionality
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New field, start with ascending
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Reset all filters and sorting
  const resetFilters = () => {
    setFilterCriteria({
      ticketNo: "",
      name: "",
      companyName: "",
      issueCategory: "",
      date: "",
      time: "",
      status: "",
    });
    setSelectedCategories([]);
    setDateRange({ from: "", to: "" });
    setSortField(null);
    setSortDirection("asc");
    setSearchQuery("");
    setDisplayedTickets(tickets);
  };

  const renderSortIndicator = (field) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? " ↑" : " ↓";
  };

  // Toggle filter menu
  const toggleFilterMenu = () => {
    setShowFilterMenu(!showFilterMenu);
  };

  // Fetch tickets on component mount
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/tickets/open`
      );
      const sortedTickets = response.data.sort((a, b) => {
        const aDateTime =
          new Date(`${a.date.split("T")[0]}T${a.time}`).getTime() || 0;
        const bDateTime =
          new Date(`${b.date.split("T")[0]}T${b.time}`).getTime() || 0;
        return bDateTime - aDateTime;
      });
      setTickets(sortedTickets);
      setDisplayedTickets(sortedTickets);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setError("Failed to fetch tickets. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSearchToggle = () => {
    setIsSearchBoxVisible(!isSearchBoxVisible);
  };
  
  // Download functionality for tickets
  const handleDownload = async (ticket, format) => {
    console.log("Ticket for download:", ticket);
    console.log("Ticket No for download:", ticket.ticketNo);

    if (!ticket.ticketNo) {
      console.error("Ticket No is undefined. Cannot proceed with download.");
      return;
    }

    if (format === "excel") {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/ticket-details/${ticket.ticketNo}`
        );
        const ticketDetails = response.data;
        console.log(
          "Ticket Details (ETA Total Days):",
          ticketDetails.eta.totalDays
        );
        const totalDays =
          ticketDetails.eta &&
          ticketDetails.eta.totalDays !== undefined &&
          ticketDetails.eta.totalDays !== null &&
          !isNaN(ticketDetails.eta.totalDays)
            ? ticketDetails.eta.totalDays
            : 0;

        console.log("Final Total Days to display:", totalDays);
        console.log("Total Days to display:", totalDays);

        const worksheetData = [
          [
            "Ticket No",
            "Name",
            "Contact Number",
            "Email",
            "Company Name",
            "Issue Category",
            "Issue Description",
            "Resolution",
            "Preventive Action",
            "Warranty Category",
            "Status",
            "Date",
            "Time",
            "Engineer Name",
            "Close Date",
            "Total Days (ETA)",
          ],
          [
            ticketDetails.ticketId,
            ticketDetails.name,
            ticketDetails.contactNumber,
            ticketDetails.email,
            ticketDetails.companyName,
            ticketDetails.issueCategory || "N/A",
            ticketDetails.issueDescription,
            ticketDetails.resolution,
            ticketDetails.preventiveAction,
            ticketDetails.warrantyCategory,
            ticketDetails.status,
            formatDate(new Date(ticketDetails.date)),
            ticketDetails.time,
            ticketDetails.engineerName,
            formatDate(new Date(ticketDetails.closeDate)),
            totalDays,
          ],
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets");

        XLSX.writeFile(workbook, `${ticketDetails.ticketId}_details.xlsx`);

        console.log("Excel Data:", worksheetData);
      } catch (error) {
        console.error("Error fetching ticket details:", error);
      }
    } else {
      const eta = etaData[ticket.ticketNo] || "N/A";
      const createdDate = formatDate(new Date(ticket.createdDate));
      console.log("ETA:", eta);
      console.log("Created Date:", createdDate);

      localStorage.setItem("ticketETA", eta);
      localStorage.setItem("ticketCreatedDate", createdDate);

      generateServiceTicketOpenAdminPDF(ticket.ticketNo, eta, createdDate);
    }
  };

  const totalEntries = displayedTickets.length;

  useEffect(() => {
    localStorage.setItem("totalOpenTickets", totalEntries.toString());
  }, [totalEntries]);

  const indexOfLastTicket = currentPage * rowsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - rowsPerPage;
  const totalPages = Math.ceil(totalEntries / rowsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleCheckboxChange = (ticketNo) => {
    const updatedSelectedTickets = new Set(selectedTickets);
    updatedSelectedTickets.has(ticketNo)
      ? updatedSelectedTickets.delete(ticketNo)
      : updatedSelectedTickets.add(ticketNo);
    setSelectedTickets(updatedSelectedTickets);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Search bar hide logic
      const searchInput = document.querySelector(".search-input");
      const searchIcon = document.querySelector(".search-icon");
      if (
        isSearchBoxVisible &&
        searchInput &&
        searchIcon &&
        !searchInput.contains(event.target) &&
        !searchIcon.contains(event.target)
      ) {
        setIsSearchBoxVisible(false);
      }

      // Filter menu hide logic
      const filterMenu = document.querySelector(".filter-menu");
      const settingIcon = document.querySelector("img[alt='Setting Icon']");
      if (
        showFilterMenu &&
        filterMenu &&
        settingIcon &&
        !filterMenu.contains(event.target) &&
        !settingIcon.contains(event.target)
      ) {
        setShowFilterMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchBoxVisible, showFilterMenu]); // Add showFilterMenu to dependencies

  const handleOpenModal = async (ticket) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/ticket-details/${ticket.ticketNo}`
      );
      setSelectedTicket(response.data);
      localStorage.setItem("selectedTicketId", response.data.ticketId);
      setModalOpen(true);
    } catch (error) {
      console.error("Error fetching ticket details:", error);
      setError("Failed to fetch ticket details.");
    }
  };

  const handleCloseModal = () => {
  setModalOpen(false);
  setSelectedTicket(null);
  localStorage.removeItem("selectedTicketId");
  
  // Refresh the ticket data without reloading the page
  fetchTickets();
};

  const [tooltipVisible, setTooltipVisible] = useState({});

  const handleTooltipVisibility = (ticketNo) => {
    setTooltipVisible((prev) => ({
      ...prev,
      [ticketNo]: true,
    }));
  };

  const handleTooltipHide = (ticketNo) => {
    setTooltipVisible((prev) => ({
      ...prev,
      [ticketNo]: false,
    }));
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      const filterMenu = document.querySelector(".filter-menu");
      const settingIcon = document.querySelector(".setting-icon");

      if (
        showFilterMenu &&
        filterMenu &&
        settingIcon &&
        !filterMenu.contains(event.target) &&
        !settingIcon.contains(event.target)
      ) {
        setShowFilterMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilterMenu]);
  const handleBulkExcelDownload = async () => {
  try {
    // Create array to store all ticket details
    const allTicketDetails = [];

    // Add headers as first row
    const headers = [
      "Ticket No",
      "Name",
      "Contact Number",
      "Email",
      "Company Name",
      "Issue Category",
      "Issue Description",
      "Resolution",
      "Preventive Action",
      "Warranty Category",
      "Status",
      "Date",
      "Time",
      "Engineer Name",
      "Close Date",
      "Total Days (ETA)"
    ];
    
    allTicketDetails.push(headers);

    // Fetch details for each selected ticket
    for (const ticketNo of selectedTickets) {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/ticket-details/${ticketNo}`
      );
      const ticket = response.data;
      
      // Calculate total days
      const totalDays = ticket.eta?.totalDays ?? 0;

      // Add ticket data
      allTicketDetails.push([
        ticket.ticketId,
        ticket.name,
        ticket.contactNumber,
        ticket.email,
        ticket.companyName,
        ticket.issueCategory || "N/A",
        ticket.issueDescription,
        ticket.resolution,
        ticket.preventiveAction,
        ticket.warrantyCategory,
        ticket.status,
        formatDate(new Date(ticket.date)),
        ticket.time,
        ticket.engineerName,
        formatDate(new Date(ticket.closeDate)),
        totalDays
      ]);
    }

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(allTicketDetails);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets");

    // Download file
    XLSX.writeFile(workbook, `tickets_${new Date().getTime()}.xlsx`);

  } catch (error) {
    console.error("Error downloading tickets:", error);
    alert("Error downloading tickets. Please try again.");
  }
};
const handleBulkPdfDownload = async () => {
  try {
    // Get all selected tickets
    for (const ticketNo of selectedTickets) {
      try {
        // Get ticket details
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/ticket-details/${ticketNo}`
        );
        const ticket = response.data;

        // Calculate total days and format date
        const totalDays = ticket.eta?.totalDays ?? 0;
        const createdDate = formatDate(new Date(ticket.date));

        // Set necessary localStorage items
        localStorage.setItem("ticketETA", totalDays);
        localStorage.setItem("ticketCreatedDate", createdDate);

        // Generate PDF for this ticket
        generateServiceTicketOpenAdminPDF(ticketNo);

        // Add a delay between PDF generations
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error processing ticket ${ticketNo}:`, error);
      }
    }
  } catch (error) {
    console.error("Error in bulk PDF download:", error);
    alert("Error downloading PDFs. Please try again.");
  }
};
  return (
    <div className="flex flex-col mt-20 ml-32 h-full w-[88%] xl:pl-[10%] 2xl:pl-[10%] lg:pl-[15%]">
      <div className="flex justify-between items-center bg-white h-20">
        <div className="flex items-center mb-4">
          <span
            className="mt-2 font-poppins"
            style={{
              fontSize: "18px",
              fontWeight: "400",
              lineHeight: "28px",
              color: "#343A40",
            }}
          >
            All ({totalEntries})
          </span>
        </div>
        <div className="flex items-center mb-4">
          <span
            className="mt-2 font-poppins"
            style={{
              fontSize: "18px",
              fontWeight: "800",
              lineHeight: "40px",
              color: "#343A40",
            }}
          >
            Open Tickets
          </span>
        </div>
          {selectedTickets.size > 0 && (
  <div className="flex items-center bg-buttoncolor px-4 py-2 rounded-md">
    <button
      onClick={handleBulkExcelDownload}
      className="text-white flex items-center gap-2"
    >
      <img src="/excel.png" alt="Excel" className="h-5 w-5" />
      
    </button>
    <div className="h-full mx-2 border-1 border-white" /> {/* Vertical separator */}
    <button
      onClick={handleBulkPdfDownload}
      className="text-white flex items-center gap-2 border-l border-white pl-2.5"
    >
      <img src="/pdf.png" alt="PDF" className="h-5 w-5" />
      
    </button>
  </div>
)}
        <div className="flex flex-row gap-3 mr-3">
          <div className="relative flex">
            <img
              src="/search.png"
              alt="Search Icon"
              className="h-7 w-7 cursor-pointer search-icon"
              onClick={handleSearchToggle}
            />
            {isSearchBoxVisible && (
              <input
                type="text"
                placeholder="Enter Ticket Number or keyword"
                value={searchQuery}
                onChange={handleSearch}
                className="border rounded px-2 py-1 search-input font-poppins "
                autoFocus
              />
            )}
          </div>
          <img
            src="/filter.png"
            alt="Setting Icon"
            className="h-7 w-7 cursor-pointer"
            onClick={toggleFilterMenu}
          />
        </div>
      </div>

      {/* Filter Panel */}
      {showFilterMenu && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-lg w-96 p-6  ">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 relative">
        <img src="/image_black.png" alt="Filter" className="w-10 h-10" />
        <h2 className="text-xl font-poppins absolute left-1/2 transform -translate-x-1/2">Filters</h2>
        <button
          onClick={() => setShowFilterMenu(false)}
          className="text-gray-500 hover:text-gray-700 font-bold text-2xl -mt-[8%]"
        >
          ×
        </button>
      </div>

      {/* Issue Category */}
      <div className="mb-6">
        <label className="block text-xs font-semibold mb-2 font-poppins">
          Issue Category:
        </label>
        <select
          className="w-full p-2 border  font-poppins text-xs"
          onChange={(e) => {
            if (
              e.target.value &&
              !selectedCategories.includes(e.target.value)
            ) {
              setSelectedCategories([
                ...selectedCategories,
                e.target.value,
              ]);
            }
          }}
          value=""
        >
          <option value="">Select Category</option>
          {uniqueIssueCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Name Filter */}
      <div className="mb-6">
        <label className="block text-xs font-semibold mb-2 font-poppins">
          Name:
        </label>
        <select
          value={filterCriteria.name}
          onChange={(e) => handleFilterChange("name", e.target.value)}
          className="w-full p-2 border  font-poppins text-xs"
        >
          <option value="">All Names</option>
          {uniqueNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* Company Name Filter */}
      <div className="mb-6">
        <label className="block text-xs font-semibold mb-2 font-poppins">
          Company Name:
        </label>
        <select
          value={filterCriteria.companyName}
          onChange={(e) =>
            handleFilterChange("companyName", e.target.value)
          }
          className="w-full p-2 border  font-poppins text-xs"
        >
          <option value="">All Companies</option>
          {uniqueCompanyNames.map((company) => (
            <option key={company} value={company}>
              {company}
            </option>
          ))}
        </select>
      </div>

      {/* Date Range Picker */}
      <div className="mb-6">
        <label className="block text-xs font-semibold mb-2 font-poppins">
          Choose a Date Range:
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => {
              setDateRange({ ...dateRange, from: e.target.value });
            }}
            className="w-full p-2 border  font-poppins text-xs"
            placeholder="Start date"
          />
          {dateRange.from && (
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => {
                setDateRange({ ...dateRange, to: e.target.value });
              }}
              min={dateRange.from}
              className="w-full p-2 border rounded-md font-poppins text-xs"
              placeholder="End date"
            />
          )}
        </div>
      </div>

      {/* Selected Categories */}
      {selectedCategories.length > 0 && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((category) => (
              <span
                key={category}
                className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2 font-poppins text-[10px]"
              >
                {category}
                <button
                  onClick={() =>
                    setSelectedCategories(
                      selectedCategories.filter((cat) => cat !== category)
                    )
                  }
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-center gap-2">
        <button
          onClick={() => {
            setSelectedCategories([]);
            setDateRange({ from: "", to: "" });
            resetFilters();
          }}
          className="px-[0.3rem] py-[0.3rem] text-white border  bg-gray-600 font-poppins text-xs"
        >
          Reset
        </button>
        <button
          onClick={() => {
            handleFilterChange(
              "issueCategory",
              selectedCategories.join(",")
            );
            handleFilterChange(
              "date",
              dateRange.from ? dateRange.from : ""
            );
            setShowFilterMenu(false);
          }}
          className="px-[0.3rem] py-[0.3rem] bg-buttoncolor text-white font-poppins text-xs"
        >
          Apply
        </button>
      </div>
    </div>
  </div>
)}

      <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
          <div className="overflow-hidden">
            {loading ? (
              <p className="text-center py-4 font-poppins">Loading...</p>
            ) : error ? (
              <p className="text-center py-4 font-poppins">{error}</p>
            ) : displayedTickets.length === 0 ? (
              <p className="text-center py-4 font-poppins">
                No tickets match your search criteria.
              </p>
            ) : (
              <>
                <table className="min-w-full text-left text-sm font-light text-surface dark:text-white">
                  <thead className="border-b border-neutral-200 bg-white font-medium dark:border-white/10 dark:bg-body-dark">
                    <tr>
                      <th scope="col" className="px-2 py-2 font-poppins">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            setSelectedTickets(
                              e.target.checked
                                ? new Set(
                                    displayedTickets
                                      .slice(
                                        (currentPage - 1) * rowsPerPage,
                                        currentPage * rowsPerPage
                                      )
                                      .map((ticket) => ticket.ticketNo)
                                  )
                                : new Set()
                            );
                          }}
                        />
                      </th>
                      {[
                        { key: "ticketNo", label: "Ticket No." },
                        { key: "name", label: "Name" },
                        { key: "companyName", label: "Company Name" },
                        { key: "issueCategory", label: "Issue Category" },
                        { key: "date", label: "Date" },
                        { key: "time", label: "Time" },
                        { key: null, label: "Preview/Assign" },
                        { key: null, label: "Download" },
                      ].map((column) => (
                        <th
                          key={column.label}
                          className="px-4 py-2 font-poppins text-[#343A40] text-[14px] font-[700] leading-[22px] text-center"
                        >
                          {column.key ? (
                            <button
                              className="flex items-center justify-center w-full cursor-pointer"
                              onClick={() => handleSort(column.key)}
                            >
                              {column.label}
                              {renderSortIndicator(column.key)}
                            </button>
                          ) : (
                            column.label
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
  
                  <tbody>
                    {displayedTickets
                      .slice(
                        (currentPage - 1) * rowsPerPage,
                        currentPage * rowsPerPage
                      )
                      .map((ticket) => {
                        const eta = etaData[ticket.ticketNo] || "N/A";
                        const ticketStatusCircleColor =
                          ticket.status === "In-Progress"
                            ? "bg-orange-400"
                            : "";

                        return (
                          <tr
                            key={ticket.ticketNo}
                            className="border-b border-neutral-200 bg-white transition duration-300 ease-in-out hover:bg-neutral-100 font-poppins"
                          >
                            <td className="whitespace-nowrap px-2 py-2 font-poppins text-neutral-900">
                              <input
                                type="checkbox"
                                checked={selectedTickets.has(ticket.ticketNo)}
                                onChange={() =>
                                  handleCheckboxChange(ticket.ticketNo)
                                }
                              />
                            </td>
                            <td
                              className={`whitespace-nowrap px-2 py-2 font-poppins-light text-neutral-900 text-center`}
                            >
                              <div
                                className="flex items-center gap-2 justify-center relative"
                                onMouseEnter={() =>
                                  ticket.status === "In-Progress" &&
                                  handleTooltipVisibility(ticket.ticketNo)
                                }
                                onMouseLeave={() =>
                                  handleTooltipHide(ticket.ticketNo)
                                }
                              >
                                <span
                                  className={`w-3.5 h-3.5 rounded-full ${ticketStatusCircleColor}`}
                                ></span>
                                {tooltipVisible[ticket.ticketNo] &&
                                  ticket.status === "In-Progress" && (
                                    <div
                                      className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-gray-800 text-white text-sm rounded-md"
                                      style={{ zIndex: 10 }}
                                    >
                                      {ticket.status}
                                    </div>
                                  )}
                                <span className="text-[13px] font-poppins">
                                  {ticket.ticketNo}
                                </span>
                                <button
                                  onClick={() =>
                                    copyToClipboard(ticket.ticketNo)
                                  }
                                  className="ml-2 p-0 rounded-md transition duration-200 ease-in-out hover:bg-gray-200"
                                  style={{ width: "12px", height: "12px" }}
                                >
                                  <img
                                    src={
                                      copiedTicketNos[ticket.ticketNo]
                                        ? "/copy_green.png"
                                        : "/copy.png"
                                    }
                                    alt="Copy Icon"
                                    className="h-full w-full object-contain"
                                  />
                                </button>
                                {copiedTicketNos[ticket.ticketNo] && (
                                  <span className="text-green-500 text-sm font-poppins">
                                    Copied!
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-2 py-2 font-poppins text-neutral-900 text-center">
                              {ticket.name || "N/A"}
                            </td>
                            <td className="whitespace-nowrap px-2 py-2 font-poppins text-neutral-900 text-center">
                              {ticket.companyName || "N/A"}
                            </td>
                            <td className="whitespace-nowrap px-2 py-2 font-poppins text-neutral-900 text-center">
                              {ticket.issueCategory || "N/A"}
                            </td>
                            <td className="whitespace-nowrap px-2 py-2 font-poppins text-neutral-900 text-center">
                              {formatDate(new Date(ticket.date))}
                            </td>
                            <td className="whitespace-nowrap px-2py-2 font-poppins text-neutral-900 text-center">
                              {ticket.time || "N/A"}
                            </td>
                            <td className="whitespace-nowrap px-2 py-2 font-poppins text-neutral-900">
                              <div className="flex justify-center cursor-pointer">
                                <img
                                  src="/preview.png"
                                  alt="Preview"
                                  className="cursor-pointer h-6 w-6"
                                  onClick={() => handleOpenModal(ticket)}
                                />
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-2 py-2 font-poppins text-neutral-900">
                              <div className="flex justify-center items-center gap-2">
                                <img
                                  src="/excel.png"
                                  alt="Excel"
                                  className="h-6 w-6 cursor-pointer"
                                  onClick={() =>
                                    handleDownload(ticket, "excel")
                                  }
                                />
                                <img
                                  src="/pdf.png"
                                  alt="PDF"
                                  className="h-6 w-6 cursor-pointer"
                                  onClick={() => handleDownload(ticket)}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
                <TicketDetailsModal
                  isOpen={modalOpen}
                  onClose={handleCloseModal}
                  ticket={selectedTicket}
                />

                <div className="flex justify-between items-center mt-4 ">
                  <div className="font-poppins font-light">
                    <span className="mr-2">Showing</span>
                    {/* Rows per page dropdown */}
                    <select
                      onChange={handleRowsPerPageChange}
                      value={rowsPerPage}
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                    <span className="ml-2">rows per page</span>
                  </div>
                  <div>
                    <span className="font-poppins font-light">
                      Showing {currentPage} of {totalPages} pages
                    </span>
                  </div>
                  <div className="flex items-center ml-20 gap-3">
                    <div className=" w-[30px] h-[30px] flex items-center justify-center">
                      <button
                        className="px-3 md:px-4 py-1 md:py-2 border rounded-md"
                        onClick={() =>
                          currentPage > 1 && paginate(currentPage - 1)
                        }
                      >
                        &lt;
                      </button>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, index) => (
                        <button
                          key={index + 1}
                          onClick={() => paginate(index + 1)}
                          className={`px-3 md:px-4 py-1 md:py-2 border rounded-md bg-buttoncolor text-white ${
                            currentPage === index + 1
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>
                    <div className=" w-[30px] h-[30px] flex items-center justify-center">
                      <button
                        className="px-3 md:px-4 py-1 md:py-2 border rounded-md"
                        onClick={() =>
                          currentPage < totalPages && paginate(currentPage + 1)
                        }
                      >
                        &gt;
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpenticketAdmin;
