import { useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "../../context/socket.jsx";
import { useFetchSolde } from "../../hook/api/useFetchSolde";
import { useFetchTypeDepense } from "../../hook/api/useFetchTypeDepense";
import { useFetchUsers } from "../../hook/api/useFetchUsers";
import { useFetchAbonnement } from "../../hook/api/useFetchAbonnement";
import UserStatsCard from "../../components/dashboard/UserStatsCard";
import BalanceCard from "../../components/dashboard/BalanceCard";
import SubscriptionCountdownCard from "../../components/dashboard/SubscriptionCountdownCard";
import TypeDepenseCard from "../../components/dashboard/TypeDepenseCard";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import ExpenseChart from "../../components/dashboard/ExpenseChart";
import { Loader2, ServerCrash } from "lucide-react";

export default function Dashboard() {
  const queryClient = useQueryClient();
  const socket = useSocket();
  const user = JSON.parse(localStorage.getItem("user"));
  const companyId = user?.company?.id;

  const { data: soldeData, isLoading: isSoldeLoading, isError: isSoldeError, error: soldeError } = 
    useFetchSolde({ companyId });

  const { data: typeDepenseData, isLoading: isTypeDepenseLoading, isError: isTypeDepenseError, error: typeDepenseError } = 
    useFetchTypeDepense({ companyId, page: 1, perpage: 9999 });

  const { data: usersData, isLoading: isUsersLoading, isError: isUsersError, error: usersError } = 
    useFetchUsers({ companyId, page: 1, perpage: 9999 });

  const { data: abonnementData, isLoading: isAbonnementLoading, isError: isAbonnementError, error: abonnementError } =
    useFetchAbonnement({ companyId });

  const solde = soldeData?.solde ?? 0;
  const allUsers = usersData?.allUsers || [];
  const allAbonnements = abonnementData?.abonnements || [];

  const allTypeDepenseWithStats = useMemo(() => {
    const rawData = typeDepenseData?.allTypeDepenses || [];
    if (rawData.length === 0) return [];
    
    return rawData.map((type) => {
      const totalDepense = (type.Depenses || []).reduce(
        (sum, currentDepense) => sum + (currentDepense.montant || 0), 0
      );
      const totalMouvement = (type.Depenses || [])
        .flatMap((depense) => depense.Mouvements || [])
        .reduce((sum, currentMouvement) => sum + (currentMouvement.montant || 0), 0);
      return { ...type, totalDepense, totalMouvement };
    });
  }, [typeDepenseData]);

  const userStats = useMemo(() => {
    if (!allUsers) return {};
    const statsByProfile = allUsers.reduce((acc, user) => {
      const profileName = user.Profil?.wording?.replace(/\s+/g, '') || 'Inconnu';
      acc[profileName] = (acc[profileName] || 0) + 1;
      return acc;
    }, {});
    
    return {
      totalUsers: allUsers.length,
      activeUsers: allUsers.filter(u => u.status).length,
      inactiveUsers: allUsers.filter(u => !u.status).length,
      ...statsByProfile,
    };
  }, [allUsers]);

  useEffect(() => {
    if (!socket || !companyId) return;
    socket.emit("join_company_room", companyId);

    const invalidateAllDashboardData = () => {
      queryClient.invalidateQueries({ queryKey: ["solde", companyId] });
      queryClient.invalidateQueries({ queryKey: ["typeDepenses"] });
      queryClient.invalidateQueries({ queryKey: ["depenses"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["abonnements"] });
    };

    const dashboardEvents = [
        "type_depense_created", "type_depense_updated", "type_depense_deleted", 
        "depense_created", "depense_updated", "depense_deleted", 
        "appro_created", "appro_updated", "appro_deleted",
        "user_created", "user_updated", "user_deleted",
        "abonnement_updated"
    ];

    dashboardEvents.forEach(event => socket.on(event, invalidateAllDashboardData));

    return () => {
      dashboardEvents.forEach(event => socket.off(event, invalidateAllDashboardData));
    };
  }, [socket, companyId, queryClient]);

  const isLoading = isSoldeLoading || isTypeDepenseLoading || isUsersLoading || isAbonnementLoading;
  const isError = isSoldeError || isTypeDepenseError || isUsersError || isAbonnementError;
  const anyError = soldeError || typeDepenseError || usersError || abonnementError;

  if (isLoading) {
    return (
      <div className="tw-flex tw-justify-center tw-items-center tw-h-screen">
        <Loader2 className="tw-w-12 tw-h-12 tw-animate-spin tw-text-violet-500" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="tw-flex tw-flex-col tw-justify-center tw-items-center tw-h-screen tw-text-red-500">
        <ServerCrash className="tw-w-16 tw-h-16 tw-mb-4" />
        <h2 className="tw-text-xl tw-font-semibold">Erreur de chargement du tableau de bord</h2>
        <p>{anyError?.message}</p>
      </div>
    );
  }

  return (
    <div className="tw-p-4 max-sm:tw-p-3 tw-mb-12">
  
      <DashboardHeader />

<div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 xl:tw-grid-cols-4 tw-gap-6 tw-mb-8">
  <div className="md:tw-col-span-2 xl:tw-col-span-2">
    <UserStatsCard stats={userStats} />
  </div>
  
  <BalanceCard solde={solde} />

  <SubscriptionCountdownCard abonnements={allAbonnements} />
</div>

      <div className="tw-mb-8">
        <ExpenseChart data={allTypeDepenseWithStats} />
      </div>

      <div className="tw-mb-4">
        <h2 className="tw-text-2xl tw-font-semibold tw-text-gray-700">Détails par Type de Dépense</h2>
      </div>

      <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 xl:tw-grid-cols-4 tw-gap-6">
        {allTypeDepenseWithStats.length > 0 ? (
          allTypeDepenseWithStats.map((type) => (
            <TypeDepenseCard key={type.id} typeDepense={type} />
          ))
        ) : (
          <div className="tw-col-span-full tw-text-center tw-py-10">
            <p className="tw-text-gray-500">Aucun type de dépense trouvé.</p>
          </div>
        )}
      </div>
    </div>
  );
};