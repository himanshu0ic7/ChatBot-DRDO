import { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';

const useChatLogger = (userName = "Anonymous") => {
  const [chatLog, setChatLog] = useState([]);
  const sessionId = useRef(Date.now().toString());

  // Log helper function
  const addToLog = (logEntry) => {
    const timestamp = new Date().toISOString();
    const logItem = {
      sessionId: sessionId.current,
      timestamp,
      userName: userName || "Anonymous",
      ...logEntry
    };
    
    setChatLog(prev => [...prev, logItem]);
    console.log("Chat Log Entry:", logItem);
  };

  // Auto-save every 10 interactions
  useEffect(() => {
    if (chatLog.length > 0 && chatLog.length % 10 === 0) {
      autoSaveExcelLog();
    }
  }, [chatLog.length]);

  // Function to download chat log as Excel
  const downloadChatLogAsExcel = () => {
    if (chatLog.length === 0) {
      console.log("No chat log data to download");
      return;
    }

    // Create session summary sheet
    const sessionSummary = [{
      'Session ID': sessionId.current,
      'User Name': userName || 'Anonymous',
      'Start Time': chatLog[0]?.timestamp || new Date().toISOString(),
      'End Time': new Date().toISOString(),
      'Total Interactions': chatLog.length,
      'Session Duration (minutes)': chatLog.length > 0 ? 
        Math.round((new Date() - new Date(chatLog[0]?.timestamp)) / (1000 * 60)) : 0
    }];

    // Prepare detailed log data for Excel
    const detailedLog = chatLog.map((entry, index) => ({
      'Entry #': index + 1,
      'Timestamp': new Date(entry.timestamp).toLocaleString(),
      'User Name': entry.userName,
      'Action Type': entry.type,
      'Current Step': entry.currentStep || '',
      'Message': entry.message || '',
      'Selected Option': entry.selectedOption || '',
      'Feedback Type': entry.feedbackType || '',
      'Navigation Action': entry.navigationAction || entry.action || '',
      'From Step': entry.fromStep || '',
      'To Step': entry.toStep || '',
      'Input Value': entry.inputValue || '',
      'Message ID': entry.messageId || '',
      'Error': entry.error || '',
      'Additional Info': JSON.stringify({
        options: entry.options || [],
        backTo: entry.backTo || '',
        success: entry.success
      })
    }));

    // Create interaction summary
    const interactionSummary = [
      { 'Metric': 'Total Bot Messages', 'Count': chatLog.filter(log => log.type === 'bot_message').length },
      { 'Metric': 'Total User Actions', 'Count': chatLog.filter(log => log.type === 'user_option_click').length },
      { 'Metric': 'Navigation Events', 'Count': chatLog.filter(log => log.type === 'navigation').length },
      { 'Metric': 'Feedback Given', 'Count': chatLog.filter(log => log.type === 'feedback').length },
      { 'Metric': 'Thumbs Up', 'Count': chatLog.filter(log => log.type === 'feedback' && log.feedbackType === 'up').length },
      { 'Metric': 'Thumbs Down', 'Count': chatLog.filter(log => log.type === 'feedback' && log.feedbackType === 'thumbs_down').length },
      { 'Metric': 'Help Requests', 'Count': chatLog.filter(log => log.action === 'show_default_help').length },
      { 'Metric': 'Back to Main Menu', 'Count': chatLog.filter(log => log.selectedOption === 'Back to Main Menu').length }
    ];

    // Create steps visited summary
    const stepsVisited = {};
    chatLog.forEach(entry => {
      if (entry.currentStep) {
        stepsVisited[entry.currentStep] = (stepsVisited[entry.currentStep] || 0) + 1;
      }
    });
    
    const stepsSummary = Object.entries(stepsVisited).map(([step, count]) => ({
      'Step Name': step,
      'Visit Count': count
    }));

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Add session summary sheet
    const sessionWs = XLSX.utils.json_to_sheet(sessionSummary);
    XLSX.utils.book_append_sheet(wb, sessionWs, "Session Summary");

    // Add detailed log sheet
    const detailedWs = XLSX.utils.json_to_sheet(detailedLog);
    XLSX.utils.book_append_sheet(wb, detailedWs, "Detailed Log");

    // Add interaction summary sheet
    const interactionWs = XLSX.utils.json_to_sheet(interactionSummary);
    XLSX.utils.book_append_sheet(wb, interactionWs, "Interaction Summary");

    // Add steps summary sheet
    const stepsWs = XLSX.utils.json_to_sheet(stepsSummary);
    XLSX.utils.book_append_sheet(wb, stepsWs, "Steps Visited");

    // Generate filename with timestamp
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
    const fileName = `ChatLog_${userName || 'Anonymous'}_${dateStr}_${timeStr}.xlsx`;

    // Download the file
    XLSX.writeFile(wb, fileName);

    // Log the download action
    addToLog({
      type: "system",
      action: "excel_log_downloaded",
      fileName: fileName,
      totalEntries: chatLog.length
    });

    console.log(`Excel chat log downloaded: ${fileName}`);
    return fileName;
  };

  // Function to clear chat log
  const clearChatLog = () => {
    addToLog({
      type: "system",
      action: "log_cleared_by_user"
    });
    setChatLog([]);
  };

  // Function to auto-save Excel log periodically
  const autoSaveExcelLog = () => {
    if (chatLog.length === 0) return;
    
    // Simple version for auto-save (less detailed)
    const quickLog = chatLog.map((entry, index) => ({
      'Entry': index + 1,
      'Time': new Date(entry.timestamp).toLocaleString(),
      'User': entry.userName,
      'Type': entry.type,
      'Step': entry.currentStep || '',
      'Action': entry.action || entry.selectedOption || entry.message?.substring(0, 50) || '',
      'Details': entry.feedbackType || entry.navigationAction || ''
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(quickLog);
    XLSX.utils.book_append_sheet(wb, ws, "Auto Save Log");

    const fileName = `AutoSave_${userName || 'Anonymous'}_${sessionId.current}.xlsx`;
    XLSX.writeFile(wb, fileName);

    addToLog({
      type: "system",
      action: "auto_save_excel",
      fileName: fileName
    });

    return fileName;
  };

  // Specialized logging functions for different event types
  const logBotMessage = (currentStep, message, options = []) => {
    addToLog({
      type: "bot_message",
      currentStep,
      message,
      options
    });
  };

  const logUserOptionClick = (currentStep, selectedOption) => {
    addToLog({
      type: "user_option_click",
      currentStep,
      selectedOption,
      navigationAction: "option_selection"
    });
  };

  const logNavigation = (action, fromStep, toStep, backTo = null) => {
    addToLog({
      type: "navigation",
      action,
      fromStep,
      toStep,
      backTo
    });
  };

  const logUserInput = (action, inputValue, currentStep) => {
    addToLog({
      type: "user_input",
      action,
      inputValue,
      currentStep
    });
  };

  const logFeedback = (feedbackType, currentStep, messageId = null) => {
    addToLog({
      type: "feedback",
      feedbackType,
      currentStep,
      messageId
    });
  };

  const logError = (error, currentStep, action = null) => {
    addToLog({
      type: "error",
      error: error.toString(),
      currentStep,
      action
    });
  };

  const logCustomEvent = (eventType, eventData) => {
    addToLog({
      type: eventType,
      ...eventData
    });
  };

  // Get log statistics
  const getLogStats = () => {
    return {
      totalEntries: chatLog.length,
      sessionId: sessionId.current,
      botMessages: chatLog.filter(log => log.type === 'bot_message').length,
      userActions: chatLog.filter(log => log.type === 'user_option_click').length,
      navigations: chatLog.filter(log => log.type === 'navigation').length,
      feedback: chatLog.filter(log => log.type === 'feedback').length,
      errors: chatLog.filter(log => log.type === 'error').length,
      startTime: chatLog[0]?.timestamp,
      duration: chatLog.length > 0 ? 
        Math.round((new Date() - new Date(chatLog[0]?.timestamp)) / (1000 * 60)) : 0
    };
  };

  return {
    // State
    chatLog,
    sessionId: sessionId.current,
    
    // Core logging function
    addToLog,
    
    // Specialized logging functions
    logBotMessage,
    logUserOptionClick,
    logNavigation,
    logUserInput,
    logFeedback,
    logError,
    logCustomEvent,
    
    // File operations
    downloadChatLogAsExcel,
    autoSaveExcelLog,
    clearChatLog,
    
    // Utilities
    getLogStats
  };
};

export default useChatLogger;