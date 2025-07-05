import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface WebSocketMessage {
  type: 'notification' | 'bid_update' | 'job_status' | 'chat_message' | 'payment_update';
  data: any;
  timestamp: number;
}

export const useWebSocket = (url?: string) => {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const wsUrl = url || `ws://localhost:8080/ws/${currentUser?.id}`;

  const connect = useCallback(() => {
    if (!currentUser?.id) return;

    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          
          // Handle different message types
          switch (message.type) {
            case 'notification':
              addToast(message.data.message, 'info');
              break;
            case 'bid_update':
              addToast(`New bid received: ${message.data.amount} MAD`, 'success');
              break;
            case 'job_status':
              addToast(`Job status updated: ${message.data.status}`, 'info');
              break;
            case 'chat_message':
              // Handle chat message (you might want to update chat state here)
              break;
            case 'payment_update':
              addToast(`Payment ${message.data.status}`, message.data.status === 'completed' ? 'success' : 'info');
              break;
            default:
              console.log('Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const timeout = Math.pow(2, reconnectAttempts.current) * 1000; // Exponential backoff
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, timeout);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionError('Connection failed');
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionError('Failed to connect');
    }
  }, [currentUser?.id, wsUrl, addToast]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Component unmounting');
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionError(null);
  }, []);

  const sendMessage = useCallback((message: Omit<WebSocketMessage, 'timestamp'>) => {
    if (wsRef.current && isConnected) {
      const messageWithTimestamp: WebSocketMessage = {
        ...message,
        timestamp: Date.now(),
      };
      wsRef.current.send(JSON.stringify(messageWithTimestamp));
    } else {
      console.warn('WebSocket not connected. Cannot send message.');
    }
  }, [isConnected]);

  useEffect(() => {
    if (currentUser?.id) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [currentUser?.id, connect, disconnect]);

  return {
    isConnected,
    connectionError,
    lastMessage,
    sendMessage,
    reconnect: connect,
    disconnect,
  };
};

// Hook for specific WebSocket events
export const useWebSocketEvent = (eventType: WebSocketMessage['type'], callback: (data: any) => void) => {
  const { lastMessage } = useWebSocket();

  useEffect(() => {
    if (lastMessage && lastMessage.type === eventType) {
      callback(lastMessage.data);
    }
  }, [lastMessage, eventType, callback]);
};

// Hook for real-time job updates
export const useJobUpdates = (jobId: string, onUpdate: (update: any) => void) => {
  useWebSocketEvent('job_status', (data) => {
    if (data.jobId === jobId) {
      onUpdate(data);
    }
  });

  useWebSocketEvent('bid_update', (data) => {
    if (data.jobId === jobId) {
      onUpdate(data);
    }
  });
};

// Hook for real-time chat
export const useChatUpdates = (chatId: string, onMessage: (message: any) => void) => {
  useWebSocketEvent('chat_message', (data) => {
    if (data.chatId === chatId) {
      onMessage(data);
    }
  });
};
