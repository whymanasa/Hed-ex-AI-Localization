import React, { useState, useEffect } from 'react';

function UserProfileForm({ onProfileSubmit }) {
  // Load profile data from localStorage or set defaults
  const [country, setCountry] = useState(() => {
    const savedProfile = localStorage.getItem('userProfile');
    return savedProfile ? JSON.parse(savedProfile).country : '';
  });
  
  const [age, setAge] = useState(() => {
    const savedProfile = localStorage.getItem('userProfile');
    return savedProfile ? JSON.parse(savedProfile).age : '';
  });

  const [learningStyle, setLearningStyle] = useState(() => {
    const savedProfile = localStorage.getItem('userProfile');
    return savedProfile ? JSON.parse(savedProfile).learningStyle : '';
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const profile = { country, age, learningStyle };

    // Store profile in localStorage
    localStorage.setItem('userProfile', JSON.stringify(profile));

    // Call the callback function to pass profile data back to the parent component
    onProfileSubmit(profile);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md mb-8">
      <input
        type="text"
        className="w-full p-3 border border-gray-300 rounded-md mb-4"
        placeholder="Country"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        required
      />
      <input
        type="number"
        className="w-full p-3 border border-gray-300 rounded-md mb-4"
        placeholder="Age"
        value={age}
        onChange={(e) => setAge(e.target.value)}
        required
      />
      <select
        className="w-full p-3 border border-gray-300 rounded-md mb-4"
        value={learningStyle}
        onChange={(e) => setLearningStyle(e.target.value)}
        required
      >
        <option value="">Select Learning Style</option>
        <option value="Visual">Visual</option>
        <option value="Auditory">Auditory</option>
        <option value="Kinesthetic">Kinesthetic</option>
      </select>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700"
      >
        Save Profile
      </button>
    </form>
  );
}

export default UserProfileForm;
