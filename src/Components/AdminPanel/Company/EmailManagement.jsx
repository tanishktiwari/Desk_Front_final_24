import React, { useState, useEffect } from "react";
import axios from "axios";

const EmailManagement = ({ selectedCompany }) => {
  const [userDetails, setUserDetails] = useState([{ title: "", name: "", email: "" }]);
  const [error, setError] = useState(""); // Error message

  // Fetch saved contacts when a company is selected
  useEffect(() => {
    if (!selectedCompany) return;

    const fetchSavedContacts = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/company/${selectedCompany}/contacts`
        );

        if (!response.data || response.data.length === 0) {
          setUserDetails([{ title: "", name: "", email: "" }]);
        } else {
          setUserDetails(response.data);
        }
      } catch (err) {
        console.error("Error fetching saved contacts:", err);
        setUserDetails([{ title: "", name: "", email: "" }]);
      }
    };

    fetchSavedContacts();
  }, [selectedCompany]);

  // Handle adding a new user detail row
  const addNewUserDetail = () => {
    setUserDetails([...userDetails, { title: "", name: "", email: "" }]);
  };

  // Handle removing a user detail row
  const removeUserDetail = async (contactId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/company/${selectedCompany}/contact/${contactId}`
      );

      setUserDetails((prevUserDetails) =>
        prevUserDetails.filter((contact) => contact._id !== contactId)
      );
    } catch (error) {
      console.error("Error deleting contact:", error);
      setError("Failed to delete contact");
    }
  };

  // Handle user detail changes
  const handleUserDetailChange = (index, field, value) => {
    const updatedUserDetails = [...userDetails];
    updatedUserDetails[index][field] = value;
    setUserDetails(updatedUserDetails);
  };

  // Handle saving the email
  const handleSaveMail = async () => {
    const newContacts = userDetails.filter((user) => !user._id); // Filter out unsaved contacts

    if (newContacts.length === 0) return;

    try {
      const updatedUserDetails = await Promise.all(
        newContacts.map(async (user) => {
          const { title, name, email } = user;
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/company/${selectedCompany}/contact`,
            { title, name, email }
          );

          return { ...user, _id: response.data._id };
        })
      );

      setUserDetails((prevUserDetails) => [
        ...prevUserDetails.filter((user) => user._id), // Keep existing contacts with _id
        ...updatedUserDetails, // Add new contacts with _id
      ]);

      console.log("Contacts saved successfully");
    } catch (error) {
      console.error("Error saving contact:", error);
      setError("Failed to save contact");
    }
  };

  return (
    <div className="p-20  rounded-2xl shadow-xl w-full max-w-7xl bg-white mb-5">
      <h1 className="text-2xl font-bold text-center">Manage Emails</h1>

      {/* Display Error Message */}
      {error && <div className="text-red-500 text-center">{error}</div>}

      <div className="mt-6">
        {userDetails.map((user, index) => (
          <div key={index} className="flex items-center mb-4 justify-center">
            <input
              type="text"
              value={user.title}
              onChange={(e) => handleUserDetailChange(index, "title", e.target.value)}
              className="border p-2 w-1/4 rounded"
              placeholder="Title"
              disabled={user._id}
            />
            <input
              type="text"
              value={user.name}
              onChange={(e) => handleUserDetailChange(index, "name", e.target.value)}
              className="border p-2 w-1/4 rounded ml-2"
              placeholder="Name"
              disabled={user._id}
            />
            <input
              type="email"
              value={user.email}
              onChange={(e) => handleUserDetailChange(index, "email", e.target.value)}
              className="border p-2 w-1/4 rounded ml-2"
              placeholder="Email"
              disabled={user._id}
            />
            <button
              onClick={() => removeUserDetail(user._id)}
              className="ml-2 text-red-500"
            >
              🗑️
            </button>
            {userDetails.length - 1 === index && (
              <button
                onClick={addNewUserDetail}
                className="ml-2 text-blue-500"
              >
                +
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-6">
        <button
          className="bg-buttoncolor text-white px-6 py-2 rounded-lg transition w-32"
          onClick={handleSaveMail}
        >
          Save Email
        </button>
      </div>
    </div>
  );
};

export default EmailManagement;
