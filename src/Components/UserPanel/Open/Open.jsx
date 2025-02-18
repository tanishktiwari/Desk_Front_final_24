import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import PopUpForm from "./PopUpForm";
import generateServiceTicketPDF from "./pdfGenerator";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import FilterPopup from "../Close/FilterPopup";

const Open = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [initialsMap, setInitialsMap] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTickets, setSelectedTickets] = useState(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [etaData, setEtaData] = useState({});
  const [isSearchBoxVisible, setIsSearchBoxVisible] = useState(false);
  const navigate = useNavigate();
  const searchBoxRef = useRef(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [copiedTicketNos, setCopiedTicketNos] = useState({});
  const [sortOrder, setSortOrder] = useState("none");
  const [uniqueIssueCategories, setUniqueIssueCategories] = useState([]);
  const [uniqueNames, setUniqueNames] = useState([]);
   const [uniqueCompanyNames, setUniqueCompanyNames] = useState([]);
  const [filterCriteria, setFilterCriteria] = useState({
  ticketNo: "",
  name: "",
  companyName: "",
  issueCategory: "",
  date: "",
  time: "",
  status: "",
  etaMin: "",
  etaMax: "",
});

const [selectedCategories, setSelectedCategories] = useState([]);
const [dateRange, setDateRange] = useState({ from: "", to: "" });
const [showFilterMenu, setShowFilterMenu] = useState(false);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
  };
  // Clipboard copy function
  // Clipboard copy function
  const copyToClipboard = (text) => {
    // Check if navigator.clipboard is available
    if (navigator.clipboard) {
      // Use the modern Clipboard API (navigator.clipboard.writeText)
      navigator.clipboard
        .writeText(text)
        .then(() => {
          // Update the copied state for the specific text
          setCopiedTicketNos((prev) => ({ ...prev, [text]: true }));

          // Reset copied state after 2 seconds
          setTimeout(() => {
            setCopiedTicketNos((prev) => ({ ...prev, [text]: false }));
          }, 2000);

          console.log("Text copied successfully");
          // alert("Ticket number copied to clipboard!"); // Optionally show feedback to the user
        })
        .catch((err) => {
          console.error("Failed to copy text using Clipboard API", err);
          // alert("Failed to copy ticket number");
        });
    } else {
      // Fallback to execCommand if clipboard API is not available (older browsers)
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      textArea.setSelectionRange(0, 99999); // For mobile devices

      try {
        const successful = document.execCommand("copy");
        if (successful) {
          // Update the copied state for the specific text
          setCopiedTicketNos((prev) => ({ ...prev, [text]: true }));

          // Reset copied state after 2 seconds
          setTimeout(() => {
            setCopiedTicketNos((prev) => ({ ...prev, [text]: false }));
          }, 2000);

          console.log("Text copied successfully using execCommand");
          // alert("Ticket number copied to clipboard!");
        } else {
          console.error("Failed to copy text using execCommand");
          // alert("Failed to copy ticket number");
        }
      } catch (err) {
        console.error("Error copying text: ", err);
        // alert("Failed to copy ticket number");
      } finally {
        document.body.removeChild(textArea); // Clean up
      }
    }
  };
  const [filters, setFilters] = useState({
    category: "all", // Keeps track of the selected category
    selectedDate: "",
    selectedEta: "all", // Selected ETA filter
    fromDate: "", // Added fromDate
    toDate: "", // Added toDate
  });
  const [displayedTickets, setDisplayedTickets] = useState([]);
  const [isFilterPopupVisible, setIsFilterPopupVisible] = useState(false);
  // const applyFilters = (newFilters) => {
  //   setFilters(newFilters); // Update filters

  //   let filteredTickets = [...tickets]; // Copy original tickets

  //   // Apply category filter
  //   if (newFilters.category !== "all") {
  //     filteredTickets = filteredTickets.filter(
  //       (ticket) => ticket.issueCategory === newFilters.category
  //     );
  //   }

  //   // Apply date range filter (fromDate and toDate)
  //   if (newFilters.fromDate && newFilters.toDate) {
  //     filteredTickets = filteredTickets.filter((ticket) => {
  //       const ticketDate = new Date(ticket.createdDate);
  //       const start = new Date(newFilters.fromDate);
  //       const end = new Date(newFilters.toDate);
  //       return ticketDate >= start && ticketDate <= end;
  //     });
  //   }

  //   // Apply ETA filter
  //   if (newFilters.selectedEta !== "all") {
  //     const etaMapping = {
  //       "0-2": 2,
  //       "2-4": 4,
  //       "4+": Infinity,
  //     };
  //     const [minEta, maxEta] = newFilters.selectedEta.split("-").map(Number);
  //     filteredTickets = filteredTickets.filter((ticket) => {
  //       const etaDays = ticket.eta || 0;
  //       return etaDays >= minEta && etaDays <= maxEta;
  //     });
  //   }

  //   // Update displayed tickets with the filtered tickets
  //   setDisplayedTickets(filteredTickets);
  // };

  const paginatedTickets = tickets.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const mobileNumbers = localStorage.getItem("loggedInUserMobileNumber");

  const handleExcelDownload = () => {
    const ticketsToDownload =
      selectedTickets.size === currentTickets.length
        ? filteredTickets // If all are selected, download all filtered tickets
        : filteredTickets.filter((ticket) =>
            selectedTickets.has(ticket.ticketNo)
          ); // Else download selected tickets

    const worksheet = XLSX.utils.json_to_sheet(ticketsToDownload);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets");

    const fileName = `tickets_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };
  //collapse search box
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(event.target)
      ) {
        setIsSearchBoxVisible(false); // Hide the search box if click is outside
      }
    };
    const handleSearchIconClick = () => {
      setIsSearchBoxVisible(!isSearchBoxVisible); // Toggle search box visibility
    };

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up the event listener on unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (mobileNumbers) {
      const fetchTickets = async () => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/tickets/mobile/${mobileNumbers}`
          );
          setTickets(response.data); // Store tickets in `tickets`
          setDisplayedTickets(response.data); // Initially display all tickets
          await fetchInitials(response.data); // Fetch initials
          setLoading(false); // Set loading to false when data is fetched
        } catch (error) {
          setError("Failed to fetch tickets.");
          setLoading(false);
        }
      };

      fetchTickets();
      fetchEtaData(mobileNumbers); // Initial fetch for ETA data
      const intervalId = setInterval(() => {
        fetchEtaData(mobileNumbers);
      }, 500); // Re-fetch every 10 seconds

      return () => clearInterval(intervalId); // Cleanup on component unmount
    } else {
      setLoading(false);
    }
  }, [mobileNumbers]);

  const fetchEtaData = async (mobileNumber) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/currentETA/${mobileNumber}`
      );
      if (response.data && Array.isArray(response.data.tickets)) {
        const etaData = response.data.tickets.reduce((acc, ticket) => {
          const { days, hours } = ticket.timeDifference;
          acc[ticket.createdDate] = { days, hours };
          return acc;
        }, {});
        setEtaData(etaData);
      } else {
        console.error("Tickets data is not an array or is undefined.");
      }
    } catch (error) {
      console.error("Error fetching ETA data:", error);
    }
  };

  const fetchInitials = async (tickets) => {
    const initialsPromises = tickets.map(async (ticket) => {
      try {
        const response = await axios.get(
          `/operators/initials-two/${ticket.mobile}`
        );
        return { mobile: ticket.mobile, initials: response.data.initials };
      } catch (error) {
        console.error("Error fetching initials:", error);
        return { mobile: ticket.mobile, initials: "N/A" };
      }
    });

    const initialsArray = await Promise.all(initialsPromises);
    const initialsMap = initialsArray.reduce((acc, { mobile, initials }) => {
      acc[mobile] = initials;
      return acc;
    }, {});

    setInitialsMap(initialsMap);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const filteredTickets = tickets.filter((ticket) => {
    // If no search query, return all tickets
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase().trim();

    // Helper function to check if a value contains the query
    const matchesQuery = (value) =>
      value && value.toString().toLowerCase().includes(query);

    // Check against specific fields with precise matching
    return (
      matchesQuery(ticket.ticketNo) || // Ticket Number
      matchesQuery(
        new Date(ticket.createdDate).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      ) || // Created Date
      matchesQuery(ticket.time) || // Time
      matchesQuery(ticket.issueCategory) || // Category
      matchesQuery(ticket.issueDescription) || // Issue Description
      matchesQuery(etaData[ticket.createdDate]?.days) // ETA Days
    );
  });
  useEffect(() => {
    // When tickets or searchQuery changes, update displayedTickets
    setDisplayedTickets(filteredTickets);
  }, [tickets, searchQuery]);

  const totalEntries = filteredTickets.length;
  const indexOfLastTicket = currentPage * rowsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - rowsPerPage;
  const currentTickets = filteredTickets.slice(
    indexOfFirstTicket,
    indexOfLastTicket
  );
  const totalPages = Math.ceil(totalEntries / rowsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleCheckboxChange = (ticketNo) => {
    const updatedSelectedTickets = new Set(selectedTickets);
    if (updatedSelectedTickets.has(ticketNo)) {
      updatedSelectedTickets.delete(ticketNo);
    } else {
      updatedSelectedTickets.add(ticketNo);
    }
    setSelectedTickets(updatedSelectedTickets);
  };

  function formatDate(date) {
    if (!date || isNaN(date.getTime())) {
      return "Invalid Date";
    }
    const options = { day: "2-digit", month: "short", year: "numeric" };
    try {
      let dateString = date.toLocaleDateString("en-GB", options);
      const [day, month, year] = dateString.split(" ");
      return `${day} ${month.slice(0, 3)} ${year}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  }

  const handleDownload = (ticket) => {
    const ticketNo = ticket.ticketNo;
    generateServiceTicketPDF(ticketNo);
  };

  const getEtaBackgroundColor = (days) => {
    if (days >= 0 && days < 2) return "bg-green-100";
    if (days >= 2 && days < 4) return "bg-yellow-100";
    if (days >= 4) return "bg-red-400";
    return "";
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

  // ETA filtering
  if (filterCriteria.etaMin) {
    filteredResults = filteredResults.filter(
      (ticket) => ticket.eta >= parseInt(filterCriteria.etaMin)
    );
  }
  if (filterCriteria.etaMax) {
    filteredResults = filteredResults.filter(
      (ticket) => ticket.eta <= parseInt(filterCriteria.etaMax)
    );
  }

  // Date range filtering
  if (dateRange.from || dateRange.to) {
      filteredResults = filteredResults.filter((ticket) => {
        // Parse the ticket's createdDate
        const ticketDate = new Date(ticket.createdDate);
        
        // Convert date strings to Date objects
        const fromDate = dateRange.from ? new Date(dateRange.from) : null;
        const toDate = dateRange.to ? new Date(dateRange.to) : null;

        // Add one day to toDate to include the end date in results
        if (toDate) {
          toDate.setDate(toDate.getDate() + 1);
        }

        // Reset time portions for accurate date comparison
        if (ticketDate) ticketDate.setHours(0, 0, 0, 0);
        if (fromDate) fromDate.setHours(0, 0, 0, 0);
        if (toDate) toDate.setHours(0, 0, 0, 0);

        // Debug logs to help identify issues
        console.log('Ticket Date:', ticketDate);
        console.log('From Date:', fromDate);
        console.log('To Date:', toDate);

        // Perform the date range check
        if (fromDate && toDate) {
          return ticketDate >= fromDate && ticketDate < toDate;
        } else if (fromDate) {
          return ticketDate >= fromDate;
        } else if (toDate) {
          return ticketDate < toDate;
        }
        return true;
      });
    }

  // Apply search query if present
  if (searchQuery) {
      filteredResults = filteredResults.filter((ticket) => {
        const searchableFields = {
          ticketNo: ticket.ticketNo?.toString().toLowerCase() || "",
          name: ticket.name?.toLowerCase() || "",
          companyName: ticket.companyName?.toLowerCase() || "",
          issueCategory: ticket.issueCategory?.toLowerCase() || "",
          date: ticket.date ? formatDate(new Date(ticket.date)) : "",
          time: ticket.time?.toLowerCase() || "",
          status: ticket.status?.toLowerCase() || "",
        };

        return Object.values(searchableFields).some((value) =>
          value.toString().toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }

    setDisplayedTickets(filteredResults);
  };
const toggleFilterMenu = () => {
  setShowFilterMenu(!showFilterMenu);
};
useEffect(() => {
  applyFilters();
}, [filterCriteria, searchQuery, selectedCategories, dateRange]);
useEffect(() => {
  if (tickets.length > 0) {
    const categories = [
      ...new Set(tickets.map((ticket) => ticket.issueCategory).filter(Boolean)),
    ];
    setUniqueIssueCategories(categories);

    const names = [
      ...new Set(tickets.map((ticket) => ticket.name).filter(Boolean)),
    ];
    setUniqueNames(names);

    const companies = [
      ...new Set(tickets.map((ticket) => ticket.companyName).filter(Boolean)),
    ];
    setUniqueCompanyNames(companies);
  }
}, [tickets]);
const resetFilters = () => {
  setFilterCriteria({
    ticketNo: "",
    name: "",
    companyName: "",
    issueCategory: "",
    date: "",
    time: "",
    status: "",
    etaMin: "",
    etaMax: "",
  });
  setSelectedCategories([]);
  setDateRange({ from: "", to: "" });
  setDisplayedTickets(tickets);
};
// Advanced filtering
  const handleFilterChange = (field, value) => {
    setFilterCriteria((prev) => ({
      ...prev,
      [field]: value,
    }));
    setCurrentPage(1);
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
        <div className="flex flex-row gap-3 mr-3">
          <img
            src="/search.png"
            alt="Search Icon"
            className="h-7 w-7 cursor-pointer"
            onClick={() => setIsSearchBoxVisible(!isSearchBoxVisible)}
          />
          {isSearchBoxVisible && (
            <div
              className={`transition-all duration-1000000 ease-in-out transform ${
                isSearchBoxVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-[-10px]"
              }`}
              ref={searchBoxRef}
              style={{
                opacity: isSearchBoxVisible ? 1 : 0,
                transform: isSearchBoxVisible
                  ? "translateY(0)"
                  : "translateY(-20px)",
              }}
            >
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearch}
                className="border rounded px-2 py-1 font-poppins "
              />
            </div>
          )}

          <img
            src="/filter.png"
            alt="Filter Icon"
            className="h-7 w-7 cursor-pointer"
            onClick={toggleFilterMenu}
          />
          {showFilterMenu && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-lg w-96 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 relative">
        <img src="/image_black.png" alt="Filter" className="w-10 h-10" />
        <h2 className="text-xl font-poppins absolute left-1/2 transform -translate-x-1/2">
          Filters
        </h2>
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
          className="w-full p-2 border font-poppins text-xs"
          onChange={(e) => {
            if (
              e.target.value &&
              !selectedCategories.includes(e.target.value)
            ) {
              setSelectedCategories([...selectedCategories, e.target.value]);
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
      {/* <div className="mb-6">
        <label className="block text-xs font-semibold mb-2 font-poppins">
          Name:
        </label>
        <select
          value={filterCriteria.name}
          onChange={(e) => handleFilterChange("name", e.target.value)}
          className="w-full p-2 border font-poppins text-xs"
        >
          <option value="">All Names</option>
          {uniqueNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div> */}

      {/* Company Name Filter */}
      {/* <div className="mb-6">
        <label className="block text-xs font-semibold mb-2 font-poppins">
          Company Name:
        </label>
        <select
          value={filterCriteria.companyName}
          onChange={(e) =>
            handleFilterChange("companyName", e.target.value)
          }
          className="w-full p-2 border font-poppins text-xs"
        >
          <option value="">All Companies</option>
          {uniqueCompanyNames.map((company) => (
            <option key={company} value={company}>
              {company}
            </option>
          ))}
        </select>
      </div> */}

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

      {/* ETA Range Picker */}
      <div className="mb-6">
        <label className="block text-xs font-semibold mb-2 font-poppins">
          ETA (Days) Range:
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min="0"
            placeholder="Min days"
            value={filterCriteria.etaMin || ""}
            onChange={(e) => handleFilterChange("etaMin", e.target.value)}
            className="w-full p-2 border font-poppins text-xs"
          />
          <input
            type="number"
            min="0"
            placeholder="Max days"
            value={filterCriteria.etaMax || ""}
            onChange={(e) => handleFilterChange("etaMax", e.target.value)}
            className="w-full p-2 border font-poppins text-xs"
          />
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
          className="px-[0.3rem] py-[0.3rem] text-white border bg-gray-600 font-poppins text-xs"
        >
          Reset
        </button>
        <button
          onClick={() => {
            handleFilterChange(
              "issueCategory",
              selectedCategories.join(",")
            );
            handleFilterChange("date", dateRange.from ? dateRange.from : "");
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
        </div>
      </div>

      <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
          <div className="overflow-hidden">
            {loading ? (
              <p className="text-center py-4">Loading...</p>
            ) : error ? (
              <p className="text-center py-4">{error}</p>
            ) : totalEntries === 0 ? (
              <p className="text-center py-4">
                No tickets match your search criteria.
              </p>
            ) : (
              <>
                <table className="min-w-full text-left text-sm font-light text-surface dark:text-white">
                  <thead className="border-b border-neutral-200 bg-white font-medium dark:border-white/10 dark:bg-body-dark">
                    <tr>
                      <th scope="col" className="px-2 py-2">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            if (e.target.checked) {
                              const allTicketNos = new Set(
                                currentTickets.map((ticket) => ticket.ticketNo)
                              );
                              setSelectedTickets(allTicketNos);
                            } else {
                              setSelectedTickets(new Set());
                            }
                          }}
                        />
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-2 font-poppins text-[#343A40] text-[14px] font-medium leading-[22px] text-center"
                      >
                        Ticket No
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-2 font-poppins text-[#343A40] text-[14px] font-medium leading-[22px] text-center"
                      >
                        Created Date
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-2 font-poppins text-[#343A40] text-[14px] font-medium leading-[22px] text-center"
                      >
                        Time
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-2 font-poppins text-[#343A40] text-[14px] font-medium leading-[22px] text-center"
                      >
                        Category
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-2 font-poppins text-[#343A40] text-[14px] font-medium leading-[22px] text-center"
                      >
                        Issue Description
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-2 font-poppins text-[#343A40] text-[14px] font-medium leading-[22px] text-center"
                      >
                        ETA
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-2 font-poppins text-[#343A40] text-[14px] font-medium leading-[22px] text-center"
                      >
                        Preview
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-2 font-poppins text-[#343A40] text-[14px] font-medium leading-[22px] text-center"
                      >
                        Chat
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-2 font-poppins font-medium text-[#343A40] text-[14px]  leading-[22px] text-center"
                      >
                        Download
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-2 font-poppins text-[#343A40] text-[14px] font-medium leading-[22px] text-center"
                      >
                        Track
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedTickets
                      .slice(
                        (currentPage - 1) * rowsPerPage,
                        currentPage * rowsPerPage
                      )
                      .map((ticket) => {
                        const eta = etaData[ticket.createdDate] || {
                          days: 0,
                          hours: 0,
                        };

                        // Determine background color based on ticket status
                        const ticketStatusCircleColor =
                          ticket.status === "In-Progress"
                            ? "bg-orange-500"
                            : ""; // Orange for "In-Progress"

                        return (
                          <tr
                            key={ticket.ticketNo}
                            className="border-b border-neutral-200 bg-white transition duration-300 ease-in-out hover:bg-neutral-100"
                          >
                            <td className="whitespace-nowrap px-2 py-2 font-medium text-neutral-900 font-poppins">
                              <input
                                type="checkbox"
                                checked={selectedTickets.has(ticket.ticketNo)}
                                onChange={() =>
                                  handleCheckboxChange(ticket.ticketNo)
                                }
                              />
                            </td>

                            <td
                              className={`whitespace-nowrap px-2 py-2 font-medium text-neutral-900 text-center`}
                            >
                              <div
                                className="flex items-center justify-center gap-2 relative"
                                onMouseEnter={() =>
                                  ticket.status === "In-Progress" &&
                                  handleTooltipVisibility(ticket.ticketNo)
                                } // Show tooltip only if "In-Progress"
                                onMouseLeave={() =>
                                  handleTooltipHide(ticket.ticketNo)
                                } // Hide tooltip
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
                                      {ticket.status}{" "}
                                      {/* Tooltip will display the status */}
                                    </div>
                                  )}
                                <span className="text-[13px] font-poppins">
                                  {ticket.ticketNo}
                                </span>

                                {/* Copy Button */}
                                <button
                                  onClick={() =>
                                    copyToClipboard(ticket.ticketNo)
                                  }
                                  className="ml-2 p-0 rounded-md transition duration-200 ease-in-out hover:bg-gray-200"
                                  style={{ width: "12px", height: "12px" }} // Ensure button size is sufficient to display the icon fully
                                >
                                  <img
                                    src={
                                      copiedTicketNos[ticket.ticketNo]
                                        ? "/copy_green.png"
                                        : "/copy.png"
                                    }
                                    alt="Copy Icon"
                                    className="h-full w-full object-contain" // Make sure image fits within button without distortion
                                  />
                                </button>
                                {copiedTicketNos[ticket.ticketNo] && (
                                  <span className="text-green-500 text-sm font-poppins">
                                    Copied!
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="whitespace-nowrap px-2 py-2 font-medium text-neutral-900 text-center font-poppins">
                              {formatDate(new Date(ticket.createdDate))}
                            </td>

                            <td className="whitespace-nowrap px-2 py-2 font-medium text-neutral-900 text-center font-poppins">
                              {ticket.time}
                            </td>

                            <td className="whitespace-nowrap px-2 py-2 font-medium text-neutral-900 text-center font-poppins">
                              {ticket.issueCategory}
                            </td>

                            <td className="whitespace-nowrap px-2 py-2 font-medium text-neutral-900 text-center font-poppins">
                              {ticket.issueDescription}
                            </td>

                            <td
                              className={`whitespace-nowrap font-poppins px-2 py-2 font-medium text-neutral-900 text-center ${getEtaBackgroundColor(
                                eta.days
                              )}`}
                            >
                              {`${eta.days} days`}
                            </td>

                            {/* Preview Image */}
                            <td className="whitespace-nowrap px-2 py-2 font-medium text-neutral-900 text-center">
                              <div className="flex justify-center cursor-pointer">
                                <img
                                  src="/preview.png"
                                  alt="Preview"
                                  className="cursor-pointer h-6 w-6"
                                  onClick={() => {
                                    setSelectedTicketId(ticket.ticketNo);
                                    setIsModalOpen(true);
                                  }}
                                />
                              </div>
                            </td>

                            {/* Chat Icon */}
                            <td className="whitespace-nowrap px-2 py-2 font-medium text-neutral-900 text-center">
                              <div className="flex justify-center">
                                <img
                                  src="/chat.png"
                                  alt="chat"
                                  className="h-7 w-7"
                                />
                              </div>
                            </td>

                            {/* Excel & PDF Icon */}
                            <td className="whitespace-nowrap px-2 py-2 font-medium text-neutral-900 text-center">
                              <div className="flex justify-center items-center gap-2">
                                <img
                                  src="/excel.png"
                                  alt="Excel"
                                  className="h-6 w-6 cursor-pointer"
                                  onClick={handleExcelDownload} // Update the function here
                                />

                                <img
                                  src="/pdf.png"
                                  alt="PDF"
                                  className="h-6 w-6 cursor-pointer"
                                  onClick={() => handleDownload(ticket)}
                                />
                              </div>
                            </td>

                            {/* Track Icon */}
                            <td className="whitespace-nowrap px-2 py-2 font-medium text-neutral-900 text-center">
                              <div className="flex justify-center">
                                <img
                                  src="/track.png"
                                  alt=""
                                  className="h-7 w-7"
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
                {isModalOpen && (
                  <PopUpForm
                    ticketId={selectedTicketId}
                    onClose={() => setIsModalOpen(false)}
                    ticketNumber={selectedTicketId}
                  />
                )}
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

export default Open;
