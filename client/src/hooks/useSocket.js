import { useEffect, useRef } from 'react';
import io from 'socket.io-client';

export const useSocket = (url) => {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(url || process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [url]);

  return socketRef.current;
};
