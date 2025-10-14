// src/pages/dashboard/Dashboard.js

import { useUsers } from "../../hook/data/useUsers";
import { useSoldeCaisse } from "../../hook/data/useSoldeCaisse";
import { useTypeDepense } from "../../hook/data/useTypeDepense";
import UserStatsCard from "../../components/dashboard/UserStatsCard";
import BalanceCard from "../../components/dashboard/BalanceCard";
import TypeDepenseCard from "../../components/dashboard/TypeDepenseCard";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import ExpenseChart from "../../components/dashboard/ExpenseChart"; // 👈 Importer le nouveau composant
import { Loader2 } from "lucide-react";
import { useHandleError } from "../../hook/useHandleError";
import { useEffect } from "react";

const Dashboard = () => {
  const { usersLoading, usersError, userStats, allUsers } = useUsers();
  const { soldeCaisseLoading, soldeCaisseError, soldeCaisse } = useSoldeCaisse();
  const { typeDepenseLoading, typeDepenseError, allTypeDepense } = useTypeDepense();
  const handleError = useHandleError();

  useEffect(() => {
    if (usersError) handleError(usersError);
  }, [usersError, handleError]);

  useEffect(() => {
    if (soldeCaisseError) handleError(soldeCaisseError);
  }, [soldeCaisseError, handleError]);

  useEffect(() => {
    if (typeDepenseError) handleError(typeDepenseError);
  }, [typeDepenseError, handleError]);

  if (usersLoading || soldeCaisseLoading || typeDepenseLoading) {
    return (
      <div className="tw-flex tw-justify-center tw-items-center tw-py-16">
        <Loader2 className="tw-w-12 tw-h-12 tw-animate-spin tw-text-violet-500" />
      </div>
    );
  }

  return (
    <div className="tw-p-4 md:tw-p-6 tw-mb-12">
      <DashboardHeader />

      <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 xl:tw-grid-cols-4 tw-gap-6 tw-mb-8">
        <UserStatsCard stats={userStats} allUsers={allUsers} />
        <BalanceCard solde={soldeCaisse?.solde} />
      </div>

      {/* 👇 Section pour le graphique, placée ici pour un impact visuel maximal */}
      <div className="tw-mb-8">
        <ExpenseChart data={allTypeDepense} />
      </div>

      <div className="tw-mb-4">
        <h2 className="tw-text-2xl tw-font-semibold tw-text-gray-700">Détails par Type de Dépense</h2>
      </div>

      <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 xl:tw-grid-cols-4 tw-gap-6">
        {allTypeDepense && allTypeDepense.length > 0 ? (
          allTypeDepense.map((type) => (
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

export default Dashboard;