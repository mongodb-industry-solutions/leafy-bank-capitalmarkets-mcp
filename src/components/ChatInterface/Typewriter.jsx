import { useState, useEffect, useRef } from 'react';

const Typewriter = ({ text, speed = 5, messageId, completedMessages, markCompleted }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Check if this message has already been completed
    if (completedMessages[messageId]) {
      setDisplayedText(text);
      setCurrentIndex(text.length);
      return;
    }

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up the typewriter effect
    intervalRef.current = setInterval(() => {
      setCurrentIndex(prevIndex => {
        if (prevIndex < text.length) {
          return prevIndex + 1;
        } else {
          // Clear interval when done
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          // Mark this message as completed
          markCompleted(messageId);
          return prevIndex;
        }
      });
    }, speed);

    // Clean up on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [text, speed, messageId, completedMessages, markCompleted]);

  useEffect(() => {
    setDisplayedText(text.slice(0, currentIndex));
  }, [currentIndex, text]);

  // Split text by newlines and render with proper line breaks
  const renderFormattedText = () => {
    const lines = displayedText.split('\n');
    return lines.map((line, index) => (
      <span key={index}>
        {line}
        {index < lines.length - 1 && <br />}
      </span>
    ));
  };

  return <span>{renderFormattedText()}</span>;
};

export default Typewriter;