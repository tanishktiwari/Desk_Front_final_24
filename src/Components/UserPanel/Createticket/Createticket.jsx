import React, { useState, useEffect, useRef  } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../Createticket/CreateTicket.css"; // Custom styles

const CreateTicket = () => {
  const [issueCategories, setIssueCategories] = useState([]);
  const [initials, setInitials] = useState("");
  const [companyNames, setCompanyNames] = useState([]);
  const [operatorData, setOperatorData] = useState(null);

  const [managers, setManagers] = useState([
    { email: "", name: "", designation: "" },
  ]);
  const [showManagers, setShowManagers] = useState(false); // State to toggle manager input visibility
  const initialFormData = {
    name: "",
    number: "",
    email: "",
    issueCategory: "",
    companyName: "",
    image: null,
    description: "",
    date: new Date().toISOString().split("T")[0],
    time: new Date().toLocaleTimeString("it-IT", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
  const [formData, setFormData] = useState(initialFormData);

  const [isChecked, setIsChecked] = useState(true); // Default is checked
  const [errors, setErrors] = useState({});
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [ticketNumber, setTicketNumber] = useState("");
  const [timer, setTimer] = useState(10);
  const navigate = useNavigate();
  const [dateTime, setDateTime] = useState(new Date());
  const [imageName, setImageName] = useState("");
  const [fileNames, setFileNames] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleManagerChange = (index, e) => {
    const { name, value } = e.target;
    const updatedManagers = [...managers];
    updatedManagers[index][name] = value;
    setManagers(updatedManagers);
  };

  const addManager = () => {
    if (managers.length < 5) {
      setManagers([...managers, { email: "", name: "", designation: "" }]);
    }
  };

  const toggleManagers = () => {
    setShowManagers(!showManagers);
  };

  // Handle checkbox change
  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };
  useEffect(() => {
    const generateTicketNumber = async () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");

      // Get the latest ticket number stored in local storage
      const latestTicketNumber =
        localStorage.getItem("latestTicketNumber") || "000";
      const newTicketNumber = String(parseInt(latestTicketNumber) + 1).padStart(
        3,
        "0"
      );

      // Generate a ticket number string
      const ticketNumber = `FS${year}${month}${day}${newTicketNumber}`;

      // Check if the generated ticket number already exists in the database
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/tickets`
        );
        const existingTickets = response.data;

        // Check if any existing ticket has the same ticket number
        const isTicketNumberTaken = existingTickets.some(
          (ticket) => ticket.ticketNo === ticketNumber
        );

        if (isTicketNumberTaken) {
          // If the ticket number already exists, recursively call generateTicketNumber to create a new one
          return await generateTicketNumber();
        }

        // If the ticket number is unique, save the new ticket number to local storage and return it
        localStorage.setItem("latestTicketNumber", newTicketNumber);
        return ticketNumber;
      } catch (error) {
        console.error("Error checking existing tickets:", error);
        // In case of error, fallback to the generated ticket number without checking uniqueness
        return ticketNumber;
      }
    };

    // Set the generated ticket number in the state
    const fetchTicketNumber = async () => {
      const ticketNumber = await generateTicketNumber();
      setTicketNumber(ticketNumber);
    };

    fetchTicketNumber();
  }, []);

  useEffect(() => {
    const fetchIssueCategories = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/issue-categories`
        );
        setIssueCategories(response.data);
        console.log("Fetched Issue Categories:", response.data); // Log categories
      } catch (error) {
        console.error("Error fetching issue categories:", error);
      }
    };

    const fetchCompanyNames = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/companies`
        );
        setCompanyNames(response.data);
      } catch (error) {
        console.error("Error fetching company names:", error);
      }
    };

    fetchIssueCategories();
    fetchCompanyNames();
  }, []);
  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const generateTicketNumber = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const latestTicketNumber =
        localStorage.getItem("latestTicketNumber") || "000";
      const newTicketNumber = String(parseInt(latestTicketNumber) + 1).padStart(
        3,
        "0"
      );
      localStorage.setItem("latestTicketNumber", newTicketNumber);
      return `FS${year}${month}${day}${newTicketNumber}`;
    };

    setTicketNumber(generateTicketNumber());
  }, []);

  useEffect(() => {
    let timerInterval;
    if (showSuccessPopup) {
      timerInterval = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            clearInterval(timerInterval);
            navigate("/dashboard/open");
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerInterval);
  }, [showSuccessPopup, navigate]);

  useEffect(() => {
    const mobileNumber = localStorage.getItem("loggedInUserMobileNumber");
    if (mobileNumber) {
      const fetchOperatorData = async () => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/operators/mobile/${mobileNumber}`
          );
          setOperatorData(response.data);

          if (response.data) {
            setFormData((prevState) => ({
              ...prevState,
              name: response.data.operatorName,
              number: response.data.contactNumber || mobileNumber,
              email: response.data.email,
              companyName: response.data.companyName || "",
            }));

            // Determine which API to call based on operatorName
            const names = response.data.operatorName.split(" ");
            let initialsApiUrl;

            if (names.length > 1) {
              // Both first and last name
              initialsApiUrl = `${
                import.meta.env.VITE_API_URL
              }/operators/initials/${mobileNumber}`;
            } else {
              // Only first name
              initialsApiUrl = `${
                import.meta.env.VITE_API_URL
              }/operators/initials-two/${mobileNumber}`;
            }

            // Fetch initials
            const initialsResponse = await axios.get(initialsApiUrl);
            setInitials(initialsResponse.data.initials); // Store initials in state
          }
        } catch (error) {
          console.error("Error fetching operator data:", error);
        }
      };

      fetchOperatorData();
    } else {
      console.error("No mobile number found in local storage.");
    }
  }, []);

  const handleInputChange = (event) => {
    const { id, value } = event.target;
    setFormData((prevState) => ({ ...prevState, [id]: value }));
  };

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);

    if (files.length + fileNames.length > 5) {
      setErrors({ image: "You can upload a maximum of 5 files." });
      return;
    }

    setErrors({}); // Clear any previous errors

    const newFileNames = files.map((file) => file.name);
    setFileNames((prev) => [...prev, ...newFileNames]);
  };
  const formatDateTime = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    // Get hours, minutes, and seconds
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    // Return date and time in one line
    return `${day} ${month} ${year}, ${hours}:${minutes}:${seconds}`; // Format: DD Month YYYY, HH:MM:SS
  };

  const validateForm = () => {
    let isValid = true;
    let newErrors = {};

    if (!formData.name) {
      newErrors.name = "Name is required.";
      isValid = false;
    }
    if (!formData.number) {
      newErrors.number = "Number is required.";
      isValid = false;
    }
    if (!formData.email) {
      newErrors.email = "Email is required.";
      isValid = false;
    }
    if (!formData.issueCategory) {
      newErrors.issueCategory = "Issue Category is required.";
      isValid = false;
    }
    if (!formData.companyName) {
      newErrors.companyName = "Company Name is required.";
      isValid = false;
    }
    if (!formData.date) {
      newErrors.date = "Date is required.";
      isValid = false;
    }
    if (!formData.time) {
      newErrors.time = "Time is required.";
      isValid = false;
    }
    if (formData.image && formData.image.size > 5 * 1024 * 1024) {
      newErrors.image = "Image size must be less than 5MB.";
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    if (validateForm()) {
      const currentTime = new Date();
      const currentHour = currentTime.getHours();

      let ticketDate = currentTime;
      let ticketTime = `${currentTime
        .getHours()
        .toString()
        .padStart(2, "0")}:${currentTime
        .getMinutes()
        .toString()
        .padStart(2, "0")}`; // Format as HH:mm
      let showOutsideSupportHoursAlert = false;

      // Fetch company details using API
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/companies/${formData.companyName}`
        );
        const company = response.data;

        if (!company) {
          console.error("Company not found");
          return;
        }

        // Check if company has 24/7 support
        const is24x7Support = company.supportTimings === "24*7";
        console.log("Support time", is24x7Support);

        // If the issue category is "Fire Alarm System", create ticket immediately
        if (formData.issueCategory === "Fire Alarm System") {
          ticketDate = currentTime; // No need to adjust ticket time
          ticketTime = `${currentTime
            .getHours()
            .toString()
            .padStart(2, "0")}:${currentTime
            .getMinutes()
            .toString()
            .padStart(2, "0")}`; // Immediate time
        } else if (!is24x7Support) {
          // Check office timings (7 AM to 8 PM) and handle exceptions
          if (currentHour < 7 || currentHour >= 20) {
            // Outside office hours, set ticket for next day at 7:00 AM
            ticketDate.setDate(ticketDate.getDate() + 1);
            ticketDate.setHours(7, 0, 0, 0);
            ticketTime = "07:00"; // Next working time
            showOutsideSupportHoursAlert = true; // Trigger alert
          }
        }

        const formattedDate = ticketDate.toISOString().split("T")[0]; // Get date in YYYY-MM-DD format

        const ticketData = new FormData();
        ticketData.append("name", formData.name);
        ticketData.append("contactNumber", formData.number);
        ticketData.append("email", formData.email);

        const selectedCategory = issueCategories.find(
          (category) => category.name === formData.issueCategory
        );
        if (selectedCategory) {
          ticketData.append("issueCategory", selectedCategory._id);
        } else {
          console.error("Selected issue category not found");
          return;
        }

        ticketData.append("companyName", formData.companyName);
        ticketData.append("description", formData.description);
        ticketData.append("date", formattedDate);
        ticketData.append("time", ticketTime); // Adjusted time in HH:mm format
        ticketData.append("ticketNumber", ticketNumber);
        if (formData.image) {
          ticketData.append("image", formData.image);
        }

        try {
          // Submit ticket
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/submit-ticket`,
            ticketData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          );

          console.log("Ticket submitted successfully:", response.data);

          // Send notification to the operator
          try {
            const notificationResponse = await axios.put(
              `${import.meta.env.VITE_API_URL}/notification/${formData.number}`,
              {
                message: `Your ticket has been created with ${ticketNumber}`,
              },
              {
                headers: { "Content-Type": "application/json" }, // Ensure content-type is set to JSON
              }
            );
            console.log(
              "Notification sent successfully:",
              notificationResponse.data
            );
          } catch (notificationError) {
            console.error(
              "Error sending notification:",
              notificationError.response
                ? notificationError.response.data
                : notificationError.message
            );
          }

          // Show alert if ticket was created outside office hours
          if (showOutsideSupportHoursAlert) {
            alert(
              "Your ticket has been created successfully, but as you are creating it outside of the support timings, your ticket will be picked up in the next support timings."
            );
            setShowSuccessPopup(true);
          } else {
            alert("Your ticket has been created successfully!");
          }

          navigate("/dashboard/open"); // Redirect after submission

          const recipientEmail = formData.email.trim();
          const recipientName = formData.name.trim();
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

          if (!emailRegex.test(recipientEmail)) {
            console.error("Invalid email format:", recipientEmail);
            return;
          }

          const managerEmails = managers
            .map((manager) => manager.email.trim())
            .filter((email) => email);

          const emailData = {
            recipientEmails: [recipientEmail, ...managerEmails],
            ticketId: ticketNumber,
            issueCategory: formData.issueCategory,
            issueDescription: formData.description,
            firstName: recipientName,
          };

          try {
            // Send email
            const emailResponse = await axios.post(
              `${import.meta.env.VITE_API_URL}/send-email`,
              emailData
            );
            console.log("Email sent successfully:", emailResponse.data.message);
          } catch (error) {
            console.error(
              "Error sending email:",
              error.response ? error.response.data : error.message
            );
          }

          // Send WhatsApp message
          const formattedNumber = `+91${formData.number}`;
          await sendWhatsAppMessage(
            formattedNumber,
            formData.name,
            ticketNumber
          );
        } catch (error) {
          console.error(
            "Error submitting ticket:",
            error.response ? error.response.data : error.message
          );
        }
      } catch (error) {
        console.error(
          "Error fetching company details:",
          error.response ? error.response.data : error.message
        );
      }
    }
  };

  const sendWhatsAppMessage = async (to, name, ticketId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/send-whatsapp-message`,
        { to, name, ticketId }
      );
      console.log("WhatsApp message sent successfully");
    } catch (error) {
      console.error(
        "Error sending WhatsApp message:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const handleCancel = () => {
    navigate("/dashboard/home"); // Redirect to home
  };
  const handleClosepopup = () => {
    navigate("/dashboard/open"); // Redirect to home
  };

  const [categoryPrompts, setCategoryPrompts] = useState([]);
  const [filteredPrompts, setFilteredPrompts] = useState([]);
  const [showPrompts, setShowPrompts] = useState(false);
  const descriptionInput = useRef(null);
  const promptContainer = useRef(null); // Reference for the prompt container
  


       useEffect(() => {
    const fetchCategoryPrompts = async () => {
      if (formData.issueCategory) {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/categories/${encodeURIComponent(formData.issueCategory)}/prompts`
          );
          const prompts = response.data.prompts || [];
          setCategoryPrompts(prompts);
          setFilteredPrompts(prompts);
        } catch (error) {
          console.error('Error fetching category prompts:', error);
          setCategoryPrompts([]);
          setFilteredPrompts([]);
        }
      } else {
        setCategoryPrompts([]);
        setFilteredPrompts([]);
      }
    };

    fetchCategoryPrompts();
  }, [formData.issueCategory]);

  const handleDescriptionChange = (event) => {
    const description = event.target.value;
    setFormData((prevState) => ({ ...prevState, description }));

    // Filter prompts dynamically
    if (description.length > 0) {
      const filtered = categoryPrompts.filter((prompt) =>
        prompt.toLowerCase().includes(description.toLowerCase())
      );
      setFilteredPrompts(filtered);
    } else {
      setFilteredPrompts(categoryPrompts);
    }
  };

  const usePrompt = (prompt) => {
    setFormData((prevState) => ({ ...prevState, description: prompt }));
  };

  // Initialize jQuery UI Autocomplete for description input when the component mounts
  useEffect(() => {
    if (descriptionInput.current) {
      $(descriptionInput.current).autocomplete({
        source: filteredPrompts,
        select: function (event, ui) {
          // Set selected prompt to description field
          setFormData((prevState) => ({ ...prevState, description: ui.item.value }));
        },
        minLength: 1, // Trigger autocomplete after 1 character
      });
    }
  }, [filteredPrompts]);

  // Detect clicks outside the input and prompt container to hide the prompt suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        descriptionInput.current && !descriptionInput.current.contains(event.target) &&
        promptContainer.current && !promptContainer.current.contains(event.target)
      ) {
        // Hide the prompt pop-up if the click is outside the description input and prompt container
        setFilteredPrompts([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-200 py-6 flex flex-col justify-center sm:py-12 font-sans w-full ml-7 h-full">
      <div className="relative py-4 sm:max-w-xl sm:mx-auto">
        <div className="flex items-center justify-center min-h-screen w-[750px] -ml-[55px]">
          <div className="relative px-4 py-10 bg-gray-100 shadow rounded-3xl sm:p-10 w-[900px] h-1/2">
            {/* Updated class */}
            {/* Cancel Button */}
            <button
              onClick={handleCancel}
              className="absolute top-10 right-8 text-gray-700 hover:text-red-600 focus:outline-none"
              aria-label="Cancel"
            >
              <span className="text-5xl">&times;</span> {/* "X" icon */}
            </button>
            <div className="max-w-md mx-6 -ml--16 ml-[17%]">
              <div className="flex items-center space-x-5  ">
                <div className="h-6464 w-6464 bg-yellow-200 rounded-full flex justify-center items-center text-yellow-500 text-4xl font-poppins">
                  {initials || "i"}
                </div>
                <h2 className="leading-relaxed whitespace-nowrap block pl-0.5 font-bold text-3xl text-gray-700 font-poppins">
                  Create Ticket
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                <div className="py-8 text-base leading-6 space-y-2 text-gray-900 sm:text-sm sm:leading-7">
                  <div className="flex flex-col hidden">
                    <label className="leading-loose font-poppins">
                      Ticket Number
                    </label>
                    <input
                      type="text"
                      className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-black bg-customGray font-poppins"
                      value={ticketNumber}
                      readOnly
                    />
                  </div>
                  <form onSubmit={handleSubmit}>
                    <div className="flex flex-col pt-0 h-[80px] mb-6">
                      <label className="leading-loose text-fontcolor mb-1818 text-lg font-poppins">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full h-[80px] sm:text-sm border-gray-300 focus:outline-none text-black bg-customGray font-poppins"
                        required
                        readOnly
                      />
                      {errors.name && (
                        <span className="text-red-500 font-poppins">
                          {errors.name}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col pt-0 h-[80px] mb-6">
                      <div className="ml-0">
                        <label className="leading-loose text-fontcolor mb-1818 text-lg font-poppins">
                          Contact Number
                        </label>
                      </div>
                      <input
                        type="text"
                        id="number"
                        value={formData.number}
                        onChange={handleInputChange}
                        className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full h-[80px] sm:text-sm border-gray-300 rounded-md focus:outline-none text-black bg-customGray font-poppins"
                        required
                        readOnly
                      />
                      {errors.number && (
                        <span className="text-red-500 font-poppins">
                          {errors.number}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col pt-0 h-[80px] mb-6">
                      <div className="ml-0 flex items-center justify-between">
                        <label className="leading-loose text-fontcolor mb-1 text-lg font-poppins">
                          Email
                        </label>
                      </div>
                      <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full h-[80px] sm:text-sm border-gray-300 rounded-md focus:outline-none text-black bg-customGray font-poppins"
                        required
                      />

                      {errors.email && (
                        <span className="text-red-500 font-poppins">
                          {errors.email}
                        </span>
                      )}

                      {/* New fields for Manager Name and Email in a flex container */}
                      <div className="mt-6 hidden">
                        <h3 className="text-lg font-semibold">Managers:</h3>
                        {managers.length > 0 ? (
                          managers.map((manager, index) => (
                            <div
                              key={index}
                              className="flex justify-between mt-2"
                            >
                              <span>{manager.name}</span>
                              <span>{manager.email}</span>
                            </div>
                          ))
                        ) : (
                          <p>No managers found.</p>
                        )}
                      </div>

                      {errors.managerEmail && (
                        <span className="text-red-500 font-poppins">
                          {errors.managerEmail}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col pt-0 h-[80px] mb-6">
                      <div className="ml-0">
                        <label className="leading-loose text-fontcolor mb-1818 text-lg font-poppins">
                          Company Name
                        </label>
                      </div>
                      <input
                        type="text"
                        id="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full h-[80px] sm:text-sm border-gray-300 rounded-md focus:outline-none text-black bg-customGray font-poppins"
                        required
                        readOnly
                      />
                      {errors.companyName && (
                        <span className="text-red-500 font-poppins">
                          {errors.companyName}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col pt-0 h-[90px] mb-6">
                      <div className="ml-0">
                        <label className="leading-loose text-fontcolor mb-1818 text-lg font-poppins">
                          Select Issue Category
                        </label>
                      </div>
                      <select
                        id="issueCategory"
                        value={formData.issueCategory}
                        onChange={handleInputChange}
                        className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full h-[90px] sm:text-sm border-gray-300 rounded-md focus:outline-none text-black bg-white mb-1818 text-xs font-poppins"
                        required
                      >
                        <option value="">Select an issue</option>
                        {issueCategories.map((category) => (
                          <option key={category._id} value={category.name}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      {errors.issueCategory && (
                        <span className="text-red-500 font-poppins">
                          {errors.issueCategory}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col pt-0 h-auto mb-6">
                      <div className="ml-0">
                        <label className="leading-loose text-fontcolor mb-1818 text-lg font-poppins">
                          Upload Image
                        </label>
                      </div>
                      <div className="flex flex-row-reverse mt-1 h-10">
                        <div className="bg-white text-[#333] flex items-center shadow-[0_2px_10px_-3px_rgba(6,81,237,0.3)] p-1 border border-gray-300 rounded-md my-4 mx-auto w-full sm:text-sm h-[40px] mt-0">
                          <div className="px-2 flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 32 32"
                            >
                              <path d="M23.75 11.044a7.99 7.99 0 0 0-15.5-.009A8 8 0 0 0 9 27h3a1 1 0 0 0 0-2H9a6 6 0 0 1-.035-12 1.038 1.038 0 0 0 1.1-.854 5.991 5.991 0 0 1 11.862 0A1.08 1.08 0 0 0 23 13a6 6 0 0 1 0 12h-3a1 1 0 0 0 0 2h3a8 8 0 0 0 .75-15.956z" />
                              <path d="M20.293 19.707a1 1 0 0 0 1.414-1.414l-5-5a1 1 0 0 0-1.414 0l-5 5a1 1 0 0 0 1.414 1.414L15 16.414V29a1 1 0 0 0 2 0V16.414z" />
                            </svg>
                            <p className="text-sm ml-2 font-poppins">
                              Upload Attachment
                            </p>
                          </div>
                          <div className="ml-[43%]">
                            <label
                              htmlFor="uploadImage"
                              className="bg-custom-gradient text-white text-sm px-2 py-1 rounded-md cursor-pointer ml-auto w-max font-poppins"
                            >
                              Upload
                            </label>
                          </div>
                          <input
                            type="file"
                            id="uploadImage"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            multiple // Allow multiple files
                          />
                        </div>
                        {errors.image && (
                          <span className="text-red-500 font-poppins">
                            {errors.image}
                          </span>
                        )}
                      </div>
                      {fileNames.length > 0 && (
                        <div className="mt-2 text-lg font-poppins text-fontcolor bg-customGray text-center p-2 h-auto">
                          {fileNames.map((name, index) => (
                            <div key={index} className="flex items-center mb-1">
                              <div className="bg-green-500 p-1 rounded-full flex items-center justify-center mr-2">
                                <img
                                  src="/checked.png"
                                  alt=""
                                  className="h-5 w-5"
                                />
                              </div>
                              {name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

          <div className="flex flex-col pt-0 mb-0 mt-4">
      <div className="ml-0">
        <label className="leading-loose text-fontcolor mb-1818 font-poppins text-lg">
          Description
        </label>
      </div>
      <textarea
        id="description"
        value={formData.description}
        onChange={handleDescriptionChange}
        ref={descriptionInput} // Use ref for jQuery targeting
        className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full h-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-black bg-white font-poppins"
        rows="4"
      />

      {/* Conditionally render the prompt suggestions if description length > 0 */}
      
    </div>

                    <div className="flex flex-col hidden">
                      <label className="leading-loose font-poppins">Date</label>
                      <input
                        type="date"
                        id="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600 text-base font-poppins"
                        required
                      />
                      {errors.date && (
                        <span className="text-red-500 font-poppins">
                          {errors.date}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col hidden">
                      <label className="leading-loose font-poppins">Time</label>
                      <input
                        type="time"
                        id="time"
                        value={formData.time}
                        onChange={handleInputChange}
                        className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600 text-base font-poppins"
                        required
                      />
                      {errors.time && (
                        <span className="text-red-500 font-poppins">
                          {errors.time}
                        </span>
                      )}
                    </div>

                    <div className="calendar-icon">
                      {formatDateTime(dateTime)}
                    </div>
                    <div className="ticket-icon">
                      <span
                        style={{ marginRight: "8px" }}
                        className="text-center font-poppins"
                      >
                        Your Deskassure ID is
                      </span>
                      <strong className="font-poppins">{ticketNumber}</strong>
                    </div>

                    <label className="flex mt-3">
                      <input
                        type="checkbox"
                        checked={isChecked} // Set checkbox to checked based on state
                        onChange={handleCheckboxChange} // Call function on change
                        className="form-checkbox h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-2"
                      />
                      <span className="ml-2 font-poppins text-xs text-gray-400">
                        I consent to the collection, processing, and sharing of
                        my personal data as described in the Privacy Policy.
                        This includes name, email, address etc. I understand
                        that my data may be used for marketing, analytics,
                        product improvement purpose.
                      </span>
                    </label>

                    {/* Conditional rendering of the button */}
                    {isChecked && (
                      <div className="pt-4 mt-6 flex items-center space-x-36">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="bg-buttoncolor flex justify-center items-center w-[172px] text-white px-4 py-3 rounded-md focus:outline-none text-[18px] hover:bg-blue-900 ml-36 font-poppins"
                        >
                          {isSubmitting ? "Please hold on" : "Create"}
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTicket;
