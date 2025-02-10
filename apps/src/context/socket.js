// context/socket.js
import React from "react";
import socketio from "socket.io-client";

export const socket = socketio.connect(import.meta.env.VITE_BACKEND_URL);
//export const socket = socketio.connect("http://localhost:3333");

socket.on("connect", () => {
  console.log("Connecté au serveur socket");
});

export const SocketContext = React.createContext(socket); // Valeur par défaut est le socket lui-même
