import React, { useState, useEffect } from "react";
import ChatStep from "./ChatStep";
import ChatInput from "./ChatInput";
import chatbotData from "../data/chatbotData.json";
import useChatLogger from "./useChatLogger"; // Import the custom hook

const ChatFlow = () => {
  const [navStack, setNavStack] = useState(["main"]);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isNameSet, setIsNameSet] = useState(false);
  const [isEmailSet, setIsEmailSet] = useState(false);
  const [isUserInfoComplete, setIsUserInfoComplete] = useState(false);
  const [messages, setMessages] = useState([]);
  
  // Initialize the chat logger hook
  const {
    chatLog,
    sessionId,
    logBotMessage,
    logUserOptionClick,
    logNavigation,
    logUserInput,
    logFeedback,
    downloadChatLogAsExcel,
    autoSaveExcelLog,
    clearChatLog,
    getLogStats
  } = useChatLogger(userName);

  const currentKey = navStack[navStack.length - 1];
  const currentStep = chatbotData[currentKey];
  const processedMessage = currentStep?.message?.replace("{{userName}}", userName) || "";

  // Determine the current input step
  const getCurrentInputStep = () => {
    if (!isNameSet) return "name";
    if (!isEmailSet) return "email";
    return "complete";
  };

  useEffect(() => {
    if (isUserInfoComplete && processedMessage) {
      setMessages(prev => [...prev, processedMessage]);
      
      // Log bot message using the specialized function
      logBotMessage(currentKey, processedMessage, currentStep?.options || []);
    }
  }, [currentKey, isUserInfoComplete]);

  const handleOptionClick = (option) => {
    // Log user option selection
    logUserOptionClick(currentKey, option);

    if (option === "Back to Main Menu") {
      setNavStack(["main"]);
      logNavigation("back_to_main", currentKey, "main");
    } else if (option.startsWith("Back to")) {
      const backTo = option.replace("Back to ", "").trim();
      const newStack = navStack.slice(0, navStack.lastIndexOf(backTo) + 1);
      const finalStack = newStack.length > 0 ? newStack : ["main"];
      setNavStack(finalStack);
      
      logNavigation("back_navigation", currentKey, finalStack[finalStack.length - 1], backTo);
    } else if (chatbotData[option]) {
      setNavStack([...navStack, option]);
      logNavigation("forward_navigation", currentKey, option);
    }
  };

  const handleNameSubmit = (enteredName) => {
    setUserName(enteredName);
    setIsNameSet(true);
    
    // Log name submission
    logUserInput("name_submission", enteredName, "name_input");
    
    console.log("Name submitted:", enteredName);
  };

  const handleEmailSubmit = (enteredEmail) => {
    setUserEmail(enteredEmail);
    setIsEmailSet(true);
    
    // Log email submission
    logUserInput("email_submission", enteredEmail, "email_input");
    
    console.log("Email submitted:", enteredEmail);
  };

  const handleBothSubmitted = (userInfo) => {
    // This is called when both name and email are collected
    setIsUserInfoComplete(true);
    
    // Log completion of user info collection
    logUserInput("user_info_complete", JSON.stringify(userInfo), "info_collection");
    
    console.log("User info collection complete:", userInfo);
    console.log("Moving to main chat...");
  };

  const handleShowDefault = () => {
    // Log thumbs down feedback
    logFeedback("thumbs_down", currentKey);

    if (chatbotData["Default"]) {
      setNavStack([...navStack, "Default"]);
      logNavigation("default_help_shown", currentKey, "Default");
    }
  };

  const handleFeedback = (messageId, feedbackType) => {
    // Log all feedback
    logFeedback(feedbackType, currentKey, messageId);
  };

  return (
    <div>
      <ChatStep
        message={processedMessage}
        options={currentStep?.options}
        onOptionClick={handleOptionClick}
        messages={messages}
        userName={userName}
        userEmail={userEmail}
        isNameSet={isNameSet}
        isEmailSet={isEmailSet}
        currentStep={getCurrentInputStep()} // Add this crucial prop
        onNameSubmit={handleNameSubmit}
        onEmailSubmit={handleEmailSubmit}
        onBothSubmitted={handleBothSubmitted} // Add this handler
        showFeedback={true}
        onShowDefault={handleShowDefault}
        onFeedback={handleFeedback}
      />
      
      {/* Debug Panel - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-sm">
          <h3 className="font-bold text-sm mb-2">Chat Flow Debug</h3>
          <div className="text-xs mb-2 space-y-1">
            <div>Session: {sessionId}</div>
            <div>Name Set: {isNameSet ? '✅' : '❌'}</div>
            <div>Email Set: {isEmailSet ? '✅' : '❌'}</div>
            <div>Info Complete: {isUserInfoComplete ? '✅' : '❌'}</div>
            <div>Current Step: {getCurrentInputStep()}</div>
            <div>Current Key: {currentKey}</div>
            <div>Logs: {chatLog.length}</div>
          </div>
          <div className="space-y-2">
            <button 
              onClick={downloadChatLogAsExcel}
              className="w-full px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
            >
              📊 Download Excel Log
            </button>
            <button 
              onClick={autoSaveExcelLog}
              className="w-full px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
            >
              💾 Manual Save Excel
            </button>
            <button 
              onClick={clearChatLog}
              className="w-full px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
            >
              🗑️ Clear Log
            </button>
            {/* Reset button for testing */}
            <button 
              onClick={() => {
                setUserName("");
                setUserEmail("");
                setIsNameSet(false);
                setIsEmailSet(false);
                setIsUserInfoComplete(false);
                setMessages([]);
                setNavStack(["main"]);
              }}
              className="w-full px-3 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600"
            >
              🔄 Reset Flow
            </button>
          </div>
          <div className="mt-2 text-xs bg-gray-100 p-2 rounded">
            <div className="mb-1"><strong>Stats:</strong></div>
            {Object.entries(getLogStats()).map(([key, value]) => (
              <div key={key}>{key}: {value}</div>
            ))}
          </div>
          <div className="mt-2 max-h-32 overflow-y-auto text-xs bg-gray-100 p-2 rounded">
            <pre>{JSON.stringify(chatLog.slice(-3), null, 1)}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatFlow;