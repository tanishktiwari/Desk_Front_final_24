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
  const applyFilters = (newFilters) => {
    setFilters(newFilters); // Update filters

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
      }, 10000); // Re-fetch every 10 seconds

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
    const options = { day: "2-digit", month: "short", year: "numeric" };
    let dateString = date.toLocaleDateString("en-GB", options);
    const [day, month, year] = dateString.split(" ");
    return `${day} ${month.slice(0, 3)} ${year}`;
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

  return (
    <div className="flex flex-col mt-20 ml-32 h-full w-[88%]">
      <div className="flex justify-between items-center bg-white h-20">
        <div className="flex items-center mb-4">
          <span
            style={{
              fontFamily: "Poppins",
              fontSize: "18px",
              fontWeight: "400",
              lineHeight: "28px",
              textAlign: "left",
              color: "#343A40",
            }}
            className="mt-2 ml-3"
          >
            All ({totalEntries})
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

          <img src="/setting.png" alt="setting_icon" className="h-7 w-7" />
          <img
            src="/filter.png"
            alt="Filter Icon"
            className="h-7 w-7 cursor-pointer"
            onClick={() => setIsFilterPopupVisible(true)}
          />
          {isFilterPopupVisible && (
            <FilterPopup
              closePopup={() => setIsFilterPopupVisible(false)} // Close the filter popup
              onApplyFilters={applyFilters} // Apply the filters
              currentFilters={filters} // Pass the current filters to the popup
            />
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
      const eta = etaData[ticket.createdDate] || { days: 0, hours: 0 };

      // Determine background color based on ticket status
      const ticketStatusCircleColor =
        ticket.status === "In-Progress" ? "bg-orange-500" : ""; // Orange for "In-Progress"

      return (
        <tr
          key={ticket.ticketNo}
          className="border-b border-neutral-200 bg-white transition duration-300 ease-in-out hover:bg-neutral-100"
        >
          <td className="whitespace-nowrap px-2 py-2 font-medium text-neutral-900 font-poppins">
            <input
              type="checkbox"
              checked={selectedTickets.has(ticket.ticketNo)}
              onChange={() => handleCheckboxChange(ticket.ticketNo)}
            />
          </td>

          <td className={`whitespace-nowrap px-2 py-2 font-medium text-neutral-900 text-center`}>
            <div
              className="flex items-center justify-center gap-2 relative"
              onMouseEnter={() => ticket.status === "In-Progress" && handleTooltipVisibility(ticket.ticketNo)} // Show tooltip only if "In-Progress"
              onMouseLeave={() => handleTooltipHide(ticket.ticketNo)} // Hide tooltip
            >
              <span
                className={`w-3.5 h-3.5 rounded-full ${ticketStatusCircleColor}`}
              ></span>
              {tooltipVisible[ticket.ticketNo] && ticket.status === "In-Progress" && (
                <div
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-gray-800 text-white text-sm rounded-md"
                  style={{ zIndex: 10 }}
                >
                  {ticket.status} {/* Tooltip will display the status */}
                </div>
              )}
              <span className="text-[13px] font-poppins">{ticket.ticketNo}</span>

              {/* Copy Button */}
              <button
                onClick={() => copyToClipboard(ticket.ticketNo)}
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
                <div className="flex justify-between items-center mt-4">
                  <div className="font-poppins">
                    <span className="mr-2 font-poppins">Showing</span>
                    {/* Rows per page dropdown */}
                    <select
                      onChange={handleRowsPerPageChange}
                      value={rowsPerPage}
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                    <span className="ml-2 font-poppins">rows per page</span>
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

export default Open;
