// ChatStep.jsx - Updated with clickable email functionality
import React from 'react';
import FeedbackButtons from './FeedBackButton';
import ChatInput from './ChatInput';
import logoImage from '../assets/StudyIndia(logo).png';
import moeLogo from '../assets/MoE logo.svg'; // Import MoE logo

const ChatStep = ({ 
  message, 
  options, 
  onOptionClick, 
  messageId, 
  onFeedback, 
  showFeedback = true, 
  messages, 
  userName, 
  userEmail, // Add userEmail prop
  isNameSet, 
  isEmailSet, // Add isEmailSet prop
  onNameSubmit,
  onEmailSubmit, // Add onEmailSubmit prop
  onBothSubmitted, // Add onBothSubmitted prop
  onShowDefault, // Add this prop to handle default case from thumbs down
  currentStep = "name" // Add currentStep prop: "name", "email", or "complete"
}) => {
  const handleFeedback = (msgId, feedbackType) => {
    console.log(`Feedback for message ${msgId}: ${feedbackType}`);
    if (onFeedback) {
      onFeedback(msgId, feedbackType);
    }
  };

  // Function to parse text and make email addresses clickable
  // Fixed parseMessageWithEmails function
const parseMessageWithEmails = (text) => {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const parts = [];
    let lastIndex = 0;
    let match;
  
    while ((match = emailRegex.exec(text)) !== null) {
      // Add text before the email
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      
      // Store the email address for use in the click handler
      const emailAddress = match[0];
      
      // Add the clickable email
      parts.push(
        <a
          key={`email-${match.index}`}
          href={`mailto:${emailAddress}`}
          className="text-blue-600 underline hover:text-blue-800 transition-colors duration-200"
          onClick={(e) => {
            e.preventDefault(); // Prevent default mailto behavior
            window.open(`https://mail.google.com/mail/?view=cm&to=${emailAddress}`, '_blank');
          }}
        >
          {emailAddress}
        </a>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text after the last email
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    
    // If no emails found, return original text
    return parts.length > 0 ? parts : text;
  };

  // Function to render message content with clickable emails
  const renderMessageContent = (messageText) => {
    return messageText.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {parseMessageWithEmails(line)}
        {i < messageText.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  // Determine what message to show based on current step
  const getWelcomeMessage = () => {
    if (!isNameSet) {
      return "Hi there! I am Study in India Assistant.\nWhat is your name?";
    } else if (!isEmailSet) {
      return `Nice to meet you, ${userName}!\nCould you please provide your email address so we can assist you better?`;
    } else {
      return `Welcome ${userName}! Your profile is now complete. How can I help you with studying in India?`;
    }
  };

  // Determine if we should show the input form
  const shouldShowInput = !isNameSet || !isEmailSet;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {shouldShowInput ? (
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-blue-500 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center overflow-hidden">
                <img 
                  src={logoImage} 
                  alt="StudyIndia Logo" 
                  className="w-full h-full object-contain scale-115"
                />
              </div>
              <div>
                <h1 className="text-white font-semibold text-lg">
                  StudyIndia<span className="text-orange-400">Bot</span>
                </h1>
                <p className="text-blue-100 text-sm">Your Study in India Assistant</p>
              </div>
            </div>
            {/* Replace three dots with MoE logo */}
            <div className="w-16 h-16 flex items-center justify-center">
              <img 
                src={moeLogo} 
                alt="Ministry of Education Logo" 
                className="w-full h-full object-contain scale-110"
              />
            </div>
          </div>

          {/* Chat Content */}
          <div className="p-6 min-h-80">
            <div className="bg-gray-50 rounded-2xl p-4 mb-6">
              <p className="text-gray-800 text-base leading-relaxed">
                {renderMessageContent(getWelcomeMessage())}
              </p>
              
              {/* Feedback buttons */}
              {showFeedback && (
                <div className="flex justify-end mt-4">
                  <FeedbackButtons
                    messageId="welcome-message"
                    onFeedback={handleFeedback}
                    onShowDefault={onShowDefault}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Input Section */}
          <div className="px-6 pb-6">
            <div className="flex space-x-3">
              <div className="flex-1">
                <ChatInput
                  currentStep={currentStep}
                  onNameSubmit={onNameSubmit}
                  onEmailSubmit={onEmailSubmit}
                  onBothSubmitted={onBothSubmitted}
                />
              </div>
            </div>
          </div>

          {/* WhatsApp Button */}
          <div className="px-6 pb-6">
            <button
              onClick={() => {
                const phoneNumber = "917889177625"; // +enter whatsapp number
                const message = encodeURIComponent("Hi, I need help with studying in India");
                const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
                window.open(whatsappUrl, '_blank');
              }}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-full flex items-center justify-center space-x-2 transition-colors duration-200 shadow-lg"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.485 3.515"/>
              </svg>
              <span>Connect on WhatsApp</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden h-[600px] flex flex-col">
          {/* Header */}
          <div className="bg-blue-500 px-6 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center p-1">
                <img 
                  src={logoImage} 
                  alt="StudyIndia Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-white font-semibold text-lg">
                  StudyIndia<span className="text-orange-400">Bot</span>
                </h1>
                <p className="text-blue-100 text-sm">Hello, {userName}!</p>
              </div>
            </div>
            {/* Replace three dots with MoE logo */}
            <div className="w-16 h-16 flex items-center justify-center">
              <img 
                src={moeLogo} 
                alt="Ministry of Education Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Scrollable Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
            {messages.map((message, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-4">
                <p className="text-gray-800 text-base leading-relaxed">
                  {renderMessageContent(message)}
                </p>

                {showFeedback && index === messages.length - 1 && (
                  <div className="flex justify-end mt-4">
                    <FeedbackButtons
                      messageId={`message-${index}`}
                      onFeedback={handleFeedback}
                      onShowDefault={onShowDefault}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Sticky Options Section */}
          {options && options.length > 0 && (
            <div className="bg-white border-t border-gray-200 p-4 flex flex-wrap gap-2 flex-shrink-0">
              {options.map((option, index) => (
                <button
                  key={index}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm transition-colors duration-200"
                  onClick={() => onOptionClick(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {/* WhatsApp Button */}
          <div className="px-6 pb-4 flex-shrink-0">
            <button
              onClick={() => {
                const phoneNumber = "917889177625"; // +91 7889177625 without + and spaces
                const message = encodeURIComponent("Hi, I need help with studying in India");
                const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
                window.open(whatsappUrl, '_blank');
              }}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-full flex items-center justify-center space-x-2 transition-colors duration-200 shadow-lg"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.485 3.515"/>
              </svg>
              <span>Connect on WhatsApp</span>
            </button>
          </div>

          {/* Footer */}
          <div className="text-center py-3 bg-gray-50 flex-shrink-0">
            <p className="text-gray-500 text-sm">
              Chat ⚡ by <span className="text-blue-500 font-semibold">StudyIndia</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatStep;