import React, { useState } from 'react';

const Schedules = () => {
  // Mock data for demonstration
  const scheduleData = {
    upcomingEvents: [
      {
        id: 1,
        type: 'Program Session',
        title: 'BIT Semester Start',
        date: '2024-05-01',
        time: '09:00 AM',
        location: 'Main Campus - Block A',
        capacity: 40,
        registered: 35,
        status: 'Upcoming'
      },
      {
        id: 2,
        type: 'Workshop',
        title: 'Introduction to Programming',
        date: '2024-04-15',
        time: '02:00 PM',
        location: 'Computer Lab 1',
        capacity: 25,
        registered: 20,
        status: 'Open'
      },
      {
        id: 3,
        type: 'Marketing Event',
        title: 'Education Fair 2024',
        date: '2024-04-20',
        time: '10:00 AM',
        location: 'City Convention Center',
        capacity: 100,
        registered: 75,
        status: 'Open'
      }
    ],
    aiRecommendations: {
      batchTimings: [
        {
          program: 'Bachelor of Information Technology',
          recommendations: [
            {
              timeSlot: 'Morning (9 AM - 1 PM)',
              confidence: 85,
              reasoning: 'High historical attendance and student preference data',
              potentialEnrollment: 45
            },
            {
              timeSlot: 'Evening (5 PM - 9 PM)',
              confidence: 75,
              reasoning: 'Growing demand from working professionals',
              potentialEnrollment: 35
            }
          ]
        },
        {
          program: 'Bachelor of Business Management',
          recommendations: [
            {
              timeSlot: 'Afternoon (1 PM - 5 PM)',
              confidence: 80,
              reasoning: 'Optimal timing based on student surveys',
              potentialEnrollment: 40
            }
          ]
        }
      ],
      marketingEvents: [
        {
          type: 'Education Fair',
          recommendedDate: '2024-06-15',
          confidence: 90,
          reasoning: 'Aligns with pre-enrollment period and historical attendance patterns',
          expectedAttendance: 150
        },
        {
          type: 'Open House',
          recommendedDate: '2024-05-20',
          confidence: 85,
          reasoning: 'Strategic timing before major intake period',
          expectedAttendance: 80
        }
      ]
    }
  };

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeView, setActiveView] = useState('calendar');

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'upcoming':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'open':
        return 'bg-green-50 text-green-600 border-green-200';
      case 'full':
        return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'cancelled':
        return 'bg-red-50 text-red-600 border-red-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getTypeColor = (type) => {
    switch (type.toLowerCase().replace(' ', '-')) {
      case 'program-session':
        return 'bg-purple-50 text-purple-600 border-purple-200';
      case 'workshop':
        return 'bg-teal-50 text-teal-600 border-teal-200';
      case 'marketing-event':
        return 'bg-orange-50 text-orange-600 border-orange-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const renderCalendarView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scheduleData.upcomingEvents.map(event => (
          <div key={event.id} className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${getTypeColor(event.type)}`}>
                {event.type}
              </span>
              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
                {event.status}
              </span>
            </div>
            
            <h4 className="text-lg font-medium text-slate-800 mb-4">{event.title}</h4>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-2">
                <span className="text-slate-500 text-sm min-w-[4rem]">Date:</span>
                <span className="text-sm text-slate-700">{event.date}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-slate-500 text-sm min-w-[4rem]">Time:</span>
                <span className="text-sm text-slate-700">{event.time}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-slate-500 text-sm min-w-[4rem]">Location:</span>
                <span className="text-sm text-slate-700">{event.location}</span>
              </div>
            </div>

            <div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${(event.registered / event.capacity) * 100}%` }}
                />
              </div>
              <span className="text-sm text-slate-600">
                {event.registered}/{event.capacity} Registered
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAIRecommendations = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Recommended Batch Timings</h3>
        <div className="space-y-6">
          {scheduleData.aiRecommendations.batchTimings.map((program, index) => (
            <div key={index} className="space-y-4">
              <h4 className="text-base font-medium text-slate-700">{program.program}</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {program.recommendations.map((rec, recIndex) => (
                  <div key={recIndex} className="bg-slate-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-sm font-medium text-slate-700">{rec.timeSlot}</span>
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600 border border-green-200">
                        {rec.confidence}% Confidence
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{rec.reasoning}</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Potential Enrollment:</span>
                      <span className="text-slate-700">{rec.potentialEnrollment} students</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Recommended Marketing Events</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {scheduleData.aiRecommendations.marketingEvents.map((event, index) => (
            <div key={index} className="bg-slate-50 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm font-medium text-slate-700">{event.type}</span>
                <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600 border border-green-200">
                  {event.confidence}% Confidence
                </span>
              </div>
              <div className="text-sm text-slate-700 mb-3">
                Recommended Date: {event.recommendedDate}
              </div>
              <p className="text-sm text-slate-600 mb-3">{event.reasoning}</p>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Expected Attendance:</span>
                <span className="text-slate-700">{event.expectedAttendance} visitors</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 mb-2">Schedule Management</h1>
          <p className="text-slate-500">Manage program sessions, workshops, and marketing events</p>
        </div>
        <div className="flex gap-2">
          <button 
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              activeView === 'calendar'
              ? 'bg-blue-50 text-blue-600'
              : 'text-slate-600 hover:bg-slate-50'
            }`}
            onClick={() => setActiveView('calendar')}
          >
            Calendar View
          </button>
          <button 
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              activeView === 'recommendations'
              ? 'bg-blue-50 text-blue-600'
              : 'text-slate-600 hover:bg-slate-50'
            }`}
            onClick={() => setActiveView('recommendations')}
          >
            AI Recommendations
          </button>
        </div>
      </div>

      {activeView === 'calendar' ? renderCalendarView() : renderAIRecommendations()}
    </div>
  );
};

export default Schedules; 