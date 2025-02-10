import { useState, useEffect, useContext } from "react";
import { SocketContext } from "../context/socket";

const useSocketEvents = (user) => {
  const [shouldRefreshDepense, setShouldRefreshDepense] = useState(false);
  const socket = useContext(SocketContext);

  useEffect(() => {
    if (!socket) return;
    const user = JSON.parse(localStorage.getItem("user"));
    const handleDepenseAction = (companyId) => {
      if (companyId === user.company.id) {
        setShouldRefreshDepense((prev) => !prev);
      }
    };

    socket.on("depense_created", handleDepenseAction);
    socket.on("depense_updated", handleDepenseAction);
    socket.on("depense_deleted", handleDepenseAction);
    return () => {
      socket.off("depense_created", handleDepenseAction);
      socket.off("depense_updated", handleDepenseAction);
      socket.off("depense_deleted", handleDepenseAction);
    };
  }, [socket, user?.company.id]);

  return { shouldRefreshDepense };
};

export default useSocketEvents;
