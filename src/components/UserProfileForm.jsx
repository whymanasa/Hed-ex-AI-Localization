"use client"

import { useState } from "react"

function UserProfileForm({ onProfileSubmit }) {
  // Load profile data from localStorage or set defaults
  const [country, setCountry] = useState(() => {
    const savedProfile = localStorage.getItem("userProfile")
    return savedProfile ? JSON.parse(savedProfile).country : ""
  })

  const [age, setAge] = useState(() => {
    const savedProfile = localStorage.getItem("userProfile")
    return savedProfile ? JSON.parse(savedProfile).age : ""
  })

  const [learningStyle, setLearningStyle] = useState(() => {
    const savedProfile = localStorage.getItem("userProfile")
    return savedProfile ? JSON.parse(savedProfile).learningStyle : ""
  })

  const handleSubmit = (e) => {
    e.preventDefault()

    const profile = { country, age, learningStyle }

    // Store profile in localStorage
    localStorage.setItem("userProfile", JSON.stringify(profile))

    // Call the callback function to pass profile data back to the parent component
    onProfileSubmit(profile)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl mb-8"
    >
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Your Learning Profile</h2>

      <div className="space-y-5">
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <input
            id="country"
            type="text"
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
            placeholder="Enter your country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
            Age
          </label>
          <input
            id="age"
            type="number"
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
            placeholder="Enter your age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="learningStyle" className="block text-sm font-medium text-gray-700 mb-1">
            Learning Style
          </label>
          <select
            id="learningStyle"
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm appearance-none"
            value={learningStyle}
            onChange={(e) => setLearningStyle(e.target.value)}
            required
          >
            <option value="">Select Learning Style</option>
            <option value="Visual">Visual</option>
            <option value="Auditory">Auditory</option>
            <option value="Kinesthetic">Kinesthetic</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="w-full mt-6 bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none transition-all duration-300 font-medium text-base shadow-md"
      >
        Save Profile
      </button>

      {country && age && learningStyle && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
          <p>✓ Profile information is complete</p>
        </div>
      )}
    </form>
  )
}

export default UserProfileForm

