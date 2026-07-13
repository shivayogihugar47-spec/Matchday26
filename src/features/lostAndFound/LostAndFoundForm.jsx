import { useState } from 'react';
import TicketCard from '../../components/TicketCard';

export default function LostAndFoundForm() {
  const [formData, setFormData] = useState({
    ageRange: '',
    clothing: '',
    lastSeenZone: '',
    language: 'en',
    notes: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Send to backend API
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <TicketCard>
        <h3 className="font-display text-xl text-primary mb-4">Lost & Found Report Submitted!</h3>
        <p className="text-neutralText">Your report has been received. Announcements will be made in English, Spanish, and Hindi. Reference ID: #STADIUM-001</p>
        <button 
          onClick={() => setSubmitted(false)}
          className="mt-4 px-4 py-2 rounded-button bg-matchdayRed text-white font-semibold hover:bg-matchdayRed/90"
        >
          Submit Another Report
        </button>
      </TicketCard>
    );
  }

  return (
    <TicketCard>
      <h3 className="font-display text-xl text-primary mb-4">Report Lost Person</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutralText mb-1">Age Range</label>
          <select 
            name="ageRange" 
            value={formData.ageRange}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-button border border-gray-200 focus:outline-none focus:border-matchdayRed"
            required
          >
            <option value="">Select age range</option>
            <option value="child">Child (0-12)</option>
            <option value="teen">Teen (13-17)</option>
            <option value="adult">Adult (18-64)</option>
            <option value="senior">Senior (65+)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-neutralText mb-1">Clothing Description</label>
          <input 
            type="text" 
            name="clothing" 
            value={formData.clothing}
            onChange={handleChange}
            placeholder="What were they wearing?"
            className="w-full px-4 py-2 rounded-button border border-gray-200 focus:outline-none focus:border-matchdayRed"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-neutralText mb-1">Last Seen Zone</label>
          <select 
            name="lastSeenZone" 
            value={formData.lastSeenZone}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-button border border-gray-200 focus:outline-none focus:border-matchdayRed"
            required
          >
            <option value="">Select zone</option>
            <option value="gate-a">Gate A</option>
            <option value="gate-b">Gate B</option>
            <option value="gate-c">Gate C</option>
            <option value="gate-d">Gate D</option>
            <option value="concourses">Concourses</option>
            <option value="seating">Seating Bowl</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-neutralText mb-1">Preferred Language</label>
          <select 
            name="language" 
            value={formData.language}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-button border border-gray-200 focus:outline-none focus:border-matchdayRed"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="hi">Hindi</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-neutralText mb-1">Additional Notes</label>
          <textarea 
            name="notes" 
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any other details..."
            rows={3}
            className="w-full px-4 py-2 rounded-button border border-gray-200 focus:outline-none focus:border-matchdayRed"
          />
        </div>
        
        <button 
          type="submit"
          className="w-full bg-matchdayRed text-white px-6 py-3 rounded-button font-semibold hover:bg-matchdayRed/90"
        >
          Submit Report
        </button>
      </form>
    </TicketCard>
  );
}
