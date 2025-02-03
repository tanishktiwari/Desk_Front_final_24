import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes, faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import Addmail from './Addmail';

const AddEmailsPage = ({ onClose, mobileNumber }) => {
  const [contacts, setContacts] = useState([]);
  const [showAddMailModal, setShowAddMailModal] = useState(false);
  const [contactToEdit, setContactToEdit] = useState(null);  // New state for editing

  useEffect(() => {
    fetchContacts();
  }, [mobileNumber]);

  const fetchContacts = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/operators/mobile/${mobileNumber}`
      );
      console.log("API Response:", response.data);
      setContacts(response.data.managers || []);
    } catch (error) {
      console.error("Error fetching contacts:", error.response?.data || error.message);
    }
  };

  const handleAddEmail = () => {
    setShowAddMailModal(true);
  };

  const handleDeleteContact = async (managerMobile) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/operators/mobile/${mobileNumber}/managers/${managerMobile}`
      );
      console.log("Delete Response:", response.data);
      setContacts(prevContacts => prevContacts.filter(contact => contact.contactNumber !== managerMobile));
    } catch (error) {
      console.error("Error deleting contact:", error.response?.data || error.message);
    }
  };

  const handleEditContact = (contact) => {
    setContactToEdit(contact);  // Set the contact to be edited
    setShowAddMailModal(true);  // Show the modal (Addmail component)
  };

  const handleCloseAddMailModal = () => {
    setShowAddMailModal(false);
    setContactToEdit(null);  // Reset the contact being edited when modal is closed
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
  <div className="bg-white rounded-3xl shadow-lg p-6 max-w-2xl w-full relative">

    {/* Close Button positioned at the top-right corner */}
    <button 
      onClick={onClose}
      className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
    >
      <FontAwesomeIcon icon={faTimes} className="h-6 w-6" />
    </button>

    <h1 className="font-poppins text-center font-bold mb-10 text-2xl">Emails</h1>

    <div className="flex justify-between items-center mb-10 font-poppins">
      <span className="text-lg font-semibold text-gray-800">All ({contacts.length})</span>
      <div className="flex items-center gap-32 font-poppins">
        <button
          onClick={handleAddEmail}
          className="bg-custom-gradient text-white py-2 px-4 rounded-3xl hover:opacity-80 flex items-center ml-4"
        >
          <FontAwesomeIcon icon={faPlus} className="h-4 w-4 mr-2" />
          Add Email
        </button>
      </div>
    </div>

    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm font-light font-poppins rounded-2xl">
        <thead className="border-b border-neutral-200 bg-gray-100">
          <tr>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Mobile Number</th>
            <th className="px-4 py-2">Designation</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr key={contact._id} className="border-b border-neutral-200 hover:bg-gray-100 font-poppins">
              <td className="whitespace-nowrap px-4 py-2">{contact.name}</td>
              <td className="whitespace-nowrap px-4 py-2">{contact.email}</td>
              <td className="whitespace-nowrap px-4 py-2">{contact.contactNumber}</td>
              <td className="whitespace-nowrap px-4 py-2">{contact.designation}</td>
              <td className="whitespace-nowrap px-4 py-2">
                <div className="flex gap-3 justify-center">
                  <button 
                    onClick={() => handleEditContact(contact)} 
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button 
                    onClick={() => handleDeleteContact(contact.contactNumber)} 
                    className="text-red-500 hover:text-red-700"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>

  {showAddMailModal && (
    <Addmail 
      onClose={handleCloseAddMailModal} 
      mobile={mobileNumber} 
      onEmailAdded={fetchContacts} 
      contactToEdit={contactToEdit}  // Pass the contact to be edited to the modal
    />
  )}
</div>


  );
};

export default AddEmailsPage;
