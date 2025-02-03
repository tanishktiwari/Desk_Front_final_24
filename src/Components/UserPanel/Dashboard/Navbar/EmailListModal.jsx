import React from 'react';

const EmailListModal = ({ emailList, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[500px] relative">
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          &times; {/* "X" Symbol */}
        </button>
        <h2 className="text-xl font-bold mb-4">Submitted Emails</h2>
        <button 
          onClick={onClose} 
          className="bg-blue-500 text-white rounded-md py-2 px-4 mb-4 hover:bg-blue-600 focus:outline-none"
        >
          Add Email
        </button>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2">Name</th>
                <th className="border border-gray-300 p-2">Number</th>
                <th className="border border-gray-300 p-2">Email</th>
                <th className="border border-gray-300 p-2">Designation</th>
              </tr>
            </thead>
            <tbody>
              {emailList.map((email, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-2">{email.name}</td>
                  <td className="border border-gray-300 p-2">{email.number}</td>
                  <td className="border border-gray-300 p-2">{email.email}</td>
                  <td className="border border-gray-300 p-2">{email.designation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmailListModal;
