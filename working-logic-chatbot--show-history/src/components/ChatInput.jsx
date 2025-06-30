// ChatInput.jsx
import React, { useState, useRef, useEffect } from 'react';

const ChatInput = ({
  onSendMessage,
  onNameSubmit,
  onEmailSubmit,
  onBothSubmitted, // Called when both name and email are collected
  placeholder = "Enter your name...",
  disabled = false,
  currentStep = "name", // "name", "email", or "complete"
}) => {
  const [inputValue, setInputValue] = useState('');
  const [collectedName, setCollectedName] = useState('');
  const [collectedEmail, setCollectedEmail] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus(); // Auto-focus on mount
    }
  }, [currentStep]);

  // Email validation function
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getCurrentPlaceholder = () => {
    switch (currentStep) {
      case "name":
        return "Enter your name...";
      case "email":
        return "Enter your email address...";
      default:
        return placeholder;
    }
  };

  const getInputType = () => {
    return currentStep === "email" ? "email" : "text";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    
    if (!trimmed || disabled) return;

    console.log(`Sending ${currentStep}:`, trimmed); // debug log

    if (currentStep === "name") {
      // Handle name submission
      setCollectedName(trimmed);
      if (onNameSubmit) {
        onNameSubmit(trimmed);
      }
      setInputValue('');
    } else if (currentStep === "email") {
      // Validate email before submission
      if (!isValidEmail(trimmed)) {
        // You might want to show an error message here
        alert("Please enter a valid email address");
        return;
      }
      
      // Handle email submission
      setCollectedEmail(trimmed);
      if (onEmailSubmit) {
        onEmailSubmit(trimmed);
      }
      
      // Call the completion callback with both values
      if (onBothSubmitted) {
        onBothSubmitted({
          name: collectedName,
          email: trimmed
        });
      }
      
      setInputValue('');
    } else if (onSendMessage) {
      // Fallback to regular message sending
      onSendMessage(trimmed);
      setInputValue('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent default newline
      handleSubmit(e);
    }
  };

  // Don't render if we're in complete state and no onSendMessage is provided
  if (currentStep === "complete" && !onSendMessage) {
    return null;
  }

  return (
    <div className="chat-input-container">
      <form onSubmit={handleSubmit} className="chat-input-form">
        <div className="chat-input-wrapper">
          <input
            ref={inputRef}
            type={getInputType()}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={getCurrentPlaceholder()}
            className="chat-input-field"
            disabled={disabled}
            autoComplete={currentStep === "email" ? "email" : "name"}
          />

          <button
            type="submit"
            className="chat-send-button"
            disabled={!inputValue.trim() || disabled}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22 2L2 8.667l9.583 3.75L22 2z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="m11.583 12.417 3.75 9.583L22 2l-10.417 10.417z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </form>

      {/* Show progress indicator */}
      {(currentStep === "name" || currentStep === "email") && (
        <div className="input-progress">
          <div className="progress-steps">
            <span className={`progress-step ${currentStep === "name" ? "active" : collectedName ? "completed" : ""}`}>
              Name
            </span>
            <span className="progress-separator">→</span>
            <span className={`progress-step ${currentStep === "email" ? "active" : collectedEmail ? "completed" : ""}`}>
              Email
            </span>
          </div>
        </div>
      )}

      {/* Show validation error for email */}
      {currentStep === "email" && inputValue && !isValidEmail(inputValue) && (
        <div className="validation-error">
          Please enter a valid email address
        </div>
      )}

      <div className="chat-footer">
        <span className="chat-footer-text">
          Chat <span className="lightning-emoji">⚡</span> by <span className="brand-name">StudyIndia</span>
        </span>
      </div>

      <style jsx>{`
        .input-progress {
          margin-top: 8px;
          padding: 0 12px;
        }
        
        .progress-steps {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 12px;
        }
        
        .progress-step {
          padding: 4px 8px;
          border-radius: 12px;
          background-color: #f3f4f6;
          color: #6b7280;
          transition: all 0.2s ease;
        }
        
        .progress-step.active {
          background-color: #3b82f6;
          color: white;
        }
        
        .progress-step.completed {
          background-color: #10b981;
          color: white;
        }
        
        .progress-separator {
          color: #9ca3af;
          font-weight: bold;
        }
        
        .validation-error {
          margin-top: 4px;
          padding: 0 12px;
          font-size: 12px;
          color: #ef4444;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default ChatInput;