import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import PopUpForm from "./PopUpForm";
import generateServiceTicketPDF from "./pdfGenerator";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import FilterPopup from "../Close/FilterPopup";
import L from "leaflet"; // Import Leaflet
import "leaflet/dist/leaflet.css"; // Import Leaflet CSS



// Define custom icons
const homeIcon = L.icon({
  iconUrl: "/home-icon.png", // Add your home icon image
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const officeIcon = L.icon({
  iconUrl: "/office-icon.png", // Add your office icon image
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const bikerIcon = L.icon({
  iconUrl: "/biker-icon.png",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});


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
  const [map, setMap] = useState(null);
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
  const [trackingDetails, setTrackingDetails] = useState(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  // const mapRef = useRef(null); // Ref for Leaflet map
  // const [mapInitialized, setMapInitialized] = useState(false); // Track if map is initialized
  const [bikerMarker, setBikerMarker] = useState(null);
  const mapRef = useRef(null); // Ref for Leaflet map

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
  };

  const copyToClipboard = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setCopiedTicketNos((prev) => ({ ...prev, [text]: true }));
          setTimeout(() => {
            setCopiedTicketNos((prev) => ({ ...prev, [text]: false }));
          }, 2000);
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
          setTimeout(() => {
            setCopiedTicketNos((prev) => ({ ...prev, [text]: false }));
          }, 2000);
        }
      } catch (err) {
        console.error("Error copying text: ", err);
      } finally {
        document.body.removeChild(textArea);
      }
    }
  };

  const [filters, setFilters] = useState({
    category: "all",
    selectedDate: "",
    selectedEta: "all",
    fromDate: "",
    toDate: "",
  });

  const [displayedTickets, setDisplayedTickets] = useState([]);
  const [isFilterPopupVisible, setIsFilterPopupVisible] = useState(false);

  const paginatedTickets = tickets.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const mobileNumbers = localStorage.getItem("loggedInUserMobileNumber");

  const handleExcelDownload = () => {
    const ticketsToDownload =
      selectedTickets.size === currentTickets.length
        ? filteredTickets
        : filteredTickets.filter((ticket) =>
            selectedTickets.has(ticket.ticketNo)
          );

    const worksheet = XLSX.utils.json_to_sheet(ticketsToDownload);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets");

    const fileName = `tickets_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(event.target)
      ) {
        setIsSearchBoxVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

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
          setTickets(response.data);
          setDisplayedTickets(response.data);
          await fetchInitials(response.data);
          setLoading(false);
        } catch (error) {
          setError("Failed to fetch tickets.");
          setLoading(false);
        }
      };

      fetchTickets();
      fetchEtaData(mobileNumbers);
      const intervalId = setInterval(() => {
        fetchEtaData(mobileNumbers);
      }, 500);

      return () => clearInterval(intervalId);
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
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase().trim();

    const matchesQuery = (value) =>
      value && value.toString().toLowerCase().includes(query);

    return (
      matchesQuery(ticket.ticketNo) ||
      matchesQuery(
        new Date(ticket.createdDate).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      ) ||
      matchesQuery(ticket.time) ||
      matchesQuery(ticket.issueCategory) ||
      matchesQuery(ticket.issueDescription) ||
      matchesQuery(etaData[ticket.createdDate]?.days)
    );
  });

  useEffect(() => {
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

    if (selectedCategories.length > 0) {
      filteredResults = filteredResults.filter((ticket) =>
        selectedCategories.includes(ticket.issueCategory)
      );
    }

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

    if (dateRange.from || dateRange.to) {
      filteredResults = filteredResults.filter((ticket) => {
        const ticketDate = new Date(ticket.createdDate);
        const fromDate = dateRange.from ? new Date(dateRange.from) : null;
        const toDate = dateRange.to ? new Date(dateRange.to) : null;

        if (toDate) {
          toDate.setDate(toDate.getDate() + 1);
        }

        if (ticketDate) ticketDate.setHours(0, 0, 0, 0);
        if (fromDate) fromDate.setHours(0, 0, 0, 0);
        if (toDate) toDate.setHours(0, 0, 0, 0);

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

  const handleFilterChange = (field, value) => {
    setFilterCriteria((prev) => ({
      ...prev,
      [field]: value,
    }));
    setCurrentPage(1);
  };

  const handleBulkExcelDownload = async () => {
    try {
      const allTicketDetails = [];

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

      for (const ticketNo of selectedTickets) {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/ticket-details/${ticketNo}`
        );
        const ticket = response.data;
        
        const totalDays = ticket.eta?.totalDays ?? 0;

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

      const worksheet = XLSX.utils.aoa_to_sheet(allTicketDetails);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets");

      XLSX.writeFile(workbook, `tickets_${new Date().getTime()}.xlsx`);

    } catch (error) {
      console.error("Error downloading tickets:", error);
      alert("Error downloading tickets. Please try again.");
    }
  };

  const handleBulkPdfDownload = async () => {
    try {
      for (const ticketNo of selectedTickets) {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/ticket-details/${ticketNo}`
          );
          const ticket = response.data;

          const totalDays = ticket.eta?.totalDays ?? 0;
          const createdDate = formatDate(new Date(ticket.date));

          localStorage.setItem("ticketETA", totalDays);
          localStorage.setItem("ticketCreatedDate", createdDate);

          generateServiceTicketPDF(ticketNo);

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
useEffect(() => {
    if (isTrackingModalOpen && trackingDetails && !mapRef.current) {
      // Add CSS to hide attribution
      const style = document.createElement('style');
      style.textContent = '.leaflet-control-attribution.leaflet-control { display: none; }';
      document.head.appendChild(style);

      const newMap = L.map("map", {
        center: [
          trackingDetails.companyCoordinates.lat,
          trackingDetails.companyCoordinates.lon,
        ],
        zoom: 12,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: ''
      }).addTo(newMap);

      // Create point coordinates
      const startPoint = [trackingDetails.companyCoordinates.lat, trackingDetails.companyCoordinates.lon];
      const endPoint = [trackingDetails.engineerCoordinates.lat, trackingDetails.engineerCoordinates.lon];

      // Add markers with custom icons
      L.marker(startPoint, { icon: homeIcon })
        .addTo(newMap)
        .bindPopup("Starting Point: Company Location");

      L.marker(endPoint, { icon: officeIcon })
        .addTo(newMap)
        .bindPopup("Ending Point: Engineer Location");

      // Create the polyline
      const path = L.polyline([startPoint, endPoint], {
        color: '#2196F3',
        weight: 5,
        opacity: 0.8
      }).addTo(newMap);

      // Fit bounds with padding
      const bounds = path.getBounds();
      newMap.fitBounds(bounds, { padding: [50, 50] });

      mapRef.current = newMap; // Store the map instance in the ref
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isTrackingModalOpen, trackingDetails]);

  const handleTrackClick = async (ticketNo) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/operator-ticket-estimate`,
        {
          mobile: mobileNumbers,
        }
      );
      setTrackingDetails(response.data);
      setIsTrackingModalOpen(true);
    } catch (error) {
      console.error("Error fetching tracking details:", error);
      alert("Failed to fetch tracking details. Please try again.");
    }
  };
  // Add this utility functions
L.GeometryUtil = L.extend(L.GeometryUtil || {}, {
  length: function(line) {
    let length = 0;
    const coords = line.getLatLngs();
    for (let i = 0; i < coords.length - 1; i++) {
      length += coords[i].distanceTo(coords[i + 1]);
    }
    return length;
  },
  interpolateOnLine: function(map, line, ratio) {
    const coords = line.getLatLngs();
    const point = L.GeometryUtil.interpolateOnPointSegment(
      coords[0],
      coords[1],
      ratio
    );
    return {
      latLng: L.latLng(point.lat, point.lng)
    };
  },
  interpolateOnPointSegment: function(p1, p2, ratio) {
    return {
      lat: p1.lat + (p2.lat - p1.lat) * ratio,
      lng: p1.lng + (p2.lng - p1.lng) * ratio
    };
  }
});
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
            <div className="h-full mx-2 border-1 border-white" />
            <button
              onClick={handleBulkPdfDownload}
              className="text-white flex items-center gap-2 border-l border-white pl-2.5"
            >
              <img src="/pdf.png" alt="PDF" className="h-5 w-5" />
            </button>
          </div>
        )}
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
                placeholder="Enter Ticket Number or keyword"
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

                        const ticketStatusCircleColor =
                          ticket.status === "In-Progress"
                            ? "bg-orange-500"
                            : "";

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

                            <td className="whitespace-nowrap px-2 py-2 font-medium text-neutral-900 text-center">
                              <div className="flex justify-center">
                                <img
                                  src="/chat.png"
                                  alt="chat"
                                  className="h-7 w-7"
                                />
                              </div>
                            </td>

                            <td className="whitespace-nowrap px-2 py-2 font-medium text-neutral-900 text-center">
                              <div className="flex justify-center items-center gap-2">
                                <img
                                  src="/excel.png"
                                  alt="Excel"
                                  className="h-6 w-6 cursor-pointer"
                                  onClick={handleExcelDownload}
                                />

                                <img
                                  src="/pdf.png"
                                  alt="PDF"
                                  className="h-6 w-6 cursor-pointer"
                                  onClick={() => handleDownload(ticket)}
                                />
                              </div>
                            </td>

                            <td className="whitespace-nowrap px-2 py-2 font-medium text-neutral-900 text-center">
                              <div className="flex justify-center">
                                {ticket.status === "In-Progress" && (
                                  <img
                                    src="/track.png"
                                    alt="Track"
                                    className="h-7 w-7 cursor-pointer"
                                    onClick={() => handleTrackClick(ticket.ticketNo)}
                                  />
                                )}
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
                {isTrackingModalOpen && trackingDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-[90%] md:w-[600px] p-6">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-poppins font-semibold">
                Tracking Details
              </h2>
              <button
                onClick={() => setIsTrackingModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 font-bold text-2xl"
              >
                ×
              </button>
            </div>

            {/* Map Section */}
            <div className="relative h-64 mb-6 rounded-lg overflow-hidden">
              <div id="map" className="w-full h-full bg-gray-200"></div>
            </div>

            {/* Tracking Details Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="font-poppins">
                  <span className="font-semibold">Ticket Number:</span>{" "}
                  {trackingDetails.ticketNumber}
                </p>
                <p className="font-poppins">
                  <span className="font-semibold">Engineer Name:</span>{" "}
                  {trackingDetails.engineerName}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <p className="font-poppins">
                  <span className="font-semibold">Distance:</span>{" "}
                  {trackingDetails.distanceKm} km
                </p>
                <p className="font-poppins">
                  <span className="font-semibold">Estimated Time:</span>{" "}
                  {trackingDetails.estimatedTimeInHours} hours
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
                <div className="flex justify-between items-center mt-4 ">
                  <div className="font-poppins font-light">
                    <span className="mr-2">Showing</span>
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