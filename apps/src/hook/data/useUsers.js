// src/hooks/data/useUsers.js
import { useState, useEffect, useMemo } from "react";
import useSocketEvents from "../../components/UseSocketEvents";
import { useFetchUsers } from "../api/useFetchUsers";

export function useUsers(page = 1, perpage = 10) {
  const [allUsers, setUsers] = useState([]);
  const [usersError, setUsersError] = useState(null);

  const { shouldRefreshUsers } = useSocketEvents();
  const { fetchUsers, isLoading, isError, error, data } = useFetchUsers();

  useEffect(() => {
    fetchUsers({ page, perpage });
  }, [fetchUsers, shouldRefreshUsers, page, perpage]);

  useEffect(() => {
    if (data?.data) {
        console.log(data.data);
      setUsers(data.data);
    }
  }, [data]);

  useEffect(() => {
    if (isError) {
      setUsersError(error);
    }
  }, [isError, error]);

  const userStats = useMemo(() => {
    if (!allUsers || allUsers.length === 0) {
      return { total: 0, Superadmin: 0, Admin: 0, Employe: 0, Secretaire: 0 };
    }
    return allUsers.reduce(
      (acc, user) => {
        acc.total += 1;
        if (user.Profil?.wording === "Superadmin") acc.Superadmin += 1;
        if (user.Profil?.wording === "Admin") acc.Admin += 1;
        if (user.Profil?.wording === "Employe") acc.Employe += 1;
        if (user.Profil?.wording === "Secretaire") acc.Secretaire += 1;
        return acc;
      },
      { total: 0, Superadmin: 0, Admin: 0, Employe: 0, Secretaire: 0 }
    );
  }, [allUsers]);

  return {
    allUsers,
    usersLoading: isLoading,
    usersError,
    userStats,
    refetchUsers: fetchUsers, // 👈 exposé si besoin d’un refresh manuel
  };
}
