import React, { useState } from 'react';
import ContentQuiz from './ContentQuiz';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

function OutputDisplay({ localizedContent, language }) {
    const [showQuiz, setShowQuiz] = useState(false);

    if (!localizedContent) {
        return null;
    }

    const handleDownload = async () => {
        try {
            // Create a temporary div to render the content
            const contentDiv = document.createElement('div');
            contentDiv.style.width = '210mm'; // A4 width
            contentDiv.style.padding = '20mm';
            contentDiv.style.fontFamily = 'Arial, sans-serif';
            contentDiv.style.fontSize = '12pt';
            contentDiv.style.lineHeight = '1.5';
            contentDiv.style.whiteSpace = 'pre-wrap';
            contentDiv.style.position = 'absolute';
            contentDiv.style.left = '-9999px';
            contentDiv.style.top = '-9999px';
            
            // Add the content
            contentDiv.innerHTML = localizedContent.split('\n').map(p => 
                `<p style="margin-bottom: 1em;">${p}</p>`
            ).join('');
            
            // Add to document
            document.body.appendChild(contentDiv);
            
            // Convert to canvas
            const canvas = await html2canvas(contentDiv, {
                scale: 2,
                useCORS: true,
                logging: false
            });
            
            // Remove the temporary div
            document.body.removeChild(contentDiv);
            
            // Create PDF
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('localized-content.pdf');
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 relative">
            {/* Quiz Button in left corner */}
            <button
                onClick={() => setShowQuiz(!showQuiz)}
                className="fixed left-4 top-20 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-lg flex items-center space-x-2"
            >
                <span>{showQuiz ? '✕' : '📝'}</span>
                <span>{showQuiz ? 'Close Quiz' : 'Take Quiz'}</span>
            </button>

            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Localized Content</h2>
                    <button
                        onClick={handleDownload}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                    >
                        <span>📥</span>
                        <span>Download PDF</span>
                    </button>
                </div>
                <div className="prose max-w-none">
                    {localizedContent.split('\n').map((paragraph, index) => (
                        <p key={index} className="mb-4">
                            {paragraph}
                        </p>
                    ))}
                </div>
            </div>

            {showQuiz && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <ContentQuiz
                            content={localizedContent}
                            language={language}
                            onClose={() => setShowQuiz(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default OutputDisplay;

