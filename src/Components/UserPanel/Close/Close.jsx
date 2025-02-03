import React, { useState, useEffect } from "react";
import axios from "axios";
import PopUpForm from "../Open/PopUpForm";
import generateServiceTicketPDF from "../Close/pdfGeneratorclose";
import { useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx"; // Importing the XLSX library
import FilterPopup from "./FilterPopup";


const Close = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [initialsMap, setInitialsMap] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  // const [rowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchBoxVisible, setIsSearchBoxVisible] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [etaData, setEtaData] = useState({});
  const [sortOrder, setSortOrder] = useState("none"); // State for sorting
  const navigate = useNavigate();
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [copiedTicketNos, setCopiedTicketNos] = useState({});
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedEta, setSelectedEta] = useState("all");
  

  // Change the state variable name from filteredTickets to displayedTickets
const [displayedTickets, setDisplayedTickets] = useState([]);
const [isFilterPopupVisible, setIsFilterPopupVisible] = useState(false); // To toggle the visibility of the FilterPopup
  const [filters, setFilters] = useState({
  category: "all",  // Keeps track of the selected category
  selectedDate: "",
  selectedEta: "all", // Selected ETA filter
  fromDate: "",      // Added fromDate
  toDate: "",        // Added toDate
});

  // Fetch tickets from the API when the component mounts
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/tickets/mobile/${mobileNumber}/closed`);
        setTickets(response.data); // Store the tickets in state
        setDisplayedTickets(response.data); // Initially, no filters applied, so show all tickets
      } catch (error) {
        console.error("Failed to fetch tickets:", error);
      }
    };

    fetchTickets();
  }, []);
  // Apply filters to the tickets
  const applyFilters = (newFilters) => {
  setFilters(newFilters);  // Update filters

  let filteredTickets = [...tickets]; // Copy original tickets

  // Apply category filter
  if (newFilters.category !== "all") {
    filteredTickets = filteredTickets.filter(
      (ticket) => ticket.issueCategory === newFilters.category
    );
  }

  // Apply date range filter (fromDate and toDate)
  if (newFilters.fromDate && newFilters.toDate) {
    filteredTickets = filteredTickets.filter((ticket) => {
      const ticketDate = new Date(ticket.createdDate);
      const start = new Date(newFilters.fromDate);
      const end = new Date(newFilters.toDate);
      return ticketDate >= start && ticketDate <= end;
    });
  }

  // Apply ETA filter
  if (newFilters.selectedEta !== "all") {
    const etaMapping = {
      "0-2": 2,
      "2-4": 4,
      "4+": Infinity,
    };
    const [minEta, maxEta] = newFilters.selectedEta.split("-").map(Number);
    filteredTickets = filteredTickets.filter((ticket) => {
      const etaDays = ticket.eta || 0;
      return etaDays >= minEta && etaDays <= maxEta;
    });
  }

  // Update displayed tickets with the filtered tickets
  setDisplayedTickets(filteredTickets);
};



  const mobileNumber = localStorage.getItem("loggedInUserMobileNumber");
  
  
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

  //for pages 
  const handleRowsPerPageChange = (e) => {
  setRowsPerPage(Number(e.target.value));
};
  // for search handling
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
    matchesQuery(ticket.ticketNo) ||                   // Ticket Number
    matchesQuery(
      new Date(ticket.createdDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    ) ||                                               // Created Date
    matchesQuery(ticket.time) ||                       // Time
    matchesQuery(ticket.issueCategory) ||              // Category
    matchesQuery(ticket.issueDescription) ||           // Issue Description
    matchesQuery(etaData[ticket.createdDate]?.days)    // ETA Days
  );
});
useEffect(() => {
  // When tickets or searchQuery changes, update displayedTickets
  setDisplayedTickets(filteredTickets);
}, [tickets, searchQuery]);

  // Fetch tickets on component mount
  useEffect(() => {
    const fetchTickets = async () => {
      if (!mobileNumber) return setLoading(false);

      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_API_URL
          }/tickets/mobile/${mobileNumber}/closed`
        );
        setTickets(response.data);
        await fetchInitials(response.data); // Fetch initials for tickets
      } catch (error) {
        setError("Failed to fetch tickets.");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [mobileNumber]);

  // Fetch ETAs for the tickets
  useEffect(() => {
    const fetchETAs = async () => {
      if (!mobileNumber) return;

      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_API_URL
          }/tickets/eta-by-mobile/${mobileNumber}`
        );
        const etaResults = {};

        response.data.tickets.forEach((eta) => {
          const totalHours = eta.totalHours;
          const totalDays = eta.totalDays;
          etaResults[eta.ticketId] =
            totalHours > 24 ? `${totalDays} days` : `${totalHours} hours`;
        });
        setEtaData(etaResults);
      } catch (error) {
        setError("Failed to fetch ETAs.");
      }
    };

    fetchETAs();
  }, [mobileNumber]);

  // Fetch initials based on tickets
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

  const handleSearchToggle = () => {
    setIsSearchBoxVisible(!isSearchBoxVisible);
  };

  // const handleSearch = (event) => {
  //   setSearchQuery(event.target.value);
  //   setCurrentPage(1);
  // };
  //New date formate 
  const formdate = (date) => {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
};

  // Download functionality for tickets
  const handleDownload = async (ticket, format) => {
  console.log("Ticket for download:", ticket); // Check the ticket object
  console.log("Ticket No for download:", ticket.ticketNo); // Check ticketNo

  if (!ticket.ticketNo) {
    console.error("Ticket No is undefined. Cannot proceed with download.");
    return; // Prevent API call if ticketNo is undefined
  }

  if (format === "excel") {
    try {
      // Fetch ticket details from the API
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/ticket-details/${ticket.ticketNo}`);
      const ticketDetails = response.data; // Assuming the response is the ticket object
      // Debugging: Check the totalDays value directly from the API response
      console.log("Ticket Details (ETA Total Days):", ticketDetails.eta.totalDays);// Ensure totalDays is valid or fallback to 0
      const totalDays = (ticketDetails.eta && ticketDetails.eta.totalDays !== undefined && ticketDetails.eta.totalDays !== null && !isNaN(ticketDetails.eta.totalDays)) 
        ? ticketDetails.eta.totalDays
        : 0;

      // Debugging the final value being used for totalDays
      console.log('Final Total Days to display:', totalDays);

// Debugging the value being used
console.log('Total Days to display:', totalDays);


      // Prepare the worksheet data (as before)
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
          ticketDetails.ticketId,                // Ticket No
          ticketDetails.name,                     // Name
          ticketDetails.contactNumber,            // Contact Number
          ticketDetails.email,                    // Email
          ticketDetails.companyName,              // Company Name
          ticketDetails.issueCategory || "N/A",   // Issue Category (fallback to "N/A" if undefined)
          ticketDetails.issueDescription,         // Issue Description
          ticketDetails.resolution,               // Resolution
          ticketDetails.preventiveAction,         // Preventive Action
          ticketDetails.warrantyCategory,         // Warranty Category
          ticketDetails.status,                   // Status
          formatDate(new Date(ticketDetails.date)), // Date
          ticketDetails.time,                     // Time
          ticketDetails.engineerName,             // Engineer Name
          formatDate(new Date(ticketDetails.closeDate)), // Close Date
          // Fallback to 0 if totalDays is undefined or null
          totalDays,
                  ],
      ];

      // Create the Excel worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets");

      // Trigger the download
      XLSX.writeFile(workbook, `${ticketDetails.ticketId}_details.xlsx`);

      // Log the response data for debugging purposes
      console.log("Excel Data:", worksheetData);

    } catch (error) {
      console.error("Error fetching ticket details:", error);
    }
  } else {
    // If not Excel, handle PDF generation logic (not included here)
    const eta = etaData[ticket.ticketNo] || "N/A";
    const createdDate = formatDate(new Date(ticket.createdDate));
    console.log("ETA:", eta);
    console.log("Created Date:", createdDate);

    localStorage.setItem("ticketETA", eta);
    localStorage.setItem("ticketCreatedDate", createdDate);

    // Call the function to generate PDF (this part is not shown)
    generateServiceTicketPDF(ticket.ticketNo, eta, createdDate);
  }
};


  

  // Sort tickets based on the sort order
  const sortedTickets = [...filteredTickets].sort((a, b) => {
    if (sortOrder === "date") {
      return new Date(b.createdDate) - new Date(a.createdDate);
    } else if (sortOrder === "category") {
      return a.issueCategory.localeCompare(b.issueCategory);
    }
    return 0; // No sorting
  });

  const totalEntries = sortedTickets.length;
  const indexOfLastTicket = currentPage * rowsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - rowsPerPage;
  const currentTickets = sortedTickets.slice(
    indexOfFirstTicket,
    indexOfLastTicket
  );
  const totalPages = Math.ceil(totalEntries / rowsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleCheckboxChange = (ticketNo) => {
    const updatedSelectedTickets = new Set(selectedTickets);
    updatedSelectedTickets.has(ticketNo)
      ? updatedSelectedTickets.delete(ticketNo)
      : updatedSelectedTickets.add(ticketNo);
    setSelectedTickets(updatedSelectedTickets);
  };

  const formatDate = (date) => {
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return date.toLocaleDateString("en-GB", options);
  };

  const getEtaBackgroundColor = (days) => {
    if (days >= 0 && days < 2) return "bg-green-100";
    if (days >= 2 && days < 4) return "bg-yellow-100";
    if (days >= 4) return "bg-red-400";
    return "";
  };

  const handleFilterClick = () => {
    setSortOrder((prevOrder) =>
      prevOrder === "none" || prevOrder === "category" ? "date" : "category"
    );
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
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
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchBoxVisible]);
  
  
  return (
    <div className="flex flex-col mt-20 ml-32 h-full w-[88%]">
      <div className="flex justify-between items-center bg-white h-20">
        <div className="flex items-center mb-4">
          <span
            className="mt-2 font-poppins"
            style={{
              // fontFamily: "Roboto",
              fontSize: "18px",
              fontWeight: "400",
              lineHeight: "28px",
              color: "#343A40",
            }}
          >
            All ({totalEntries})
          </span>
          {/* <img src="/arrow.png" alt="Arrow" className="ml-0 h-8 w-8 mt-2" /> */}
        </div>

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
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearch}
                className="border rounded px-2 py-1 search-input font-poppins"
                
              />
            )}
          </div>
          <img src="/setting.png" alt="Setting Icon" className="h-7 w-7" />
          <img
            src="/filter.png"
            alt="Filter Icon"
            className="h-7 w-7 cursor-pointer"
            onClick={() => setIsFilterPopupVisible(true)}
          />
        {isFilterPopupVisible && (
  <FilterPopup
    closePopup={() => setIsFilterPopupVisible(false)} // Close the filter popup
    onApplyFilters={applyFilters}  // Apply the filters
    currentFilters={filters}  // Pass the current filters to the popup
  />
)}

        </div>
      </div>

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
                                      currentTickets.map(
                                        (ticket) => ticket.ticketNo
                                      )
                                    )
                                  : new Set()
                              );
                            }}
                          />
                        
                      </th>
                      {[
                        "Ticket No.",
                        "Date",
                        "Time",
                        "Category",
                        "Issue Description",
                        "ETA",
                        "Preview",
                        "Chat",
                        "Download",
                        "Track",
                      ].map((header) => (
                        <th
                          key={header}
                          className="px-4 py-2 font-poppins text-[#343A40] text-[14px] font-[700] leading-[22px] text-center"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
<tbody>
  {displayedTickets
    .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
    .map((ticket) => {
      const eta = etaData[ticket.ticketNo] || "N/A";
      const etaBackgroundColor = getEtaBackgroundColor(
        eta.includes("days") ? parseInt(eta) : 0
      );
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
                          <td className="whitespace-nowrap px-2 py-2 font-poppins-light text-neutral-900 text-center ">
                            <div className="flex items-center gap-2 justify-center">
                              <span className="text-[13px] font-poppins">
                                {ticket.ticketNo}
                              </span>
                              <button
                                onClick={() => copyToClipboard(ticket.ticketNo)} // Use the custom function here
                                className="ml-2 p-0 rounded-md transition duration-200 ease-in-out hover:bg-gray-200"
                                style={{ width: "12px", height: "12px" }}
                              >
                                <img
                                  src={copiedTicketNos[ticket.ticketNo] ? "/copy_green.png" : "/copy.png"}
                                  alt="Copy Icon"
                                  className="h-full w-full object-contain"
                                />
                              </button>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-2 py-2 font-poppins text-neutral-900 text-center">
                            {formatDate(new Date(ticket.createdDate))}
                          </td>
                          <td className="whitespace-nowrap px-2 py-2 font-poppins text-neutral-900 text-center">
                            {ticket.time}
                          </td>
                          <td className="whitespace-nowrap px-2 py-2 font-poppins text-neutral-900 text-center">
                            {ticket.issueCategory}
                          </td>
                          <td className="whitespace-nowrap px-2 py-2 font-poppins text-neutral-900 text-center">
                            {ticket.issueDescription}
                          </td>
                          <td
                            className={`whitespace-nowrap px-2 py-2 font-poppins text-neutral-900 text-center ${etaBackgroundColor}`}
                          >
                            {eta}
                          </td>
                          <td className="whitespace-nowrap px-2 py-2 font-poppins text-neutral-900">
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
                          <td className="whitespace-nowrap px-2 py-2 font-poppins text-neutral-900">
                            <div className="flex justify-center">
                              <img
                                src="/chat.png"
                                alt="Chat"
                                className="h-7 w-7"
                              />
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-2 py-2 font-poppins text-neutral-900">
                            <div className="flex justify-center items-center gap-2">
                              <img
                                src="/excel.png"
                                alt="Excel"
                                className="h-6 w-6 cursor-pointer"
                                onClick={() => handleDownload(ticket, "excel")}
                              />
                              <img
                                src="/pdf.png"
                                alt="PDF"
                                className="h-6 w-6 cursor-pointer"
                                onClick={() => handleDownload(ticket)}
                              />
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-2 py-2 font-poppins text-neutral-900">
                            <div className="flex justify-center">
                              <img
                                src="/track.png"
                                alt="Track"
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
                <div className="flex justify-between items-center mt-4">
                  
                  <div className="font-poppins">
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
                    <span className="font-poppins">
                      Showing {currentPage} of {totalPages} pages
                    </span>
                  </div>
                  <div className="flex items-center ml-20 gap-3">
                    <div className=" w-[30px] h-[30px] flex items-center justify-center">
                      <img
                        src="/previous.png"
                        alt="Left Arrow"
                        className="cursor-pointer h-[30px]"
                        onClick={() =>
                          currentPage > 1 && paginate(currentPage - 1)
                        }
                      />
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, index) => (
                        <button
                          key={index + 1}
                          onClick={() => paginate(index + 1)}
                          className={`w-[30px] h-[30px] rounded-l-[2px] cursor-pointer ${
                            currentPage === index + 1
                              ? "bg-[#DC3545] text-white"
                              : "bg-[#DFDFDF]"
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>
                    <div className=" w-[30px] h-[30px] flex items-center justify-center">
                      <img
                        src="/next.png"
                        alt="Right Arrow"
                        className="cursor-pointer h-[30px]"
                        onClick={() =>
                          currentPage < totalPages && paginate(currentPage + 1)
                        }
                      />
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

export default Close;
