import React, { useEffect, useState, useRef } from "react";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import "../Navbar/Navbar.css";
import AddEmailsPage from "./AddEmailsPage";

const Navbar = () => {
  const navigate = useNavigate();
  const [userInitials, setUserInitials] = useState("");
  const [isAddEmailsModalOpen, setAddEmailsModalOpen] = useState(false);
  const [operatorName, setOperatorName] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileNumber = localStorage.getItem("loggedInUserMobileNumber");
  const cardRef = useRef(null);
  const [isEmailCopied, setIsEmailCopied] = useState(false);
  const [isPhoneCopied, setIsPhoneCopied] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState({
    createTicket: false,
    profile: false,
    accountmanager: false,
    notification: false,
  });

  // Clipboard copy function
  const copyToClipboard = (text, type) => {
    // Check if navigator.clipboard is available (modern browsers)
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          console.log("Text copied successfully");

          // Set the copied state based on the type (email or phone)
          if (type === "email") {
            setIsEmailCopied(true);
            setTimeout(() => setIsEmailCopied(false), 2000); // Reset after 2 seconds
          } else if (type === "phone") {
            setIsPhoneCopied(true);
            setTimeout(() => setIsPhoneCopied(false), 2000); // Reset after 2 seconds
          }
        })
        .catch((err) => {
          // Handle any errors when using the Clipboard API
          console.error("Failed to copy text using Clipboard API", err);
          alert("Failed to copy text to clipboard");
        });
    } else {
      // Fallback to execCommand if Clipboard API is not available (older browsers)
      const textArea = document.createElement("textarea");
      textArea.value = text; // Set the value to the text we want to copy
      document.body.appendChild(textArea); // Append the textarea to the body
      textArea.select(); // Select the text inside the textarea
      textArea.setSelectionRange(0, 99999); // For mobile devices, select the entire text

      try {
        const successful = document.execCommand("copy"); // Attempt to copy the text
        if (successful) {
          console.log("Text copied successfully using execCommand");
          // Set the copied state based on the type (email or phone)
          if (type === "email") {
            setIsEmailCopied(true);
            setTimeout(() => setIsEmailCopied(false), 2000); // Reset after 2 seconds
          } else if (type === "phone") {
            setIsPhoneCopied(true);
            setTimeout(() => setIsPhoneCopied(false), 2000); // Reset after 2 seconds
          }
        } else {
          console.error("Failed to copy text using execCommand");
          alert("Failed to copy text");
        }
      } catch (err) {
        console.error("Error copying text:", err);
        alert("Error copying text");
      } finally {
        document.body.removeChild(textArea); // Clean up by removing the textarea
      }
    }
  };

  //To close manager pop-up
  useEffect(() => {
    // Function to handle clicks outside the modal
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setIsCardVisible(false); // Close the modal if click is outside
      }
    };

    // Add event listener on component mount
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup the event listener when component unmounts
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []); // Empty dependency array ensures it runs once when the component mounts

  useEffect(() => {
    const fetchOperatorData = async () => {
      if (mobileNumber) {
        try {
          // Fetch operator data using mobile number
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/operators/mobile/${mobileNumber}`
          );
          setOperatorName(response.data.operatorName); // Store operator name

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
          setUserInitials(initialsResponse.data.initials); // Store initials in state
        } catch (error) {
          console.error("Error fetching operator data:", error);
        }
      } else {
        console.error("No mobile number found in local storage.");
      }
    };

    fetchOperatorData();
  }, [mobileNumber]);

  const handleProfileClick = () => {
    navigate("/user-login"); // Redirect to UserLoginPage
  };
  const handleClose = () => {
    console.log("Modal is closing");
    setAddEmailsModalOpen(false);
  };

  const handleSignOut = () => {
    // Add your sign-out logic here
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
    navigate("/");
  };

  const [isCardVisible, setIsCardVisible] = useState(false);

  // Toggle the visibility of the card
  const toggleCardVisibility = () => {
    setIsCardVisible((prev) => !prev);
  };
  const [notifications, setNotifications] = useState([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef(null);
  // Add useEffect to handle clicks outside of notification dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the notification dropdown is open and the click is outside
      if (
        isNotificationOpen &&
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationOpen(false);
      }
    };

    // Add event listener to document
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotificationOpen]); // Depend on isNotificationOpen to ensure the latest state is used
  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!mobileNumber) return;

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/notifications/${mobileNumber}`
        );

        const formattedNotifications = response.data.map(
          (notification, index) => ({
            id: notification._id || index,
            message: notification.message,
            time: new Date(notification.createdAt).toLocaleString(),
            status: notification.status || "unread",
            details: notification,
          })
        );

        setNotifications(formattedNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [mobileNumber]);

  // Mark single notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/notifications/read/${mobileNumber}`,
        {
          notificationId,
        }
      );

      setNotifications(
        notifications.map((notif) =>
          notif.id === notificationId ? { ...notif, status: "read" } : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/notifications/read/${mobileNumber}`
      );

      setNotifications(
        notifications.map((notif) => ({
          ...notif,
          status: "read",
        }))
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Function to toggle notifications
  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/notifications/${mobileNumber}`
      );

      setNotifications([]);
      setIsNotificationOpen(false);
    } catch (error) {
      console.error("Error clearing all notifications:", error);
    }
  };

  // // Function to clear all notifications
  // const clearAllNotifications = () => {
  //   setNotifications([]);
  // };

  const handleTooltipVisibility = (button) => {
    if (window.innerWidth > 768) {
      setTooltipVisible((prev) => ({
        ...prev,
        [button]: true,
      }));
    }
  };

  const handleTooltipHide = (button) => {
    setTooltipVisible((prev) => ({
      ...prev,
      [button]: false,
    }));
  };

   const accountManagerButtonRef = useRef(null);
  return (
    <nav className="bg-white w-full fixed top-0 left-0 z-50 shadow-md">
      <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between  h-16">
          {/* Logo and Mobile Menu Button */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="logo w-24 h-8 sm:w-32 sm:h-10 font-poppins">
                <img src="/logo_black_full.png" alt="deskAssure" srcset="" className="max-w-[250%] h-auto" />
                </div>
            </div>
            
            {/* Mobile Menu Button */}
            <button
              className="ml-64 inline-flex items-center justify-center p-2 rounded-md text-gray-700 md:hidden hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} className="h-6 w-6" />
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4 pt-[2.1%]">
            {/* Account Manager Button */}
           <div className="relative">
              <button
                ref={accountManagerButtonRef}
                onClick={toggleCardVisibility}
                className="flex items-center gap-2 bg-custom-gradient text-white font-semibold py-2 px-3 rounded-full shadow-lg transition duration-200 hover:opacity-90"
                onMouseEnter={() => handleTooltipVisibility("accountManager")}
                onMouseLeave={() => handleTooltipHide("accountManager")}
              >
                <img
                  src="/admin_image.jpeg"
                  alt="Profile"
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex flex-col text-left">
                  <span className="text-sm font-poppins">Meet Pulkit</span>
                  <span className="text-xs opacity-80 font-poppins">Your Account Manager</span>
                </div>
              </button>
              {tooltipVisible.accountManager && (
                <div className="custom-tooltip visible">Account Manager</div>
              )}
              

              {/* Account Manager Card - Repositioned for desktop */}
              {isCardVisible && (
                <div className="fixed inset-0 md:absolute md:inset-auto md:top-full md:right-0 md:mt-2 z-50">
                  {/* Overlay only shown on mobile */}
                  <div className="fixed inset-0 bg-black bg-opacity-50 md:hidden" onClick={toggleCardVisibility} />
                  
                  {/* Card Content */}
                  <div 
                    ref={cardRef} 
                    className="relative bg-black text-white rounded-lg p-4 w-full max-w-sm mx-auto md:mx-0 md:w-96 shadow-xl"
                  >
                    {/* Rest of the card content remains the same */}
                    <button
                      onClick={toggleCardVisibility}
                      className="absolute top-1 right-2 text-gray-400 hover:text-white"
                    >
                      &times;
                    </button>
                    <p className="text-sm mt-2 font-poppins">
                      Hi, I am Pulkit, Your Account Manager
                    </p>
                    <p className="text-xs mt-2 font-poppins">
                      Talk to me on how to get the best out of Foxnet Services
                    </p>
                    <p className="text-xs mt-1 opacity-80 font-poppins">
                      I've helped 20+ businesses streamline over 5+ countries in
                      the last 45 days.
                    </p>
                    {/* Contact Information */}
                    <div className="mt-4">
                      <div className="flex items-center gap-2 font-poppins">
                        <img src="/email_2.png" alt="" className="h-4 w-4" />
                        <span className="text-[13px]">
                          pulkit.verma@foxnetglobal.com
                        </span>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              "pulkit.verma@foxnetglobal.com",
                              "email"
                            )
                          }
                          className="ml-0 text-gray-400 hover:text-white"
                        >
                          <img
                            src={isEmailCopied ? "/copy_green.png" : "/copy.png"}
                            alt="Copy Icon"
                            className="h-3 w-3 mb-1"
                          />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mt-2 font-poppins">
                        <img src="/phone-call.png" alt="" className="h-4 w-4" />
                        <span className="text-sm">+91 9560005265</span>
                        <button
                          onClick={() =>
                            copyToClipboard("+91 9560005265", "phone")
                          }
                          className="ml-0 text-gray-400 hover:text-white"
                        >
                          <img
                            src={isPhoneCopied ? "/copy_green.png" : "/copy.png"}
                            alt=""
                            className="h-3 w-3 mb-1"
                          />
                        </button>
                      </div>
                    </div>
                    {/* Action Buttons */}
                    <div className="mt-4 flex gap-0 ml-0">
                      <div className="flex-1">
                        <button
                          onClick={() =>
                            (window.location.href = "tel:+919560005265")
                          }
                          className="w-16 bg-red-600 text-white py-1 px-1 rounded-md hover:bg-red-700 font-poppins text-[10px] h-7 pt-2 pb-3"
                        >
                          Call Now
                        </button>
                      </div>
                      <div className="flex-1 -ml-24">
                        <a
                          href="https://wa.me/919560005265?text=Welcome%20to%20Foxnet%2C%20how%20I%20can%20help%20you%20today%21%21"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <button className="w-[45%] bg-green-600 text-white py-1 px-1 rounded-md hover:bg-green-700 font-poppins text-[10px] h-7 pt-2 pb-3 pl-2">
                            <div className="flex">
                              <img
                                src="/whatsapp.png"
                                alt=""
                                className="h-3 w-3 mt-[1.5%]"
                              />
                              <span className="ml-1 -pt-1">WhatsApp</span>
                            </div>
                          </button>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Create Ticket Button */}
            <button
              className="bg-custom-gradient text-white p-2 w-8 h-8 flex items-center justify-center rounded-md"
              onClick={() => navigate("/dashboard/create-ticket")}
              onMouseEnter={() => handleTooltipVisibility("createTicket")}
              onMouseLeave={() => handleTooltipHide("createTicket")}
            >
              <FontAwesomeIcon icon={faPlus} className="text-lg" />
            </button>
            {tooltipVisible.createTicket && (
              <div className="custom-tooltip visible">Create Ticket</div>
            )}

            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <button
                className="notification-button bg-custom-gradient p-2 rounded-md relative"
                onClick={toggleNotifications}
              >
                <img src="/bell.png" alt="Notification" className="w-5 h-5" />
                {notifications.filter((n) => n.status === "unread").length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {notifications.filter((n) => n.status === "unread").length}
                  </span>
                )}
              </button>
              {tooltipVisible.notification && (
                <div className="custom-tooltip visible">Notification</div>
              )}
              
              {/* Notification Dropdown remains the same */}
			  {isNotificationOpen && (
                <div
                  className="absolute right-0 mt-2 w-72 bg-black text-white rounded-lg shadow-lg border border-gray-300 z-50"
                  style={{
                    maxHeight: "300px",
                    overscrollBehavior: "contain",
                  }}
                >
                  <div className="p-4 border-b border-gray-300 flex justify-between items-center bg-black rounded-t-lg">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Notifications
                      </h3>
                    </div>
                    <div className="flex space-x-3">
                      {notifications.some((n) => n.status === "unread") && (
                        <button
                          className="text-sm text-white hover:text-gray-300 border border-white rounded-md px-2 py-1 transition-all duration-200"
                          onClick={markAllNotificationsAsRead}
                        >
                          Mark All Read
                        </button>
                      )}
                      <button
                        className="text-sm text-white hover:text-gray-300 border border-white rounded-md px-2 py-1 transition-all duration-200"
                        onClick={clearAllNotifications}
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-400">
                      No notifications
                    </div>
                  ) : (
                    <div
                      className="max-h-64 overflow-y-auto scrollbar-hide bg-black rounded-b-lg"
                      style={{
                        overflowY: "scroll",
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                      }}
                    >
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 hover:bg-gray-700 transition-all duration-200 border-b border-gray-500 flex justify-between items-center
              ${notification.status === "unread" ? "bg-gray-800" : ""}`}
                        >
                          <div>
                            <p className="text-sm text-white font-medium">
                              {notification.message}
                            </p>
                            {notification.status === "unread" && (
                              <span className="text-xs text-indigo-400 font-semibold ml-2">
                                New
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {notification.status === "unread" && (
                              <button
                                onClick={() =>
                                  markNotificationAsRead(notification.id)
                                }
                                className="text-sm text-white hover:text-gray-300 font-medium transition-all duration-200 border border-white rounded-md px-2 py-1 mr-2"
                              >
                                Read
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <Menu as="div" className="relative">
              <MenuButton
                className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none"
                onMouseEnter={() => handleTooltipVisibility("profile")}
                onMouseLeave={() => handleTooltipHide("profile")}
              >
                <div className="h-9 w-9 bg-yellow-200 rounded-full flex justify-center items-center text-yellow-500 text-xl font-poppins">
                  {userInitials}
                </div>
              </MenuButton>
              {tooltipVisible.profile && (
                  <div className="custom-tooltip visible">Profile</div>
                )}
              
              {/* Profile Menu Items remain the same */}
			  <MenuItems
                transition
                className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
              >
                <MenuItem>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-poppins"
                    onClick={() => navigate("/dashboard/Profileform")}
                  >
                    Profile
                  </a>
                </MenuItem>
                <MenuItem>
                  <a
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-poppins"
                    onClick={() => setAddEmailsModalOpen(true)} // Open the modal
                  >
                    Emails
                  </a>
                </MenuItem>
                <MenuItem>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-poppins"
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </a>
                </MenuItem>
              </MenuItems>
            </Menu>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            <div className="flex flex-col space-y-4">
              {/* Mobile Account Manager */}
              <button
                onClick={toggleCardVisibility}
                className="flex items-center gap-2 bg-custom-gradient text-white p-2 rounded-lg"
              >
                <img
                  src="/admin_image.jpeg"
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex flex-col text-left">
                  <span className="text-sm">Meet Pulkit</span>
                  <span className="text-xs opacity-80">Your Account Manager</span>
                </div>
              </button>

              {/* Mobile Create Ticket */}
              <button
                className="flex items-center gap-2 bg-custom-gradient text-white p-2 rounded-lg"
                onClick={() => navigate("/dashboard/create-ticket")}
              >
                <FontAwesomeIcon icon={faPlus} />
                <span>Create Ticket</span>
              </button>

              {/* Mobile Profile Options */}
              <button
                className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg"
                onClick={() => navigate("/dashboard/Profileform")}
              >
                <span>Profile</span>
              </button>
              
              <button
                className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg"
                onClick={() => setAddEmailsModalOpen(true)}
              >
                <span>Emails</span>
              </button>
              
              <button
                className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg"
                onClick={handleSignOut}
              >
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t w-full mt-[2.5rem]" style={{ borderTopColor: 'rgb(200, 203, 217)' }}  />

      {/* Modals and Dropdowns */}
      {isAddEmailsModalOpen && (
        <AddEmailsPage
          onClose={() => setAddEmailsModalOpen(false)}
          mobileNumber={mobileNumber}
        />
      )}

      {/* Account Manager Card */}
      {isCardVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 lg:hidden md:hidden">
          <div ref={cardRef} className="bg-black text-white rounded-lg p-4 w-full max-w-sm mx-auto">
            {/* Close Button */}
                  <button
                    onClick={toggleCardVisibility}
                    className="absolute top-1 right-2 text-gray-400 hover:text-white"
                  >
                    &times;
                  </button>
                  <p className="text-sm mt-2 font-poppins">
                    Hi, I am Pulkit, Your Account Manager
                  </p>
                  <p className="text-xs mt-2 font-poppins">
                    Talk to me on how to get the best out of Foxnet Services
                  </p>
                  <p className="text-xs mt-1 opacity-80 font-poppins">
                    I've helped 20+ businesses streamline over 5+ countries in
                    the last 45 days.
                  </p>
                  {/* Contact Information */}
                  <div className="mt-4">
                    <div className="flex items-center gap-2 font-poppins">
                      <img src="/email_2.png" alt="" className="h-4 w-4" />
                      <span className="text-[13px]">
                        pulkit.verma@foxnetglobal.com
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            "pulkit.verma@foxnetglobal.com",
                            "email"
                          )
                        }
                        className="ml-0 text-gray-400 hover:text-white"
                      >
                        <img
                          src={isEmailCopied ? "/copy_green.png" : "/copy.png"} // Conditionally change the image
                          alt="Copy Icon"
                          className="h-3 w-3 mb-1"
                        />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mt-2 font-poppins">
                      <img src="/phone-call.png" alt="" className="h-4 w-4" />
                      <span className="text-sm">+91 9560005265</span>
                      <button
                        onClick={() =>
                          copyToClipboard("+91 9560005265", "phone")
                        }
                        className="ml-0 text-gray-400 hover:text-white"
                      >
                        <img
                          src={isPhoneCopied ? "/copy_green.png" : "/copy.png"} // Conditionally change the image
                          alt=""
                          className="h-3 w-3 mb-1"
                        />
                      </button>
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className="mt-4 flex gap-0 ml-0">
                    <div className="flex-1">
                      <button
                        onClick={() =>
                          (window.location.href = "tel:+919560005265")
                        }
                        className="w-16 bg-red-600 text-white py-1 px-1 rounded-md hover:bg-red-700 font-poppins text-[10px] h-7 pt-2 pb-3"
                      >
                        Call Now
                      </button>
                    </div>
                    <div className="flex-1 -ml-24">
                      <a
                        href="https://wa.me/919560005265?text=Welcome%20to%20Foxnet%2C%20how%20I%20can%20help%20you%20today%21%21"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <button className="w-[45%] bg-green-600 text-white py-1 px-1 rounded-md hover:bg-green-700 font-poppins text-[10px] h-7 pt-2 pb-3 pl-2">
                          <div className="flex">
                            <img
                              src="/whatsapp.png"
                              alt=""
                              className="h-3 w-3 mt-[1.5%]"
                            />
                            <span className="ml-1 -pt-1">WhatsApp</span>
                          </div>
                        </button>
                      </a>
                    </div>
                  </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;