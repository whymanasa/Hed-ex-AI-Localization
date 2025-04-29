import React, { useState } from 'react';
import axios from 'axios';

function InputForm({ setLocalizedContent, setRecommendations }) {
  const [courseContent, setCourseContent] = useState('');
  const [language, setLanguage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/translate', { // <-- updated to 3000
        content: courseContent,
        targetLanguage: language,
      });

      setLocalizedContent(response.data.localizedContent); // translated + localized content
      setRecommendations(response.data.recommendations);   // suggested courses
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
        <option value="tl">Filipino (Tagalog)</option>
        <option value="id">Bahasa Indonesia</option>
        <option value="th">Thai</option>
        <option value="vi">Vietnamese</option>
        <option value="ms">Malay</option>
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

