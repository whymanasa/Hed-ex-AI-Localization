import React from 'react';

function OutputDisplay({ localizedContent, recommendations, loading }) {
  // If no content and recommendations are available, show loading state or empty message
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold text-blue-600">Processing...</h2>
      </div>
    );
  }

  if (!localizedContent && !recommendations) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold text-gray-600">No data available. Please enter course content and select a language.</h2>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      {localizedContent && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-green-600">Localized Course Content</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{localizedContent}</p>
        </div>
      )}
      
      {/* Ignoring recommendations for now */}
    </div>
  );
}

export default OutputDisplay;
