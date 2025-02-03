import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import { Star } from 'lucide-react';

const FeedbackPopup = ({ ticket, onClose, onSubmitFeedback }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleRatingHover = (value) => {
    setHoveredRating(value);
  };

  const handleRatingClick = (value) => {
    setRating(value);
  };

  const handleSubmit = async () => {
    try {
      // Submit feedback to backend
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/ticket/${ticket.ticketId}/feedback`, {
        rating,
        comment
      });

      // Notify parent component of successful submission
      onSubmitFeedback(ticket.ticketId);
      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      // Optionally show error message to user
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white w-[800px] h-[500px] rounded-xl shadow-2xl flex">
        {/* Left Side - Ticket Details */}
        <div className="w-1/2 bg-gray-100 p-8 rounded-l-xl">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Ticket Details</h2>
          <div className="space-y-4">
            <div>
              <span className="font-semibold text-gray-600">Ticket Number:</span>
              <p className="text-lg">{ticket.ticketNo}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-600">Category:</span>
              <p className="text-lg">{ticket.category}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-600">Description:</span>
              <p className="text-md text-gray-700">{ticket.description}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-600">Resolved Date:</span>
              <p className="text-lg">{new Date(ticket.resolvedDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Right Side - Feedback */}
        <div className="w-1/2 p-8 flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Provide Feedback</h2>
          
          {/* Star Rating */}
          <div className="flex justify-center mb-6">
            {[1, 2, 3, 4, 5].map((value) => (
              <Star
                key={value}
                size={40}
                fill={value <= (hoveredRating || rating) ? '#FFD700' : 'none'}
                stroke="#FFD700"
                className="cursor-pointer mx-1"
                onMouseEnter={() => handleRatingHover(value)}
                onMouseLeave={() => handleRatingHover(0)}
                onClick={() => handleRatingClick(value)}
              />
            ))}
          </div>

          {/* Feedback Comment */}
          <textarea 
            className="w-full h-32 p-4 border rounded-lg mb-6 resize-none"
            placeholder="Share your experience (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          {/* Submit Button */}
          <button 
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-300"
            onClick={handleSubmit}
            disabled={rating === 0}
          >
            Submit Feedback
          </button>

          {/* Close Button */}
          <button 
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPopup;