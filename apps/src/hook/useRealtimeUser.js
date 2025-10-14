import { useState, useEffect, useContext } from "react";
import { useFetchUsers } from "./api/useFetchUsers"; // Votre hook de fetch existant
import { SocketContext } from "../context/socket";

/**
 * Transforme la liste brute des utilisateurs en un objet de statistiques plat.
 * @param {Array} userList - La liste d'objets utilisateur (provient de allUsers).
 * @returns {Object} Un objet de statistiques prêt à être consommé par l'UI.
 */
const transformUserData = (userList = []) => {
  // Sécurité : si on ne reçoit pas un tableau, on retourne des valeurs par défaut.
  if (!Array.isArray(userList)) {
    return { totalUsers: 0, activeUsers: 0, inactiveUsers: 0 };
  }

  console.log("userList", userList);
  

  // Calcul des utilisateurs actifs/inactifs
  const activeUsers = userList.filter(u => u.status === true).length;
  const inactiveUsers = userList.length - activeUsers;

  // Calcul du nombre d'utilisateurs par profil
  const profileCounts = userList.reduce((acc, user) => {
    const profileName = user.Profil?.wording;
    if (profileName) {
      // Remplace les espaces pour créer une clé valide (ex: "Super Admin" -> "SuperAdmin")
      const key = profileName.replace(/\s/g, ''); 
      acc[key] = (acc[key] || 0) + 1;
    }
    return acc;
  }, {});

  // Retourne un seul objet plat avec toutes les statistiques
  return {
    totalUsers: userList.length,
    activeUsers,
    inactiveUsers,
    ...profileCounts, // Fusionne les comptes par profil dans l'objet principal
  };
};

export const useRealtimeUser = () => {
  // Votre hook useMutation qui retourne `fetchUsers`
  const { fetchUsers, isLoading, error, data } = useFetchUsers();
  
  // L'état `userStats` contiendra l'objet de statistiques transformé
  const [userStats, setUserStats] = useState({ totalUsers: 0, activeUsers: 0, inactiveUsers: 0 });
  const [allUsers, setAllUsers] = useState([]); // On garde aussi la liste brute si besoin
  const socket = useContext(SocketContext);
  const loggedInUser = JSON.parse(localStorage.getItem("user"));

  // Effet pour le chargement initial de tous les utilisateurs
  useEffect(() => {
    // On appelle fetchUsers sans paramètres pour que l'API nous retourne `allUsers`
    fetchUsers(); 
  }, [fetchUsers]);

  // Effet pour remplir l'état initial après le fetch
  useEffect(() => {
    // On vérifie que `data` et `data.allUsers` existent
    if (data && data.allUsers) {
      setAllUsers(data.allUsers);
      const stats = transformUserData(data.allUsers);
      setUserStats(stats);
    }
  }, [data]);

  // Effet pour la gestion des mises à jour via Socket.IO
  useEffect(() => {
    if (!socket || !loggedInUser?.company?.id) return;

    socket.emit("join_company_room", loggedInUser.company.id);

    const handleDataUpdate = (socketData) => {
      if (socketData.companyId !== loggedInUser.company.id) return;
      if (!socketData.allUsers) {
        console.error("[SOCKET] Erreur: La charge utile du socket ne contient pas 'allUsers'.");
        return;
      }
      const newAllUsers = socketData.allUsers;
      const newStats = transformUserData(newAllUsers);

      setAllUsers(newAllUsers); // Mettre à jour la liste brute
      setUserStats(newStats); // Mettre à jour les statistiques calculées
    };

    socket.on("user_created", handleDataUpdate);
    socket.on("user_updated", handleDataUpdate);
    socket.on("user_deleted", handleDataUpdate);

    return () => {
      socket.off("user_created", handleDataUpdate);
      socket.off("user_updated", handleDataUpdate);
      socket.off("user_deleted", handleDataUpdate);
    };
  }, [socket, loggedInUser?.company.id]);

  return {
    userStats, // L'objet principal à consommer
    allUsers,  // La liste brute, au cas où
    usersLoading: isLoading,
    usersError: error,
  };
};