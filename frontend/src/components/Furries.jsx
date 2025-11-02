import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle, Bot, User } from 'lucide-react';

const Furries = ({ isOpen, onClose, userRole }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Welcome message
      const welcomeMsg = {
        type: 'bot',
        text: `🐾 Hi! I'm Furries, your friendly Pawtect assistant!\n\nI can help you with:\n• 📊 Rescue statistics\n• 🏠 Finding nearby shelters\n• 💰 Making donations\n• 🐕 Adopting dogs\n• 🔍 Looking up dogs by PAW ID\n• ℹ️ Learning about Pawtect\n\nWhat would you like to know?`,
        timestamp: new Date()
      };
      setMessages([welcomeMsg]);
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMsg = {
      type: 'user',
      text: inputMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Send to chatbot API
      const response = await fetch('http://localhost:5000/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: inputMessage,
          userRole: userRole || 'citizen'
        })
      });

      const data = await response.json();
      
      setIsTyping(false);

      // Add bot response
      const botMsg = {
        type: 'bot',
        text: data.response || 'Sorry, I encountered an error. Please try again.',
        data: data.data, // Additional data like dog details, shelter list, etc.
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('Chatbot error:', error);
      setIsTyping(false);
      
      const errorMsg = {
        type: 'bot',
        text: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const QuickActionButtons = () => {
    const quickActions = [
      { label: '📊 Rescue Stats', query: 'How many dogs have been rescued?' },
      { label: '🏠 Nearby Shelters', query: 'Show me nearby shelters' },
      { label: '💰 Donate', query: 'I want to donate' },
      { label: '🐕 Adopt', query: 'I want to adopt a dog' },
      { label: 'ℹ️ About Pawtect', query: 'What is Pawtect?' }
    ];

    return (
      <div className="flex flex-wrap gap-2 px-4 py-3 bg-gray-50 border-t border-gray-200">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={() => {
              setInputMessage(action.query);
              setTimeout(handleSendMessage, 100);
            }}
            className="text-xs bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-full hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700 transition"
          >
            {action.label}
          </button>
        ))}
      </div>
    );
  };

  const renderMessage = (message, index) => {
    const isBot = message.type === 'bot';
    
    return (
      <div key={index} className={`flex gap-3 ${isBot ? '' : 'flex-row-reverse'} mb-4`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isBot ? 'bg-primary-100' : 'bg-gray-200'
        }`}>
          {isBot ? (
            <Bot className="h-5 w-5 text-primary-600" />
          ) : (
            <User className="h-5 w-5 text-gray-600" />
          )}
        </div>

        {/* Message Content */}
        <div className={`flex-1 max-w-[80%]`}>
          <div className={`rounded-2xl px-4 py-2.5 ${
            isBot 
              ? 'bg-white border border-gray-200 text-gray-800' 
              : 'bg-primary-600 text-white'
          }`}>
            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
            
            {/* Render additional data if present */}
            {message.data && renderMessageData(message.data)}
          </div>
          <p className="text-xs text-gray-500 mt-1 px-2">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    );
  };

  const renderMessageData = (data) => {
    if (!data) return null;

    // Dog details
    if (data.dog) {
      const dog = data.dog;
      return (
        <div className="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="flex gap-3">
            {dog.photos && dog.photos[0] && (
              <img 
                src={`http://localhost:5000${dog.photos[0]}`} 
                alt={dog.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{dog.name || 'Unnamed'}</p>
              <p className="text-xs text-gray-600">PAW ID: {dog.paw_id}</p>
              <p className="text-xs text-gray-600">{dog.breed || dog.type}</p>
              <p className="text-xs text-gray-600">Status: {dog.status}</p>
            </div>
          </div>
        </div>
      );
    }

    // Shelter list
    if (data.shelters && Array.isArray(data.shelters)) {
      return (
        <div className="mt-3 space-y-2">
          {data.shelters.slice(0, 3).map((shelter, idx) => (
            <div key={idx} className="bg-gray-50 rounded-lg p-2 border border-gray-200">
              <p className="font-semibold text-sm text-gray-900">{shelter.name}</p>
              <p className="text-xs text-gray-600">{shelter.address?.city}, {shelter.address?.state}</p>
              <p className="text-xs text-gray-600">📞 {shelter.contactInfo?.phone}</p>
            </div>
          ))}
        </div>
      );
    }

    // Statistics
    if (data.stats) {
      return (
        <div className="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(data.stats).map(([key, value]) => (
              <div key={key}>
                <span className="text-gray-600">{key}: </span>
                <span className="font-semibold text-gray-900">{value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 right-4 md:right-8 w-full md:w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 mx-4 md:mx-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-full">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Furries 🐾</h3>
            <p className="text-xs text-primary-100">Your Pawtect Assistant</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="hover:bg-white/20 p-2 rounded-full transition"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.map((message, index) => renderMessage(message, index))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-3 mb-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary-600" />
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2.5">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length <= 1 && <QuickActionButtons />}

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-white rounded-b-2xl">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="bg-primary-600 text-white p-2.5 rounded-full hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 text-center mt-2">
          Powered by Furries AI • Made with 💚 for animals
        </p>
      </div>
    </div>
  );
};

export default Furries;
