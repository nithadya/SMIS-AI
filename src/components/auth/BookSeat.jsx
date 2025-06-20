import React, { useState } from 'react';
import { bookEventSeat, getCampusEventById } from '../../lib/api/schedules';

const BookSeat = () => {
  const [formData, setFormData] = useState({
    email: '',
    bookingCode: '',
    eventId: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [eventDetails, setEventDetails] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.bookingCode || !formData.eventId) {
      setMessage({ text: 'Please fill all required fields', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      // First get event details
      const { data: event, error: eventError } = await getCampusEventById(formData.eventId);
      if (eventError) {
        setMessage({ text: 'Event not found. Please check your Event ID.', type: 'error' });
        return;
      }
      setEventDetails(event);

      // Try to book the seat
      const { data, error } = await bookEventSeat(formData.eventId, formData.email, formData.bookingCode);
      
      if (error) {
        setMessage({ text: error, type: 'error' });
        return;
      }

      setMessage({ 
        text: `🎉 Success! Your seat has been booked for "${event.title}". You will receive a confirmation email shortly.`, 
        type: 'success' 
      });
      
      // Clear form
      setFormData({
        email: '',
        bookingCode: '',
        eventId: ''
      });

    } catch (error) {
      console.error('Booking error:', error);
      setMessage({ text: 'An unexpected error occurred. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🎫 Book Your Seat</h1>
          <p className="text-gray-600">Secure your spot for the upcoming event</p>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 border border-green-400 text-green-700' 
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {eventDetails && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Event Details:</h3>
            <p className="text-sm text-blue-800"><strong>Title:</strong> {eventDetails.title}</p>
            <p className="text-sm text-blue-800"><strong>Date:</strong> {new Date(eventDetails.start_date).toLocaleDateString()}</p>
            <p className="text-sm text-blue-800"><strong>Time:</strong> {eventDetails.start_time || 'TBD'}</p>
            <p className="text-sm text-blue-800"><strong>Location:</strong> {eventDetails.location || 'TBD'}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Your Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="student@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="eventId" className="block text-sm font-medium text-gray-700 mb-2">
              Event ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="eventId"
              name="eventId"
              value={formData.eventId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter event ID from your invitation"
              required
            />
          </div>

          <div>
            <label htmlFor="bookingCode" className="block text-sm font-medium text-gray-700 mb-2">
              Booking Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="bookingCode"
              name="bookingCode"
              value={formData.bookingCode}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your unique booking code"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              This code was provided in your invitation email
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-md font-medium ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            } text-white transition duration-200`}
          >
            {loading ? 'Booking Your Seat...' : '🎫 Book My Seat'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact your counselor or administration office.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookSeat; 