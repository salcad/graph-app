import React, { useState, useRef, useEffect } from 'react';
import { GraphService } from '@/services/graphService';
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
  Snackbar,
  Alert,
} from '@mui/material';
import { FaUser, FaRobot } from 'react-icons/fa';
import { styled } from '@mui/material/styles';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Message {
  type: 'prompt' | 'response';
  text: string;
}

interface ChatComponentProps {
  onSaveComplete?: () => void;
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
  overflowY: 'auto', 
}));

const ContentContainer = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
}));

const OutputBox = styled(Paper)(({ theme }) => ({
  backgroundColor: '#000000', 
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  overflowY: 'auto', 
  marginBottom: theme.spacing(2),
  flexShrink: 0,
  maxHeight: '70vh', 
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

const ChatComponent: React.FC<ChatComponentProps> = ({ onSaveComplete }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState<string>('');
  const outputEndRef = useRef<HTMLDivElement | null>(null);
  const promptInputRef = useRef<HTMLInputElement | null>(null); 
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('info');

  const scrollToBottom = () => {
    if (outputEndRef.current) {
      outputEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (promptInputRef.current) {
      promptInputRef.current.focus(); 
    }
  }, []);

  const handleAlertClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setAlertOpen(false);
  };

  const sendPrompt = async () => {
    if (!prompt.trim()) return;

    setMessages((prev) => [...prev, { type: 'prompt', text: prompt }]);
    setIsSending(true);

    try {
      const response = await GraphService.sendPrompt(prompt);

      setMessages((prev) => [
        ...prev,
        { type: 'response', text: response || 'No response from LLM.' },
      ]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  const saveToGraph = async () => {
    const latestResponseMessage = [...messages].reverse().find((msg) => msg.type === 'response');

    if (latestResponseMessage) {
      setIsSaving(true);
      try {
        await GraphService.saveToGraph(latestResponseMessage.text);

        setAlertMessage('Successfully saved to graph.');
        setAlertSeverity('success');
        setAlertOpen(true);

        // Call onSaveComplete to refresh graph data
        if (onSaveComplete) {
          onSaveComplete();
        }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error('Error saving to graph:', error);
        setAlertMessage(`Error saving to graph: ${error.message}`);
        setAlertSeverity('error');
        setAlertOpen(true);
      } finally {
        setIsSaving(false); 
      }
    } else {
      setAlertMessage('No response message to save.');
      setAlertSeverity('info');
      setAlertOpen(true);
    }
  };

  return (
    <ChatContainer>
      <Typography variant="h4" align="center" gutterBottom>
         LLM Chat Graph
      </Typography>

      <ContentContainer>
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
                      <ResponseBubble elevation={1}>
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            // Code block rendering with syntax highlighting
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            code({ node, inline, className, children, ...props }) {
                              const match = /language-(\w+)/.exec(className || '')
                              return !inline && match ? (
                                <SyntaxHighlighter
                                  style={materialDark}
                                  language={match[1]}
                                  PreTag="div"
                                  {...props}
                                >
                                  {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                              ) : (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              )
                            }
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      </ResponseBubble>
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
          label="Prompt"
          multiline
          minRows={2}
          maxRows={10}
          variant="outlined"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your prompt here..."
          disabled={isSending}
          fullWidth
          inputRef={promptInputRef}
          InputProps={{
            style: { backgroundColor: '#3b82f680', color: 'whitesmoke' },
          }}
          InputLabelProps={{
            sx: {
              color: '#3b82f680', 
              '&.Mui-focused': {
                color: 'primary.main', // Optional: Change label color when focused
              },
            },
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
            <Button
              variant="contained"
              color="secondary"
              onClick={saveToGraph}
              disabled={isSaving} 
              startIcon={isSaving ? <CircularProgress size={20} /> : null}
            >
              {isSaving ? 'Saving...' : 'Save to Graph'}
            </Button>
          </Stack>
        </Stack>
      </ContentContainer>

      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleAlertClose} severity={alertSeverity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </ChatContainer>
  );
};

export default ChatComponent;