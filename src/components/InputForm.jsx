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
      const response = await axios.post('http://localhost:5000/translate', {
        content: courseContent,
        targetLanguage: language,
      });

      setLocalizedContent(response.data.localizedContent);
      setRecommendations(response.data.recommendations);
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
        <option value="filipino">Filipino (Tagalog)</option>
        <option value="indonesian">Bahasa Indonesia</option>
        <option value="thai">Thai</option>
        <option value="vietnamese">Vietnamese</option>
        <option value="malay">Malay</option>
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
