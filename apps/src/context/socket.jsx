import { createContext, useContext, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import socketio from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const socket = useMemo(
    () => socketio.connect(import.meta.env.VITE_BACKEND_URL, {
      withCredentials: true,
    }),
    []
  );

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connecté au serveur socket (ID:", socket.id, ")");
    });

    socket.on("disconnect", () => {
      console.log("Déconnecté du serveur socket.");
    });

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

SocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// // context/socket.js
// import React from "react";
// import socketio from "socket.io-client";

// export const socket = socketio.connect(import.meta.env.VITE_BACKEND_URL);
// //export const socket = socketio.connect("http://localhost:3333");

// socket.on("connect", () => {
//   console.log("Connecté au serveur socket");
// });

// export const SocketContext = React.createContext(socket); // Valeur par défaut est le socket lui-même
