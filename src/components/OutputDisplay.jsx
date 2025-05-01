import React from 'react';
import ReactMarkdown from 'react-markdown';

function OutputDisplay({ localizedContent, recommendations, loading }) {
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

      {recommendations && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-blue-600">Localized Learning Materials</h2>
          <div className="prose prose-sm max-w-none text-gray-700">
            <ReactMarkdown>{recommendations}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

export default OutputDisplay;

