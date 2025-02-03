import React, { useState, useEffect } from "react";
import axios from "axios";
import generateServiceTicketOpenAdminPDF from "./pdfGeneratoropenadmin";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx"; // Importing the XLSX library
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
  const [sortOrder, setSortOrder] = useState("none"); // State for sorting
  const navigate = useNavigate();
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [copiedTicketNos, setCopiedTicketNos] = useState({});
  const [modalOpen, setModalOpen] = useState(false); // To control modal visibility
  const [selectedTicket, setSelectedTicket] = useState(null); // To store the selected ticket details

  const formatDate = (date) => {
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return date.toLocaleDateString("en-GB", options);
  };
  // Change the state variable name from filteredTickets to displayedTickets
  const [displayedTickets, setDisplayedTickets] = useState([]);
  // Fetch tickets from the API when the component mounts
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        // Fetch tickets from the API
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/tickets/open`
        );

        // Sort tickets by date and time in descending order (most recent first)
        const sortedTickets = response.data.sort((a, b) => {
          // Combine date and time into a Date object for comparison
          const aDateTime =
            new Date(`${a.date.split("T")[0]}T${a.time}`).getTime() || 0;
          const bDateTime =
            new Date(`${b.date.split("T")[0]}T${b.time}`).getTime() || 0;

          // Sort by newest first
          return bDateTime - aDateTime;
        });

        // Store sorted tickets in both states
        setTickets(sortedTickets); // To store all fetched and sorted tickets
        setDisplayedTickets(sortedTickets); // To display all sorted tickets initially
      } catch (error) {
        console.error("Failed to fetch tickets:", error);
      }
    };

    fetchTickets();
  }, []);

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
          setTimeout(() => {
            setCopiedTicketNos((prev) => ({ ...prev, [text]: false }));
          }, 2000);
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
  // Modify the handleSearch function
  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Update the filteredTickets logic
  const filteredTickets = tickets.filter((ticket) => {
    const searchTerm = searchQuery.toLowerCase().trim();

    // If search is empty, return all tickets
    if (!searchTerm) return true;

    // Create an object with all searchable fields
    const searchableFields = {
      ticketNo: ticket.ticketNo?.toString().toLowerCase() || "",
      name: ticket.name?.toLowerCase() || "",
      companyName: ticket.companyName?.toLowerCase() || "",
      issueCategory: ticket.issueCategory?.toLowerCase() || "",
      date: formatDate(new Date(ticket.date))?.toLowerCase() || "",
      eta: etaData[ticket.ticketNo]?.toLowerCase() || "",
    };

    // Return true if any field contains the search term
    return Object.values(searchableFields).some((value) =>
      value.includes(searchTerm)
    );
  });

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
    console.log("Ticket for download:", ticket); // Check the ticket object
    console.log("Ticket No for download:", ticket.ticketNo); // Check ticketNo

    if (!ticket.ticketNo) {
      console.error("Ticket No is undefined. Cannot proceed with download.");
      return; // Prevent API call if ticketNo is undefined
    }

    if (format === "excel") {
      try {
        // Fetch ticket details from the API
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/ticket-details/${ticket.ticketNo}`
        );
        const ticketDetails = response.data; // Assuming the response is the ticket object
        // Debugging: Check the totalDays value directly from the API response
        console.log(
          "Ticket Details (ETA Total Days):",
          ticketDetails.eta.totalDays
        ); // Ensure totalDays is valid or fallback to 0
        const totalDays =
          ticketDetails.eta &&
          ticketDetails.eta.totalDays !== undefined &&
          ticketDetails.eta.totalDays !== null &&
          !isNaN(ticketDetails.eta.totalDays)
            ? ticketDetails.eta.totalDays
            : 0;

        // Debugging the final value being used for totalDays
        console.log("Final Total Days to display:", totalDays);

        // Debugging the value being used
        console.log("Total Days to display:", totalDays);

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
            ticketDetails.ticketId, // Ticket No
            ticketDetails.name, // Name
            ticketDetails.contactNumber, // Contact Number
            ticketDetails.email, // Email
            ticketDetails.companyName, // Company Name
            ticketDetails.issueCategory || "N/A", // Issue Category (fallback to "N/A" if undefined)
            ticketDetails.issueDescription, // Issue Description
            ticketDetails.resolution, // Resolution
            ticketDetails.preventiveAction, // Preventive Action
            ticketDetails.warrantyCategory, // Warranty Category
            ticketDetails.status, // Status
            formatDate(new Date(ticketDetails.date)), // Date
            ticketDetails.time, // Time
            ticketDetails.engineerName, // Engineer Name
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

      generateServiceTicketOpenAdminPDF(ticket.ticketNo, eta, createdDate);
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
                autoFocus
              />
            )}
          </div>
          <img src="/setting.png" alt="Setting Icon" className="h-7 w-7" />
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
                        "Name",
                        "Company Name",
                        "Issue Category",
                        "Date",
                        "Time",
                        "Preview/Assign",
                        "Download",
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
                      .slice(
                        (currentPage - 1) * rowsPerPage,
                        currentPage * rowsPerPage
                      )
                      .map((ticket) => {
                        const eta = etaData[ticket.ticketNo] || "N/A";

                        // Determine the background color based on ticket status
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
                            <td className="whitespace-nowrap px-2 py-2 font-poppins text-neutral-900 text-center">
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

export default OpenticketAdmin;
