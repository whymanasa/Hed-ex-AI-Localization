import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

function InputForm({ setLocalizedContent, setRecommendations }) {
  const { t } = useTranslation();
  const [courseContent, setCourseContent] = useState('');
  const [language, setLanguage] = useState('');
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
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
      const response = await axios.post('http://localhost:3000/translate', {
        content: courseContent,
        targetLanguage: language,
        profile: userProfile,
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
        placeholder={t("paste_course_content")}
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
        <option value="">{t("select_target_language")}</option>
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
        {loading ? t("processing") : t("translate_button")}
      </button>
    </form>
  );
}

export default InputForm;




