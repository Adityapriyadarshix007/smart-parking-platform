import { useEffect, useRef } from 'react';
import io from 'socket.io-client';

export const useSocket = (url) => {
  const socketRef = useRef(null);

  useEffect(() => {
    const socketUrl = url || process.env.REACT_APP_SOCKET_URL || '${API_BASE_URL}';
    socketRef.current = io(socketUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });
    
    socketRef.current.on('connect', () => {
      console.log('Socket connected:', socketRef.current.id);
    });
    
    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [url]);

  return socketRef.current;
};
