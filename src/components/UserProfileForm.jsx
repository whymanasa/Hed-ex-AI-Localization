import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const UserProfileForm = ({ onProfileSubmit }) => {
  const { t } = useTranslation();
  const [profileData, setProfileData] = useState({
    name: "",
    age: "",
    interests: "",
  });

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
    localStorage.setItem("userProfile", JSON.stringify(profileData));
    navigate("/home");
  };

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



