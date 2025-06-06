import React, { useState } from 'react';
import ContentQuiz from './ContentQuiz';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function OutputDisplay({ localizedContent, language }) {
    const [showQuiz, setShowQuiz] = useState(false);

    if (!localizedContent) {
        return null;
    }

    const handleDownload = async () => {
        try {
            const contentDiv = document.createElement('div');
            contentDiv.style.width = '210mm';
            contentDiv.style.padding = '20mm';
            contentDiv.style.fontFamily = 'Arial, sans-serif';
            contentDiv.style.fontSize = '12pt';
            contentDiv.style.lineHeight = '1.5';
            contentDiv.style.whiteSpace = 'pre-wrap';
            contentDiv.style.position = 'absolute';
            contentDiv.style.left = '-9999px';
            contentDiv.style.top = '-9999px';
            
            contentDiv.innerHTML = localizedContent;
            
            document.body.appendChild(contentDiv);
            
            const canvas = await html2canvas(contentDiv, {
                scale: 2,
                useCORS: true,
                logging: false
            });
            
            document.body.removeChild(contentDiv);
            
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
        <div className="flex-1 border border-gray-300 rounded-lg overflow-y-auto relative bg-white">
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Localized Content</h2>
                    <div className="flex space-x-2">
                        <button
                            onClick={handleDownload}
                            className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors flex items-center space-x-2"
                        >
                            <span>📥</span>
                            <span>Download PDF</span>
                        </button>
                        <button
                            onClick={() => setShowQuiz(!showQuiz)}
                            className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors shadow-lg flex items-center space-x-2"
                        >
                            <span>{showQuiz ? '✕' : '📝'}</span>
                            <span>{showQuiz ? 'Close Quiz' : 'Take Quiz'}</span>
                        </button>
                    </div>
                </div>
                <div className="prose prose-gray max-w-none">
                    <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                            h1: ({node, ...props}) => <h1 className="text-3xl font-bold mb-6 text-gray-900" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-2xl font-semibold mb-4 text-gray-800" {...props} />,
                            p: ({node, ...props}) => <p className="mb-4 text-gray-700" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc ml-8 mb-4" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal ml-8 mb-4" {...props} />,
                            li: ({node, ...props}) => <li className="mb-2" {...props} />,
                            strong: ({node, ...props}) => <strong className="text-gray-900 font-semibold" {...props} />,
                        }}
                    >
                        {localizedContent}
                    </ReactMarkdown>
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


