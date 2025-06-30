// FeedbackButtons.jsx - With Tailwind CSS styling
import React, { useState } from 'react';

const FeedbackButtons = ({ messageId, onFeedback, onShowDefault }) => {
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  const handleFeedback = (type) => {
    setSelectedFeedback(type);
    
    if (type === 'up') {
      // Log thumbs up value
      console.log(`Thumbs up feedback for message: ${messageId}`);
      console.log('Feedback type:', type);
      console.log('Timestamp:', new Date().toISOString());
    } else if (type === 'down') {
      // Navigate to the Default case from JSON
      if (onShowDefault) {
        onShowDefault();
      }
      console.log('Navigating to default case for thumbs down feedback');
    }
    
    // Call original feedback handler if provided
    if (onFeedback) {
      onFeedback(messageId, type);
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <button
        className={`flex items-center justify-center p-2 border-none bg-transparent rounded-lg cursor-pointer transition-colors duration-200 hover:bg-gray-200 ${
          selectedFeedback === 'up' ? 'bg-gray-200' : ''
        }`}
        onClick={() => handleFeedback('up')}
        title="This was helpful"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 122.88 106.16" 
          width="16" 
          height="16" 
          fill={selectedFeedback === 'up' ? "#10b981" : "#9ca3af"}
        >
          <path 
            fillRule="evenodd" 
            clipRule="evenodd" 
            d="M4.02,44.6h27.36c2.21,0,4.02,1.81,4.02,4.03v53.51c0,2.21-1.81,4.03-4.02,4.03H4.02c-2.21,0-4.02-1.81-4.02-4.03V48.63C0,46.41,1.81,44.6,4.02,44.6L4.02,44.6z M63.06,4.46c2.12-10.75,19.72-0.85,20.88,16.48c0.35,5.3-0.2,11.47-1.5,18.36l25.15,0c10.46,0.41,19.59,7.9,13.14,20.2c1.47,5.36,1.69,11.65-2.3,14.13c0.5,8.46-1.84,13.7-6.22,17.84c-0.29,4.23-1.19,7.99-3.23,10.88c-3.38,4.77-6.12,3.63-11.44,3.63H55.07c-6.73,0-10.4-1.85-14.8-7.37V51.31c12.66-3.42,19.39-20.74,22.79-32.11V4.46L63.06,4.46z"
          />
        </svg>
      </button>
      
      <button
        className={`flex items-center justify-center p-2 border-none bg-transparent rounded-lg cursor-pointer transition-colors duration-200 hover:bg-gray-200 ${
          selectedFeedback === 'down' ? 'bg-gray-200' : ''
        }`}
        onClick={() => handleFeedback('down')}
        title="This wasn't helpful"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 122.88 106.16" 
          width="16" 
          height="16" 
          fill={selectedFeedback === 'down' ? "#ef4444" : "#9ca3af"}
        >
          <path 
            fillRule="evenodd" 
            clipRule="evenodd" 
            d="M4.03,61.56h27.36c2.21,0,4.02-1.81,4.02-4.02V4.03C35.41,1.81,33.6,0,31.39,0H4.03C1.81,0,0,1.81,0,4.03v53.51C0,59.75,1.81,61.56,4.03,61.56L4.03,61.56z M63.06,101.7c2.12,10.75,19.72,0.85,20.88-16.48c0.35-5.3-0.2-11.47-1.5-18.36l25.15,0c10.46-0.41,19.59-7.9,13.14-20.2c1.47-5.36,1.69-11.65-2.3-14.13c0.5-8.46-1.84-13.7-6.22-17.84c-0.29-4.23-1.19-7.99-3.23-10.88c-3.38-4.77-6.12-3.63-11.44-3.63H55.07c-6.73,0-10.4,1.85-14.8,7.37v47.31c12.66,3.42,19.39,20.74,22.79,32.11V101.7L63.06,101.7L63.06,101.7z"
          />
        </svg>
      </button>
    </div>
  );
};

export default FeedbackButtons;