'use client';
import { useEffect, useState } from 'react';
import GeminiService from '../service/gemini.service';

export default function useGemini() {
  const [messages, updateMessage] = useState(checkForMessages());
  const [loading, setLoading] = useState(false);

  function checkForMessages() {
    const savedMessages = localStorage.getItem('messages');
    return savedMessages ? JSON.parse(savedMessages) : [];
  }

  useEffect(() => {
    const savedMessages = checkForMessages();
    updateMessage(savedMessages); // Update the messages state
    setLoading(false); // Set loading to false after messages are loaded
  }, []);
  // Convert image file to Base64 string
  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result); // Base64 string
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  useEffect(() => {
    const saveMessages = () => {
      localStorage.setItem('messages', JSON.stringify(messages));
    };
    window.addEventListener('beforeunload', saveMessages);
    return () => window.removeEventListener('beforeunload', saveMessages);
  }, [messages]);

  const handleImageUpload = async (file) => {
    try {
      const imageBase64 = await convertImageToBase64(file);

      const imageMessage = {
        role: 'user',
        parts: [{ text: '' }],
        image: imageBase64,
      };

      // Add the image message to the messages state
      updateMessage((prevMessages) => [...prevMessages, imageMessage]);

      return imageBase64;
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };
  const sendMessages = async (payload) => {
    // Ensure the first message has role 'user'
    updateMessage((prevMessages) => [...prevMessages, { role: 'model', parts: [{ text: '' }] }]);

    setLoading(true);

    try {
      console.log('message payload:', payload);

      const adjustedPayload = {
        ...payload,
        message: payload.message,
        history: payload.history.map((msg) => {
          // Ensure no unexpected fields like "image" are included
          const { image, ...rest } = msg;
          return rest;
        }),
      };

      console.log(adjustedPayload, 'adjustedPayload');

      const stream = await GeminiService.sendMessages(
        adjustedPayload.message,
        adjustedPayload.history,
      );

      console.log(stream, 'stream');

      for await (const chunk of stream) {
        const chunkText = await chunk.text();
        updateMessage((prevMessages) => {
          const prevMessageClone = structuredClone(prevMessages);
          prevMessageClone[prevMessages.length - 1].parts[0].text += chunkText;
          return prevMessageClone;
        });
      }
    } catch (error) {
      updateMessage((prevMessages) => [
        ...prevMessages,
        {
          role: 'model',
          parts: [
            {
              text: "Seems like I'm having trouble connecting to the server. Please try again later.",
            },
          ],
        },
      ]);
      console.error('An error occurred:', error);
    } finally {
      setLoading(false);
    }
  };

  return { messages, loading, sendMessages, updateMessage, handleImageUpload };
}
