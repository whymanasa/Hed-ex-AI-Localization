import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const SEA_LANGUAGES = [
  // A
  { code: "ace", name: "Bahsa Acèh", country: "Indonesia" },
  // B
  { code: "ban", name: "Basa Bali", country: "Indonesia" },
  { code: "bn", name: "বাংলা", country: "Regional" },
  { code: "bik", name: "Bikol", country: "Philippines" },
  { code: "bug", name: "ᨅᨔ ᨕᨘᨁᨗ", country: "Indonesia" },
  { code: "ms-bn", name: "بهاس ملايو", country: "Brunei" },
  // C
  { code: "ceb", name: "Bisaya", country: "Philippines" },
  { code: "zh", name: "中文", country: "Major" },
  { code: "zh-hk", name: "廣東話", country: "Major" },
  { code: "zh-tw", name: "繁體中文", country: "Major" },
  { code: "zh-my", name: "马来西亚华语", country: "Malaysia" },
  { code: "zh-sg", name: "新加坡华语", country: "Singapore" },
  { code: "zh-vn", name: "越南华语", country: "Vietnam" },
  { code: "zh-kh", name: "柬埔寨华语", country: "Cambodia" },
  // E
  { code: "en", name: "English", country: "Major" },
  // F
  { code: "fil", name: "Filipino", country: "Philippines" },
  // G
  { code: "gu", name: "ગુજરાતી", country: "Regional" },
  // H
  { code: "hil", name: "Hiligaynon", country: "Philippines" },
  { code: "hi", name: "हिंदी", country: "Regional" },
  { code: "hnj", name: "Hmong", country: "Laos" },
  // I
  { code: "id", name: "Bahasa Indonesia", country: "Indonesia" },
  { code: "ilo", name: "Ilokano", country: "Philippines" },
  // J
  { code: "jv", name: "Basa Jawa", country: "Indonesia" },
  { code: "kac", name: "Jinghpaw", country: "Myanmar" },
  // K
  { code: "kn", name: "ಕನ್ನಡ", country: "Regional" },
  { code: "pam", name: "Kapampangan", country: "Philippines" },
  { code: "km", name: "ខ្មែរ", country: "Cambodia" },
  // L
  { code: "lo", name: "ພາສາລາວ", country: "Laos" },
  { code: "lwl", name: "Eastern Lawa", country: "Thailand" },
  // M
  { code: "ms", name: "Bahasa Melayu", country: "Malaysia" },
  { code: "ml", name: "മലയാളം", country: "Regional" },
  { code: "mr", name: "मराठी", country: "Regional" },
  { code: "min", name: "Baso Minangkabau", country: "Indonesia" },
  { code: "mnw", name: "ဘာသာ မန်", country: "Myanmar" },
  { code: "my", name: "မြန်မာ", country: "Myanmar" },
  // N
  { code: "nod", name: "ᨣᩤᩴᨾᩮᩬᩥᨦ", country: "Thailand" },
  // P
  { code: "pag", name: "Pangasinan", country: "Philippines" },
  { code: "pa", name: "ਪੰਜਾਬੀ", country: "Regional" },
  // S
  { code: "su", name: "Basa Sunda", country: "Indonesia" },
  { code: "shn", name: "လိၵ်ႈတႆး", country: "Myanmar" },
  // T
  { code: "ta", name: "தமிழ்", country: "Malaysia" },
  { code: "ta-sg", name: "சிங்கப்பூர் தமிழ்", country: "Singapore" },
  { code: "te", name: "తెలుగు", country: "Regional" },
  { code: "th", name: "ไทย", country: "Thailand" },
  { code: "tet", name: "Tetun", country: "East Timor" },
  { code: "tts", name: "ภาษาอีสาน", country: "Thailand" },
  // U
  { code: "ur", name: "اردو", country: "Regional" },
  // V
  { code: "vi", name: "Tiếng Việt", country: "Vietnam" },
  // W
  { code: "war", name: "Winaray", country: "Philippines" }
].sort((a, b) => a.name.localeCompare(b.name));

const UserProfileForm = ({ onProfileSubmit }) => {
  const { t } = useTranslation();
  const [profileData, setProfileData] = useState(() => {
    const savedProfile = sessionStorage.getItem('userProfile');
    return savedProfile ? JSON.parse(savedProfile) : {
      name: "",
      age: "",
      interests: "",
      preferredLanguage: sessionStorage.getItem('preferredLanguage') || "en"
    };
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
            {t("select_language")}
          </label>
          <p className="text-sm text-gray-500 mb-2">
            {t("language_description")}
          </p>
          <div className="relative">
            <input
              type="text"
              placeholder={t("search_languages")}
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
              <option value="">{t("select_preferred_language")}</option>
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



