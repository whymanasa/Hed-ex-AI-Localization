import React, { useState, useEffect } from 'react';
import axios from 'axios';

function InputForm({ setLocalizedContent, setRecommendations }) {
  const [courseContent, setCourseContent] = useState('');
  const [language, setLanguage] = useState('');
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    // Retrieve user profile from localStorage when the component mounts
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
      setUserProfile(JSON.parse(storedProfile));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userProfile) {
      alert("Please complete your profile first.");
      return;
    }

    setLoading(true);

    try {
      // Send both content and profile data to the backend
      const response = await axios.post('http://localhost:3000/translate', {
        content: courseContent,
        targetLanguage: language,
        profile: userProfile, // Use the retrieved profile data here
      });

      setLocalizedContent(response.data.localizedContent);
      setRecommendations(response.data.recommendations); // The recommendations are from the backend

    } catch (error) {
      console.error(error);
      alert('Something went wrong. Please try again.');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md mb-8">
      <textarea
        className="w-full p-3 border border-gray-300 rounded-md mb-4"
        rows="6"
        placeholder="Paste your course content here..."
        value={courseContent}
        onChange={(e) => setCourseContent(e.target.value)}
        required
      />

      <select
        className="w-full p-3 border border-gray-300 rounded-md mb-4"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        required
      >
        <option value="">Select Target Language</option>
        <option value="id">Bahasa Indonesia</option>
        <option value="ms">Malay</option>
        <option value="th">Thai</option>
        <option value="vi">Vietnamese</option>
        <option value="tl">Filipino (Tagalog)</option>
      </select>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Translate and Localize'}
      </button>
    </form>
  );
}

export default InputForm;



