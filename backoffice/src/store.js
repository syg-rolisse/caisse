// context/socket.js
import React from "react";
import socketio from "socket.io-client";

// Connexion à votre serveur de socket
export const socket = socketio.connect("http://localhost:3333");

// Création du contexte
export const SocketContext = React.createContext();
