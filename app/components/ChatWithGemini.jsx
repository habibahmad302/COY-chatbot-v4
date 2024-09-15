import React, { useEffect, useRef, useState } from 'react';
import { Input, Box, Button, Textarea, Spinner, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { DeleteIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import ReactMarkdown from 'react-markdown';
import Tesseract from 'tesseract.js';
// import useGemini from "../hooks/useGemini";
import PropTypes from 'prop-types';
import useGemini from '../hooks/useGemini';
const ChatWithGemini = () => {
  const { messages, loading, sendMessages, updateMessage } = useGemini();
  const [input, setInput] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [imageUploaded, setImageUploaded] = useState(false); // Track if an image has been uploaded

  const AlwaysScrollToBottom = () => {
    const elementRef = useRef();
    useEffect(() => {
      if (elementRef.current) {
        elementRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest',
        });
      }
    }, [messages]);
    return <div ref={elementRef} />;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsExtracting(true);
      try {
        // Convert image to Base64
        const imageBase64 = await convertImageToBase64(file);
        const imageUrl = URL.createObjectURL(file); // Keep URL for immediate display

        // Extract text using Tesseract
        const {
          data: { text },
        } = await Tesseract.recognize(file, 'eng', { logger: (m) => console.log(m) });

        const cleanedText = text.trim();
        // Create a message object with image and text
        const userMessage = {
          role: 'user',
          parts: [{ text: '' }], // Empty text to hide
          image: imageBase64, // Add Base64 image to the message
        };
        updateMessage((prevMessages) => [...prevMessages, userMessage]);

        setImageUploaded(true); // Set the flag to true
        setIsSending(true);
        await sendMessages({ message: cleanedText, history: [...messages, userMessage] });
      } catch (error) {
        console.error('Error during text extraction or sending:', error);
        const errorMessage = {
          role: 'system',
          parts: [{ text: 'Failed to process the uploaded image. Please try again.' }],
        };
        updateMessage((prevMessages) => [...prevMessages, errorMessage]);
      } finally {
        setIsExtracting(false);
        setIsSending(false);
      }
    }
  };

  // Convert image file to Base64 string
  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { role: 'user', parts: [{ text: input.trim() }] };
    updateMessage([...messages, userMessage]);
    setInput('');
    setIsSending(true);
    try {
      await sendMessages({ message: input.trim(), history: [...messages, userMessage] });
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        role: 'system',
        parts: [{ text: 'Failed to send your message. Please try again.' }],
      };
      updateMessage([...messages, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleClear = () => {
    updateMessage([]);
    setInput('');
    setImageUploaded(false); // Reset the image uploaded flag
  };

  return (
    <>
      <Box className="m-4 h-[80%] w-[100%] max-w-[1400px] items-center self-center overflow-auto rounded-md">
        <Box className="flex flex-col overflow-auto px-10 py-4">
          {messages.length > 0 ? (
            messages.map((message, index) => (
              <RenderMessage
                loading={loading}
                key={index + message.role}
                messageLength={messages.length}
                message={message}
                msgIndex={index}
              />
            ))
          ) : (
            <Introduction />
          )}
          <AlwaysScrollToBottom />
        </Box>
      </Box>
      <Box className="flex w-[100%] max-w-[1400px] self-center px-10 pt-2">
        <Box className="flex w-[100%] items-center justify-between gap-2">
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            variant="unstyled"
            placeholder="Upload diamond certificate"
            disabled={isSending} // Disable if sending
          />
        </Box>
      </Box>
      <Box className="flex w-[100%] max-w-[1400px] self-center px-10 pt-2">
        <Box className="flex w-[100%] items-center justify-between gap-2">
          <Textarea
            placeholder="Type a message"
            value={input}
            sx={{
              resize: 'none',
              padding: '8px 14px 8px 14px',
              background: 'gray.700',
              color: 'white',
              _placeholder: { color: 'white' },
              h: '1.75rem',
            }}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            variant={'unstyled'}
            disabled={isSending} // Disable if sending
          />
          <Box className="flex flex-col gap-2">
            <Button
              colorScheme="whatsapp"
              h="1.75rem"
              size="sm"
              onClick={handleSend}
              rightIcon={<ArrowForwardIcon />}
              isLoading={isSending}
              loadingText="Sending"
              disabled={isSending} // Disable if sending
            >
              Send
            </Button>
            <Button
              color={'white'}
              _hover={{ bg: 'blue.500' }}
              variant={'outline'}
              h="1.75rem"
              size="sm"
              onClick={handleClear}
              rightIcon={<DeleteIcon />}
            >
              Clear
            </Button>
          </Box>
        </Box>
      </Box>
      {(isExtracting || isSending) && (
        <Box className="mt-2 flex items-center justify-center">
          <Spinner size="sm" />
          <Text ml={2}>{isExtracting ? 'Extracting text from image...' : 'Processing...'}</Text>
        </Box>
      )}
      {imageUploaded && (
        <Box className="mt-2 flex items-center justify-center">
          <Button
            colorScheme="blue"
            size="sm"
            onClick={() => setImageUploaded(false)} // Reset image upload state
          >
            Upload a new image
          </Button>
        </Box>
      )}
    </>
  );
};

const Introduction = () => {
  const TextRenderer = (props) => {
    const { value = '', direction = 'r', size = 'large' } = props;
    return (
      <Text
        fontSize={size}
        bgGradient={`linear(to-${direction}, blue.100, cyan.700)`}
        bgClip={'text'}
        fontWeight={'bold'}
      >
        {value}
      </Text>
    );
  };

  return (
    <Box className="flex flex-col items-center justify-center">
      <Box className="flex flex-col items-center justify-center">
        <TextRenderer value="Welcome at Diamond Certificate Analysis" size="xxx-large" />
        <TextRenderer
          value="I'm Gemini, a chatbot that can help you with your queries"
          direction={'l'}
        />
      </Box>
      <Box className="flex flex-col items-center justify-center">
        <TextRenderer value="Type a message or upload a diamond certificate to get started" />
      </Box>
    </Box>
  );
};

const RenderMessage = ({ message, msgIndex, loading, messageLength }) => {
  const { parts, role, image } = message;

  // Single Loader Component
  const Loader = () =>
    msgIndex === messageLength - 1 &&
    loading && (
      <Box className="flex self-start pt-2">
        <Spinner size="sm" color="blue.500" />
        <Text ml={2}>Loading...</Text>
      </Box>
    );

  return (
    <React.Fragment>
      {image && (
        <Box
          as={motion.div}
          className={`my-2 flex w-fit max-w-[95%] items-end overflow-auto rounded-md p-1 px-2 md:max-w-[96%] ${role === 'user' ? 'self-end' : 'self-start'}`}
          bgColor={role === 'user' ? 'blue.500' : 'gray.200'}
          color={role === 'user' ? 'white' : 'black'}
          initial={{ opacity: 0, scale: 0.5, y: 20, x: role === 'user' ? 20 : -20 }}
          animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
        >
          <img
            src={image}
            alt="Uploaded"
            style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }}
          />
        </Box>
      )}
      {parts &&
        parts.map(
          (part, index) =>
            part.text && (
              <Box
                key={index}
                as={motion.div}
                className={`my-2 flex w-fit max-w-[95%] items-end overflow-auto rounded-md p-1 px-2 md:max-w-[96%] ${role === 'user' ? 'self-end' : 'self-start'}`}
                bgColor={role === 'user' ? 'blue.500' : 'gray.200'}
                color={role === 'user' ? 'white' : 'black'}
                initial={{ opacity: 0, scale: 0.5, y: 20, x: role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
              >
                <ReactMarkdown
                  className="text-sm"
                  components={{
                    p: ({ node, ...props }) => <Text {...props} className="text-sm" />,
                    code: ({ node, ...props }) => (
                      <pre
                        {...props}
                        className="m-2 overflow-auto rounded-md bg-slate-800 p-2 font-mono text-sm text-white"
                      />
                    ),
                  }}
                >
                  {part.text}
                </ReactMarkdown>
              </Box>
            ),
        )}
      <Loader />
    </React.Fragment>
  );
};

RenderMessage.propTypes = {
  message: PropTypes.object.isRequired,
  msgIndex: PropTypes.number.isRequired,
  loading: PropTypes.bool.isRequired,
  messageLength: PropTypes.number.isRequired,
};

export default ChatWithGemini;
