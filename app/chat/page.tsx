'use client'
import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  Stack,
  Paper,
} from '@mui/material';
import { FaUser, FaRobot } from 'react-icons/fa';
import { styled } from '@mui/material/styles';

interface Message {
  type: 'prompt' | 'response';
  text: string;
}

const ChatContainer = styled(Box)(({ theme }) => ({
  maxWidth: 800,
  margin: '0 auto',
  padding: theme.spacing(2),
  backgroundColor: '#1e1e1e',
  color: 'whitesmoke',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
}));

const OutputBox = styled(Paper)(({ theme }) => ({
  flex: 1,
  backgroundColor: '#2c2c2c',
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  overflowY: 'auto',
  marginBottom: theme.spacing(2),
  maxHeight: '60vh',
}));

const MessageRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: theme.spacing(1),
  padding: theme.spacing(0.5, 0),
  position: 'relative',
  '&:not(:last-child)::after': {
    content: '""',
    position: 'absolute',
    left: 40,
    top: '100%',
    width: 'calc(100% - 40px)',
    borderTop: '1px solid #555555',
  },
}));

const PromptBubble = styled(Paper)(({ theme }) => ({
  backgroundColor: '#2f6a31',
  color: 'whitesmoke',
  padding: theme.spacing(1),
  borderRadius: 20,
  whiteSpace: 'pre-wrap',
  flex: 1,
  maxWidth: '100%',
  wordWrap: 'break-word',
  alignSelf: 'flex-end',
}));

const ResponseBubble = styled(Paper)(({ theme }) => ({
  backgroundColor: '#196fb6',
  color: 'whitesmoke',
  padding: theme.spacing(1),
  borderRadius: 20,
  whiteSpace: 'pre-wrap',
  flex: 1,
  maxWidth: '100%',
  wordWrap: 'break-word',
  alignSelf: 'flex-start',
}));

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

    setMessages((prev) => [...prev, { type: 'prompt', text: prompt }]);
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
        setMessages((prev) => [
          ...prev,
          { type: 'response', text: data.response },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { type: 'response', text: 'No response from LLM.' },
        ]);
      }
    } catch (error: any) {
      console.error('Error sending prompt:', error);
      setMessages((prev) => [
        ...prev,
        { type: 'response', text: `Error: ${error.message}` },
      ]);
    } finally {
      setIsSending(false);
      setPrompt('');
    }
  };

  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLDivElement | HTMLTextAreaElement>
  ) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendPrompt();
    }
  };

  const saveToGraph = () => {
    alert('Save to Graph functionality is not implemented yet.');
  };

  return (
    <ChatContainer>
      <Typography variant="h4" align="center" gutterBottom>
        LLM Chat
      </Typography>

      <OutputBox elevation={3}>
        <List>
          {messages.map((msg, index) => (
            <ListItem key={index} alignItems="flex-start" disableGutters>
              <ListItemAvatar>
                <Avatar
                  sx={{
                    bgcolor: msg.type === 'prompt' ? '#4CAF50' : '#2196F3',
                  }}
                >
                  {msg.type === 'prompt' ? <FaUser /> : <FaRobot />}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  msg.type === 'prompt' ? (
                    <PromptBubble elevation={1}>{msg.text}</PromptBubble>
                  ) : (
                    <ResponseBubble elevation={1}>{msg.text}</ResponseBubble>
                  )
                }
              />
            </ListItem>
          ))}
          <div ref={outputEndRef} />
        </List>
      </OutputBox>

      <Stack spacing={2}>
        <TextField
          multiline
          minRows={3}
          maxRows={6}
          variant="outlined"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your prompt here..."
          disabled={isSending}
          fullWidth
          InputProps={{
            style: { backgroundColor: '#3a3a3a', color: 'whitesmoke' },
          }}
        />
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="contained"
            color="primary"
            onClick={sendPrompt}
            disabled={isSending}
            startIcon={isSending ? <CircularProgress size={20} /> : null}
          >
            {isSending ? 'Sending...' : 'Send Prompt'}
          </Button>
          <Button variant="contained" color="secondary" onClick={saveToGraph}>
            Save to Graph
          </Button>
        </Stack>
      </Stack>
    </ChatContainer>
  );
}