  'use client';
  import React, { useState, useEffect } from 'react';
  import axios from 'axios';
  import { FaTrash } from 'react-icons/fa';
  import { AiOutlineLoading } from 'react-icons/ai'; // Import loading spinner icon
  import { BsFillPersonFill } from 'react-icons/bs'; // User icon
  import { FaRobot } from 'react-icons/fa'; // AI icon
  import "./ChatbotInterface.css";

  // Constants
  const traits = [
    'Empathetic',
    'Analytical',
    'Creative',
    'Logical',
    'Intuitive',
    'Confident',
    'Humble',
    'Optimistic',
    'Realistic',
    'Adaptable',
    'Decisive',
    'Flexible',
    'Persistent',
    'Patient',
    'Energetic',
    'Calm',
    'Ambitious',
    'Cautious',
    'Curious',
    'Disciplined',
    'Resourceful',
    'Imaginative',
    'Practical',
    'Adventurous',
    'Organized',
    'Spontaneous',
    'Reliable',
    'Innovative',
    'Traditional',
    'Progressive',
    'Assertive',
    'Diplomatic',
    'Cooperative',
    'Independent',
    'Loyal',
    'Honest',
    'Tactful',
    'Perceptive',
    'Articulate',
    'Observant',
    'Rational',
    'Emotional',
    'Methodical',
    'Pragmatic',
    'Idealistic',
    'Sociable',
    'Reserved',
    'Charismatic',
    'Introspective',
  ];

  const initialSuggestions = [
    'Tell me more about that.',
    'Can you elaborate on your thoughts?',
    'What are your next steps?',
    'How does that make you feel?',
    'What do you think about that?',
  ];

  
  
  
  // Main Chatbot Component
  const ChatbotInterface = () => {
    // State Management
    const [showProfile, setShowProfile] = useState(false);
const [isHuman, setIsHuman] = useState(false); // Track AI vs Human toggle state

    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [selectedTraits, setSelectedTraits] = useState([]);
    const [chatHistory, setChatHistory] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(0);
    const [aiSuggestions, setAiSuggestions] = useState([]);
    const [lastAiResponseId, setLastAiResponseId] = useState(null);
    const [feedbackGiven, setFeedbackGiven] = useState(false);
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false); // Feedback submission state
    const [traitValues, setTraitValues] = useState({});

    // Load chat history and initialize with a greeting message
    useEffect(() => {
      const storedChatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
      setChatHistory(storedChatHistory);

      const initialMessage = {
        id: 1,
        text: 'Hey there! 👋 I’m here to help you. How are you feeling today? Let me know your mood or what’s on your mind, and I’ll tailor my responses just for you! 😊',
        sender: 'ai',
        timestamp: new Date(),
      };-
      setMessages([initialMessage]);
      setAiSuggestions(initialSuggestions);
    }, []);
    const handleTraitValueChange = (trait, value) => {
      setTraitValues((prev) => ({
        ...prev,
        [trait]: value,
      }));
    };
    // Adjust traits based on message content
    const adjustTraitsBasedOnMessage = (message) => {
      const keywordTraitMapping = {
        empathy: ['Empathetic', 'Patient', 'Understanding'],
        analysis: ['Analytical', 'Logical', 'Rational'],
        creativity: ['Creative', 'Imaginative', 'Innovative'],
        confidence: ['Confident', 'Assertive', 'Decisive'],
      };
      
      const adjustedTraits = new Set(selectedTraits);

      Object.entries(keywordTraitMapping).forEach(([keyword, traits]) => {
        if (message.toLowerCase().includes(keyword)) {
          traits.forEach((trait) => adjustedTraits.add(trait));
        }
      });

      return Array.from(adjustedTraits);
    };

    // Handle sending a message
    const handleSendMessage = async () => {
      if (inputMessage.trim() === '') return;

      const newMessage = {
        id: messages.length + 1,
        text: inputMessage,
        sender: 'user',
        timestamp: new Date(),
      };

      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      setInputMessage('');
      setFeedbackGiven(false); // Reset feedback status after a new message

      try {
        // Call backend API for AI response
        const response = await axios.post(
          'http://localhost:5000/api/chat',
          { 
              message: inputMessage, 
              traits: selectedTraits, 
              trait_values: traitValues 
          },
          { headers: { 'Content-Type': 'application/json' } },
      );

        const aiResponse = {
          id: updatedMessages.length + 1,
          text: response.data.response,
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages([...updatedMessages, aiResponse]);
        setLastAiResponseId(aiResponse.id);

        // Update suggestions and traits
        setAiSuggestions(
          response.data.suggestions.length > 0 ? response.data.suggestions : initialSuggestions,
        );
        const newSelectedTraits = adjustTraitsBasedOnMessage(inputMessage);
        setSelectedTraits(newSelectedTraits);
      } catch (error) {
        console.error('Error fetching AI response:', error);
      }
    };

    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        handleSendMessage();
      }
    };

    // Trait toggling logic
    const toggleTrait = (trait) => {
      setSelectedTraits((prevTraits) =>
        prevTraits.includes(trait) ? prevTraits.filter((t) => t !== trait) : [...prevTraits, trait],
      );
    };

    const handleClearChat = () => {
      setMessages([]);
      setAiSuggestions([]);
      setInputMessage('');
    };

    const handleNewChat = () => {
      if (messages.length > 0) {
        const newChat = { id: currentChatId + 1, messages };
        const updatedChatHistory = [...chatHistory, newChat];
        setChatHistory(updatedChatHistory);
        localStorage.setItem('chatHistory', JSON.stringify(updatedChatHistory));
        setCurrentChatId(currentChatId + 1);
      }
      handleClearChat();
    };

    const selectChat = (chatId) => {
      const selectedChat = chatHistory.find((chat) => chat.id === chatId);
      if (selectedChat) {
        setMessages(selectedChat.messages);
        setCurrentChatId(chatId);
        setAiSuggestions([]);
      }
    };

    const deleteChat = (chatId) => {
      const updatedChatHistory = chatHistory.filter((chat) => chat.id !== chatId);
      setChatHistory(updatedChatHistory);
      localStorage.setItem('chatHistory', JSON.stringify(updatedChatHistory));

      if (currentChatId === chatId) {
        setCurrentChatId(0);
        setMessages([]);
        setAiSuggestions([]);
      }
    };

    const handleSuggestionClick = (suggestion) => {
      setInputMessage(suggestion); // Use the suggestion as input
      setAiSuggestions(aiSuggestions); // Keep suggestions visible for further selection
    };

    const formatMessage = (text) => {
      return text
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
        .replace(/\*(.*?)\*/g, '$1') // Remove italic markdown
        .replace(/_/g, ''); // Remove underscores
    };

    // Handling Feedback Submission
    const handleFeedback = async (rating) => {
      if (lastAiResponseId !== null && !feedbackGiven) {
        // Allow feedback only once per message
        setIsSubmittingFeedback(true); // Show loading animation
        console.log(`Feedback for response ${lastAiResponseId}: ${rating}`);

        try {
          // Send feedback to the server
          await axios.post(
            'http://localhost:5000/api/feedback',
            { responseId: lastAiResponseId, rating },
            { headers: { 'Content-Type': 'application/json' } },
          );
          setFeedbackGiven(true); // Mark feedback as given
        } catch (error) {
          console.error('Error submitting feedback:', error);
        } finally {
          setIsSubmittingFeedback(false); // Hide loading animation
        }
      }
    };

    // JSX Return: UI Structure
    return (
      <div className="flex h-screen flex-col bg-gray-100 md:flex-row">
        {/* Left Side: Trait Selection */}
      <div className="w-full overflow-y-auto rounded-lg bg-white p-4 shadow-lg md:w-1/4">
        <h2 className="mb-4 text-xl font-bold">Traits and Sliders</h2>
        {traits.map((trait, index) => (
          <div key={index} className="mb-4">
            <p className="mb-2 text-sm font-medium text-gray-700">{trait}</p>
            <input
              type="range"
              min="0"
              max="100"
              value={traitValues[trait] || 0} // Set the current value
              onChange={(e) => handleTraitValueChange(trait, parseInt(e.target.value, 10))} // Update state
              className="w-full cursor-pointer"
              aria-label={`Adjust ${trait} level`}
            />
            <span className="text-gray-600">{traitValues[trait] || 0}</span> {/* Display the value */}
          </div>
        ))}
      </div>



        {/* Middle: Chat Area */}
        <div className="m-4 flex w-full flex-col rounded-lg bg-white shadow-lg md:w-2/4">
          <div className="flex-1 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 flex items-start ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-2xl rounded-lg p-4 shadow-md ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'} flex items-center`}
                >
                  {/* Avatar/Icon Rendering */}
                  {message.sender === 'user' ? (
                    <BsFillPersonFill className="icon mr-2 text-blue-200" />
                  ) : (
                    <FaRobot className="icon mr-2 text-gray-500" />
                  )}

                  <p className="whitespace-pre-wrap">{formatMessage(message.text)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Feedback Area */}
          {messages.length > 0 && messages[messages.length - 1].sender === 'ai' && !feedbackGiven && (
            <div className="rounded-b-lg bg-gray-200 p-4">
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleFeedback('good')}
                  className="rounded bg-green-500 px-3 py-1 text-white transition duration-200 hover:bg-green-600"
                  disabled={isSubmittingFeedback}
                >
                  {isSubmittingFeedback ? <AiOutlineLoading className="animate-spin" /> : 'Good'}
                </button>
                <button
                  onClick={() => handleFeedback('bad')}
                  className="rounded bg-red-500 px-3 py-1 text-white transition duration-200 hover:bg-red-600"
                  disabled={isSubmittingFeedback}
                >
                  {isSubmittingFeedback ? <AiOutlineLoading className="animate-spin" /> : 'Bad'}
                </button>
              </div>

              {/* Acknowledgment after feedback */}
              {feedbackGiven && (
                <p className="mt-2 text-sm text-green-500">Thank you for your feedback!</p>
              )}
            </div>
          )}

          {/* Input Area */}
          <div className="rounded-b-lg bg-gray-200 p-4">
  {/* Input Message */}
  <input
    type="text"
    value={inputMessage}
    onChange={(e) => setInputMessage(e.target.value)}
    onKeyPress={handleKeyPress}
    className="w-full rounded-lg border p-2"
    placeholder="Type your message..."
    aria-label="Chat input"
  />

  {/* Send Button */}
  <button
    onClick={handleSendMessage}
    className="mt-2 rounded-lg bg-blue-500 px-4 py-2 text-white transition-all duration-300 hover:bg-blue-600"
    aria-label="Send message"
  >
    Send
  </button>

  {/* Profile and AI vs Human Toggle */}
  <div className="mt-4 flex items-center justify-between">
    {/* Profile Button with Dropup */}
    <div className="relative">
      <button
        onClick={() => setShowProfile(!showProfile)} // Toggle Profile Dropup
        className="rounded-lg bg-gray-300 px-3 py-2 text-sm font-semibold hover:bg-gray-400"
      >
        Profile
      </button>
      {showProfile && (
        <div className="absolute bottom-12 left-0 z-10 w-48 rounded-lg bg-white shadow-lg">
          <ul className="py-2 text-sm text-gray-800">
            <li className="px-4 py-2 hover:bg-gray-100">View Profile</li>
            <li className="px-4 py-2 hover:bg-gray-100">Edit Profile</li>
            <li className="px-4 py-2 hover:bg-gray-100">Logout</li>
          </ul>
        </div>
      )}
    </div>

    {/* AI vs Human Toggle */}
    <div className="flex items-center">
      <span className="mr-2 text-sm font-medium text-gray-700">AI</span>
      <label className="relative inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          checked={isHuman}
          onChange={() => setIsHuman(!isHuman)} // Toggle AI vs Human
          className="peer hidden"
        />
        <div className="peer h-6 w-11 rounded-full bg-gray-300 peer-checked:bg-blue-500 peer-focus:ring-2 peer-focus:ring-blue-300"></div>
        <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-full"></span>
      </label>
      <span className="ml-2 text-sm font-medium text-gray-700">Human</span>
    </div>
  </div>
</div>


          {/* Suggestions Area with Fixed Height */}
        <div
    className="mt-4 overflow-y-auto rounded-b-lg bg-gray-100 p-4"
    style={{ maxHeight: '150px' }}
  >
    <h4 className="mb-2 text-lg font-semibold">Suggestions:</h4>
    <div className="flex flex-wrap gap-2">
      {aiSuggestions && aiSuggestions.length > 0 ? (
        aiSuggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => handleSuggestionClick(suggestion)}
            className="rounded-full bg-gray-300 px-3 py-1 text-sm transition duration-200 hover:bg-gray-400"
          >
            {suggestion}
          </button>
        ))
      ) : (
        <p>No suggestions available.</p>
      )}
    </div>
  </div>


        </div>

        {/* Right Side: Chat History */}
        <div className="w-full overflow-y-auto rounded-lg border-l border-gray-200 bg-white p-4 shadow-lg md:w-1/4">
          <h2 className="mb-4 text-xl font-bold">Chat History</h2>
          {chatHistory.map((chat) => (
            <div key={chat.id} className="mb-2 flex items-center justify-between">
              <button
                onClick={() => selectChat(chat.id)}
                className={`text-left text-sm hover:underline ${currentChatId === chat.id ? 'font-semibold' : ''}`}
              >
                Chat {chat.id}
              </button>
              <FaTrash
                onClick={() => deleteChat(chat.id)}
                className="cursor-pointer text-red-500 hover:text-red-700"
                aria-label="Delete chat"
              />
            </div>
          ))}
          <button
            onClick={handleNewChat}
            className="mt-4 rounded-lg bg-blue-500 px-4 py-2 text-white transition-all duration-300 hover:bg-blue-600"
          >
            New Chat
          </button>
        </div>
      </div>
    );
  };

  export default ChatbotInterface;
