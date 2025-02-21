import React, { useState, useEffect, useRef } from 'react';
import { Calendar } from 'lucide-react';
import axios from 'axios';

const ClosedTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const modalRef = useRef();
  const datePickerRef = useRef();
  const ticketsPerPage = 10;

  const loggedInEngineerMobileNumber = localStorage.getItem("loggedInEngineerMobileNumber");

  useEffect(() => {
    if (loggedInEngineerMobileNumber) {
      fetchTickets(loggedInEngineerMobileNumber);
    }
  }, [loggedInEngineerMobileNumber]);

  const fetchTickets = async (mobileNumber) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/tickets/engineer`, {
        params: { mobile: mobileNumber }
      });
      const inProgressTickets = response.data.filter(ticket => ticket.status === "Closed");
      setTickets(inProgressTickets);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
  };

  const categories = [...new Set(tickets.map(ticket => ticket.issueCategory.name))];
  const companies = [...new Set(tickets.map(ticket => ticket.companyName))];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsDatePickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = (ticket.ticketId && ticket.ticketId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ticket.companyName && ticket.companyName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategories = selectedCategories.length === 0 || 
      selectedCategories.includes(ticket.issueCategory.name);

    const matchesCompanies = selectedCompanies.length === 0 || 
      selectedCompanies.includes(ticket.companyName);

    const ticketDate = new Date(ticket.date);
    const fromDate = dateRange.from ? new Date(dateRange.from) : null;
    const toDate = dateRange.to ? new Date(dateRange.to) : null;

    const matchesDateRange = (!fromDate || ticketDate >= fromDate) && 
      (!toDate || ticketDate <= toDate);

    return matchesSearch && matchesCategories && matchesCompanies && matchesDateRange;
  });

  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = filteredTickets.slice(indexOfFirstTicket, indexOfLastTicket);

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleCompanyToggle = (company) => {
    setSelectedCompanies(prev => 
      prev.includes(company)
        ? prev.filter(c => c !== company)
        : [...prev, company]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedCompanies([]);
    setDateRange({ from: '', to: '' });
  };

  const DateRangePicker = () => (
    <div className="relative">
      <div
        className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer"
        onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
      >
        <Calendar className="w-5 h-5 text-gray-500" />
        <span className="text-gray-700">
          {dateRange.from || dateRange.to
            ? `${dateRange.from || 'Start'} - ${dateRange.to || 'End'}`
            : 'Select Date Range'}
        </span>
      </div>
      
      {isDatePickerOpen && (
        <div
          ref={datePickerRef}
          className="absolute z-10 mt-2 bg-white rounded-lg shadow-lg p-4 border"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const FilterModal = () => (
    isFilterOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div ref={modalRef} className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Filter Tickets</h2>
            <button
              onClick={() => setIsFilterOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            {/* Date Range Filter */}
            <div>
              <h3 className="text-sm font-medium mb-2">Date Range</h3>
              <DateRangePicker />
            </div>

            {/* Categories Filter */}
            <div>
              <h3 className="text-sm font-medium mb-2">Categories</h3>
              <div className="relative">
                <select
                  value=""
                  onChange={(e) => {
                    const selectedCategory = e.target.value;
                    if (selectedCategory && !selectedCategories.includes(selectedCategory)) {
                      setSelectedCategories([...selectedCategories, selectedCategory]);
                    }
                  }}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </div>
              {/* Display selected categories with remove option */}
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedCategories.map((category) => (
                  <div key={category} className="flex items-center bg-gray-100 rounded-md px-2 py-1">
                    <span>{category}</span>
                    <button
                      onClick={() => {
                        setSelectedCategories(selectedCategories.filter((cat) => cat !== category));
                      }}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Companies Filter */}
            <div>
              <h3 className="text-sm font-medium mb-2">Companies</h3>
              <div className="relative">
                <select
                  value={selectedCompanies[0] || ''}
                  onChange={(e) => setSelectedCompanies([e.target.value])}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select a company</option>
                  {companies.map((company) => (
                    <option key={company} value={company}>
                      {company}
                    </option>
                  ))}
                </select>
                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Clear Filters
              </button>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-md"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );

  // TicketCard Component for Mobile View
  const TicketCard = ({ ticket }) => (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex justify-between items-start mb-2">
        <span className="font-medium text-lg">{ticket.ticketId}</span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Date:</span>
          <span>{formatDate(ticket.date)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Category:</span>
          <span>{ticket.issueCategory.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Company:</span>
          <span>{ticket.companyName}</span>
        </div>
        <div className="flex justify-between">
        <span className="text-gray-600">ETA:</span>
        <span>
          {ticket.eta.exceeds24Hours 
            ? `${ticket.eta.totalDays} days`
            : `${ticket.eta.totalHours} hours`}
        </span>
      </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Status:</span>
          <span>{ticket.status}</span>
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={() => handleDownload(ticket._id, 'pdf')}
            className="px-3 py-1 text-sm text-blue-500 border border-blue-500 rounded hover:bg-blue-50"
          >
            PDF
          </button>
          <button
            onClick={() => handleDownload(ticket._id, 'excel')}
            className="px-3 py-1 text-sm text-green-500 border border-green-500 rounded hover:bg-green-50"
          >
            Excel
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Open Tickets</h1>

      {/* Search and Filter Section */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by Ticket No or Company Name"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="p-2 border rounded-lg flex-grow"
        />
        <div className="flex gap-2">
          <button
            onClick={() => setIsFilterOpen(true)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            More Filters
          </button>
        </div>
      </div>

      <FilterModal />

      {/* Table for Desktop View */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Ticket No</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Created Date</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Category</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Company Name</th>
               <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">ETA</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Download</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentTickets.map(ticket => (
              <tr key={ticket._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{ticket.ticketId}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{formatDate(ticket.date)}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{ticket.issueCategory.name}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{ticket.companyName}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
          {ticket.eta.exceeds24Hours 
            ? `${ticket.eta.totalDays} days`
            : `${ticket.eta.totalHours} hours`}
        </td>
                <td className="px-6 py-4 text-sm text-gray-900">{ticket.status}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <button
                    onClick={() => handleDownload(ticket._id, 'pdf')}
                    className="text-blue-500 hover:text-blue-700 mr-2"
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => handleDownload(ticket._id, 'excel')}
                    className="text-green-500 hover:text-green-700"
                  >
                    Excel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {currentTickets.map(ticket => (
          <TicketCard key={ticket._id} ticket={ticket} />
        ))}
      </div>
      {/* Pagination */}
      <div className="mt-6">
        <Pagination
          ticketsPerPage={ticketsPerPage}
          totalTickets={filteredTickets.length}
          paginate={setCurrentPage}
          currentPage={currentPage}
        />
      </div>
    </div>
  );
};

const Pagination = ({ ticketsPerPage, totalTickets, paginate, currentPage }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalTickets / ticketsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav>
      <ul className="flex space-x-2">
        {pageNumbers.map(number => (
          <li key={number}>
            <button
              onClick={() => paginate(number)}
              className={`px-3 py-1 rounded-lg ${
                currentPage === number
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-blue-500 hover:bg-gray-100'
              }`}
            >
              {number}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default ClosedTickets;