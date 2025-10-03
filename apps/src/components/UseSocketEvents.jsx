import { useState, useEffect, useContext } from "react";
import { SocketContext } from "../context/socket";

const useSocketEvents = (user) => {
  const [shouldRefreshDepense, setShouldRefreshDepense] = useState(false);
  const [shouldRefreshUsers, setShouldRefreshUsers] = useState(false);
  const socket = useContext(SocketContext);

  useEffect(() => {
    if (!socket) return;
    const user = JSON.parse(localStorage.getItem("user"));
    const handleDepenseAction = (companyId) => {
      if (companyId === user.company.id) {
        console.log("Depense action");
        setShouldRefreshDepense((prev) => !prev);
      }
    };

    const handleUserAction = (companyId) => {
      if (companyId === user.company.id) {
        console.log("User action");
        setShouldRefreshUsers((prev) => !prev);
      }
    };

    socket.on("depense_created", handleDepenseAction);
    socket.on("depense_updated", handleDepenseAction);
    socket.on("depense_deleted", handleDepenseAction);
    socket.on("user_created", handleUserAction);
    socket.on("user_updated", handleUserAction);
    socket.on("user_deleted", handleUserAction);
    return () => {
      socket.off("depense_created", handleDepenseAction);
      socket.off("depense_updated", handleDepenseAction);
      socket.off("depense_deleted", handleDepenseAction);
      socket.off("user_created", handleUserAction);
      socket.off("user_updated", handleUserAction);
      socket.off("user_deleted", handleUserAction);
    };
  }, [socket, user?.company.id]);

  return { shouldRefreshDepense, shouldRefreshUsers };
};

export default useSocketEvents;
