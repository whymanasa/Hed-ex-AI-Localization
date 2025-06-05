import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const SEA_LANGUAGES = [
  // A
  { code: "ace", name: "Acehnese", country: "Indonesia" },
  // B
  { code: "ban", name: "Balinese", country: "Indonesia" },
  { code: "bn", name: "Bengali", country: "Regional" },
  { code: "bik", name: "Bikol", country: "Philippines" },
  { code: "bug", name: "Buginese", country: "Indonesia" },
  { code: "ms-bn", name: "Brunei Malay", country: "Brunei" },
  // C
  { code: "ceb", name: "Cebuano", country: "Philippines" },
  { code: "zh", name: "Chinese (Mandarin)", country: "Major" },
  { code: "zh-hk", name: "Chinese (Cantonese)", country: "Major" },
  { code: "zh-tw", name: "Chinese (Traditional)", country: "Major" },
  { code: "zh-my", name: "Malaysian Chinese", country: "Malaysia" },
  { code: "zh-sg", name: "Singaporean Chinese", country: "Singapore" },
  { code: "zh-vn", name: "Vietnamese Chinese", country: "Vietnam" },
  { code: "zh-kh", name: "Cambodian Chinese", country: "Cambodia" },
  // E
  { code: "en", name: "English", country: "Major" },
  // F
  { code: "fil", name: "Filipino (Tagalog)", country: "Philippines" },
  // G
  { code: "gu", name: "Gujarati", country: "Regional" },
  // H
  { code: "hil", name: "Hiligaynon", country: "Philippines" },
  { code: "hi", name: "Hindi", country: "Regional" },
  { code: "hnj", name: "Hmong", country: "Laos" },
  // I
  { code: "id", name: "Indonesian (Bahasa Indonesia)", country: "Indonesia" },
  { code: "ilo", name: "Ilocano", country: "Philippines" },
  // J
  { code: "jv", name: "Javanese", country: "Indonesia" },
  { code: "kac", name: "Jingpho", country: "Myanmar" },
  // K
  { code: "kn", name: "Kannada", country: "Regional" },
  { code: "pam", name: "Kapampangan", country: "Philippines" },
  { code: "km", name: "Khmer", country: "Cambodia" },
  // L
  { code: "lo", name: "Lao", country: "Laos" },
  { code: "lwl", name: "Eastern Lawa", country: "Thailand" },
  // M
  { code: "ms", name: "Malay (Bahasa Melayu)", country: "Malaysia" },
  { code: "ml", name: "Malayalam", country: "Regional" },
  { code: "mr", name: "Marathi", country: "Regional" },
  { code: "min", name: "Minangkabau", country: "Indonesia" },
  { code: "mnw", name: "Mon", country: "Myanmar" },
  { code: "my", name: "Burmese", country: "Myanmar" },
  // N
  { code: "nod", name: "Northern Thai", country: "Thailand" },
  // P
  { code: "pag", name: "Pangasinan", country: "Philippines" },
  { code: "pa", name: "Punjabi", country: "Regional" },
  // S
  { code: "su", name: "Sundanese", country: "Indonesia" },
  { code: "shn", name: "Shan", country: "Myanmar" },
  // T
  { code: "ta", name: "Tamil", country: "Malaysia" },
  { code: "ta-sg", name: "Singaporean Tamil", country: "Singapore" },
  { code: "te", name: "Telugu", country: "Regional" },
  { code: "th", name: "Thai", country: "Thailand" },
  { code: "tet", name: "Tetum", country: "East Timor" },
  { code: "tts", name: "Isan", country: "Thailand" },
  // U
  { code: "ur", name: "Urdu", country: "Regional" },
  // V
  { code: "vi", name: "Vietnamese", country: "Vietnam" },
  // W
  { code: "war", name: "Waray", country: "Philippines" }
].sort((a, b) => a.name.localeCompare(b.name));

const UserProfileForm = ({ onProfileSubmit }) => {
  const { t } = useTranslation();
  const [profileData, setProfileData] = useState({
    name: "",
    age: "",
    interests: "",
    preferredLanguage: "en"
  });
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onProfileSubmit(profileData);
    sessionStorage.setItem("userProfile", JSON.stringify(profileData));
    sessionStorage.setItem("preferredLanguage", profileData.preferredLanguage);
    navigate("/home");
  };

  const filteredLanguages = useMemo(() => {
    if (!searchTerm) return SEA_LANGUAGES;
    const searchLower = searchTerm.toLowerCase();
    return SEA_LANGUAGES.filter(lang => 
      lang.name.toLowerCase().includes(searchLower) || 
      lang.country.toLowerCase().includes(searchLower)
    );
  }, [searchTerm]);

  const groupedLanguages = useMemo(() => {
    const groups = {};
    filteredLanguages.forEach(lang => {
      if (!groups[lang.country]) {
        groups[lang.country] = [];
      }
      groups[lang.country].push(lang);
    });
    return groups;
  }, [filteredLanguages]);

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded">
      <h2 className="text-xl font-semibold mb-4">{t("your_profile")}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder={t("name")}
          value={profileData.name}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
          required
        />
        <input
          type="number"
          name="age"
          placeholder={t("age")}
          value={profileData.age}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
          required
        />
        <input
          type="text"
          name="interests"
          placeholder={t("interests")}
          value={profileData.interests}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
          required
        />
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Select your preferred language for content localization
          </label>
          <p className="text-sm text-gray-500 mb-2">
            This language will be used to localize all your course content. Choose the language you're most comfortable with.
          </p>
          <div className="relative">
            <input
              type="text"
              placeholder="Search languages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded mb-2"
            />
            <select
              name="preferredLanguage"
              value={profileData.preferredLanguage}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded"
              required
            >
              <option value="">Select your preferred language</option>
              {Object.entries(groupedLanguages).map(([country, languages]) => (
                <optgroup key={country} label={country}>
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          {t("save_and_continue")}
        </button>
      </form>
    </div>
  );
};

export default UserProfileForm;



