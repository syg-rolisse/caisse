import { createContext, useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { useSocket } from "./socket.jsx";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const socket = useSocket();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setPermissions(userData.profil?.Permission || {});
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem("user");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handlePermissionsUpdate = (updatedUserFromSocket) => {

      setUser(currentUser => {
        if (!currentUser || updatedUserFromSocket.id !== currentUser.id) {
          return currentUser; // On retourne l'état inchangé.
        }
        const newUserState = {
          ...currentUser, // Garde toutes les clés, y compris le token actuel !
          profil: updatedUserFromSocket.Profil, // Met à jour le profil.
          status: updatedUserFromSocket.status,
          fullName: updatedUserFromSocket.fullName,
        };
        localStorage.setItem("user", JSON.stringify(newUserState));
        return newUserState;
      });

      setPermissions(updatedUserFromSocket.Profil?.Permission || {});
    };

    socket.on("permissions_updated", handlePermissionsUpdate);

    return () => {
      socket.off("permissions_updated", handlePermissionsUpdate);
    };
  }, [socket]); // Le tableau de dépendances ne contient plus `user`


  const login = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setPermissions(userData.profil?.Permission || {});
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setPermissions({});
  };

  const value = {
    user,
    permissions,
    isLoading,
    isLoggedIn: !!user,
    login,
    logout,
  };

  if (isLoading) {
    return null; 
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};