'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './Chat.module.css';
import { FaUser, FaRobot } from 'react-icons/fa'; // Importing icons

interface Message {
  type: 'prompt' | 'response';
  text: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState<string>('');
  const outputEndRef = useRef<HTMLDivElement | null>(null);
  const [isSending, setIsSending] = useState<boolean>(false);

  const scrollToBottom = () => {
    if (outputEndRef.current) {
      outputEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendPrompt = async () => {
    if (!prompt.trim()) return;

    setMessages(prev => [...prev, { type: 'prompt', text: prompt }]);
    setIsSending(true);

    try {
      const response = await fetch('http://localhost:8080/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.response) {
        setMessages(prev => [...prev, { type: 'response', text: data.response }]);
      } else {
        setMessages(prev => [...prev, { type: 'response', text: 'No response from LLM.' }]);
      }
    } catch (error: any) {
      console.error('Error sending prompt:', error);
      setMessages(prev => [...prev, { type: 'response', text: `Error: ${error.message}` }]);
    } finally {
      setIsSending(false);
      setPrompt('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendPrompt();
    }
  };

  const saveToGraph = () => {
    alert('Save to Graph functionality is not implemented yet.');
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>LLM Chat</h1>
      
      <div className={styles.outputBox}>
        {messages.map((msg, index) => (
          <div key={index} className={`${styles.messageRow} ${msg.type === 'prompt' ? styles.promptRow : styles.responseRow}`}>
            <div className={msg.type === 'prompt' ? styles.promptIcon : styles.responseIcon}>
              {msg.type === 'prompt' ? <FaUser /> : <FaRobot />}
            </div>
            <div className={msg.type === 'prompt' ? styles.prompt : styles.response}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={outputEndRef} />
      </div>

      <div className={styles.inputSection}>
        <textarea
          className={styles.inputBox}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your prompt here..."
          disabled={isSending}
        />
        <div className={styles.buttonGroup}>
          <button className={styles.sendButton} onClick={sendPrompt} disabled={isSending}>
            {isSending ? 'Sending...' : 'Send Prompt'}
          </button>
          <button className={styles.saveButton} onClick={saveToGraph}>
            Save to Graph
          </button>
        </div>
      </div>
    </div>
  );
}