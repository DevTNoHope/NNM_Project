import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const useSocket = () => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) return;

    const newSocket = io(SOCKET_SERVER_URL, {
      withCredentials: true,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      // Tham gia room dựa trên role
      const roomKey = user.role === "ADMIN" ? "admin" : user.id?.toString();
      if (roomKey) {
        newSocket.emit("join", roomKey);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  return socket;
};
