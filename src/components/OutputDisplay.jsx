import React from 'react';

function OutputDisplay({ localizedContent, recommendations }) {
  if (!localizedContent && !recommendations) return null;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      {localizedContent && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-green-600">Localized Course Content</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{localizedContent}</p>
        </div>
      )}
      
      {recommendations && (
        <div>
          <h2 className="text-2xl font-semibold mb-2 text-purple-600">Personalized Learning Suggestions</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{recommendations}</p>
        </div>
      )}
    </div>
  );
}

export default OutputDisplay;
