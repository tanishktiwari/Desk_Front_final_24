import React, { useState, useEffect } from 'react';

const ContactMatrix = () => {
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [contactData, setContactData] = useState([]);
  const [newContacts, setNewContacts] = useState([{ role: '', name: '', phone: '', email: '' }]);

  // Fetch companies list
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/companies`);
        if (!response.ok) {
          throw new Error('Failed to fetch companies.');
        }
        const data = await response.json();
        setCompanies(data);
      } catch (error) {
        console.error('Error fetching companies:', error);
        setError(error.message);
      }
    };

    fetchCompanies();
  }, []);

  // Handle company selection
  const handleCompanyChange = async (event) => {
    const companyId = event.target.value;
    setSelectedCompany(companyId);

    // Fetch contact data for the selected company
    if (companyId) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/company/${companyId}/contract`);
        if (!response.ok) {
          throw new Error('Failed to fetch contact data.');
        }
        const data = await response.json();
        setContactData(data.contractMatrix);  // Updated to fetch contractMatrix
      } catch (error) {
        console.error('Error fetching contact data:', error);
        setContactData([]);
      }
    } else {
      setContactData([]);
    }
  };

  // Handle input change for new contacts
  const handleInputChange = (index, event) => {
    const { name, value } = event.target;
    const updatedContacts = [...newContacts];
    updatedContacts[index][name] = value;
    setNewContacts(updatedContacts);
  };

  // Add a new contact row
  const handleAddRow = () => {
    if (newContacts.length < 7) {
      setNewContacts([...newContacts, { role: '', name: '', phone: '', email: '' }]);
    }
  };

  // Remove a contact row
  const handleDeleteRow = (index) => {
    const updatedContacts = newContacts.filter((_, i) => i !== index);
    setNewContacts(updatedContacts);
  };

  // Submit new contacts to the API
  const handleSubmit = async () => {
    if (!selectedCompany) {
      alert('Please select a company first.');
      return;
    }

    const url = `${import.meta.env.VITE_API_URL}/api/company/${selectedCompany}/contract`;  // Ensure this is the correct URL
    console.log('Submitting to:', url);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: newContacts[0].role,  // Just submitting the first contact row for now
          name: newContacts[0].name,
          phone: newContacts[0].phone,
          email: newContacts[0].email,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add contact.');
      }

      const result = await response.json();
      console.log('Success:', result);

      // Optionally update the UI or display a success message
      setContactData(result.company.contractMatrix);  // Use updated contractMatrix
      alert('Contract matrix entry added successfully!');
    } catch (error) {
      console.error('Error adding contact:', error);
      setError('Failed to add contacts.');
    }
  };

  // Delete contact from the backend
  const handleDeleteContact = async (mobileNumber) => {
    if (!selectedCompany) {
      alert('Please select a company first.');
      return;
    }

    const url = `${import.meta.env.VITE_API_URL}/api/company/${selectedCompany}/contract/${mobileNumber}`;
    console.log('Deleting from:', url);

    try {
      const response = await fetch(url, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete contact.');
      }

      const result = await response.json();
      console.log('Success:', result);

      // Optionally update the UI or display a success message
      setContactData(result.company.contractMatrix);  // Use updated contractMatrix
      alert('Contract matrix entry deleted successfully!');
    } catch (error) {
      console.error('Error deleting contact:', error);
      setError('Failed to delete contact.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4 font-poppins">
      <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 max-w-full text-center">
        <h1 className="text-xl font-semibold mb-4">Contact Matrix</h1>

        {error && <p className="text-red-500">{error}</p>}

        {/* Dropdown for selecting company */}
        <div>
          <label htmlFor="company-dropdown" className="block text-gray-700">Select Company:</label>
          <select
            id="company-dropdown"
            className="w-full p-2 mt-2 border border-gray-300 rounded-md text-center"
            onChange={handleCompanyChange}
          >
            <option value="">-- Choose a company --</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>

        {/* If a company is selected, show the contact matrix layout */}
        {selectedCompany && (
          <div className="min-h-screen flex items-center justify-center p-4 font-poppins"
               style={{ backgroundImage: 'linear-gradient(to right, #ffde59, #ffdd58, #ffdc5a, #ffdb59, #ffdb58, #ffda58, #ffd959, #ffda58, #ffd758, #fed557, #ffd157, #ffd058, #ffcc56, #ffca56, #ffc755, #ffc456, #feb952, #feb252, #feb252, #ffa851, #ffa750, #ffa451, #ffa04e, #ff9f50, #fe9d4e, #ff9c50, #ff994e, #ff974e, #ff964e, #ff924d, #fd934f)' }}>

            <div className="w-full max-w-full shadow-lg rounded-lg">
              <div className="bg-transparent text-black p-4">
                <h1 className="text-5xl font-semibold text-center bg-gradient-to-r from-[#414d70] via-[#344d89] to-[#3d4a84] bg-clip-text text-transparent">
                  Contact Matrix
                </h1>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <tbody>
                    {contactData.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center text-gray-500 py-4">No contacts available</td>
                      </tr>
                    ) : (
                      contactData.map((contact, index) => (
                        <tr key={index} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} transition-colors`}>
                          <td className="px-4 py-4 text-center font-poppins border-2 border-black font-medium text-black">{contact.role}</td>
                          <td className="px-4 py-4 text-center font-poppins border-2 border-black text-black">{contact.name}</td>
                          <td className="px-4 py-4 text-center font-poppins border-2 border-black text-black">{contact.phone}</td>
                          <td className="px-4 py-4 text-center font-poppins border-2 border-black text-black">
                            <a
                              href={`mailto:${contact.email}`}
                              className="text-black hover:text-blue-800 hover:underline"
                            >
                              {contact.email}
                            </a>
                          </td>
                          <td className="text-center">
                            <button
                              onClick={() => handleDeleteContact(contact.phone)}
                              className="text-red-500 hover:text-red-700"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Dynamic contact form */}
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-2">Add New Contacts:</h2>
                {newContacts.map((contact, index) => (
                  <div key={index} className="mb-4 flex gap-4">
                    <input
                      type="text"
                      name="role"
                      value={contact.role}
                      onChange={(e) => handleInputChange(index, e)}
                      placeholder="Role"
                      className="w-1/4 p-2 border border-gray-300 rounded-md"
                      disabled={contactData.length > 0 && contactData[index] ? true : false}
                    />
                    <input
                      type="text"
                      name="name"
                      value={contact.name}
                      onChange={(e) => handleInputChange(index, e)}
                      placeholder="Name"
                      className="w-1/4 p-2 border border-gray-300 rounded-md"
                      disabled={contactData.length > 0 && contactData[index] ? true : false}
                    />
                    <input
                      type="text"
                      name="phone"
                      value={contact.phone}
                      onChange={(e) => handleInputChange(index, e)}
                      placeholder="Phone"
                      className="w-1/4 p-2 border border-gray-300 rounded-md"
                      disabled={contactData.length > 0 && contactData[index] ? true : false}
                    />
                    <input
                      type="email"
                      name="email"
                      value={contact.email}
                      onChange={(e) => handleInputChange(index, e)}
                      placeholder="Email"
                      className="w-1/4 p-2 border border-gray-300 rounded-md"
                      disabled={contactData.length > 0 && contactData[index] ? true : false}
                    />
                    {index > 0 && (
                      <button
                        type="button"
                        className="text-red-500"
                        onClick={() => handleDeleteRow(index)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))}
                {newContacts.length < 7 && (
                  <button
                    className="text-blue-500 mt-2"
                    onClick={handleAddRow}
                  >
                    + Add Another Contact
                  </button>
                )}
                <button
                  onClick={handleSubmit}
                  className="mt-4 bg-blue-500 text-white p-2 rounded-md"
                >
                  Submit Contacts
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactMatrix;
