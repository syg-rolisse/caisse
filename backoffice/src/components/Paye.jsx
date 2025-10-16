import { useMutation } from "@tanstack/react-query";
import { FedaCheckoutButton } from "fedapay-reactjs";
import PropTypes from "prop-types";
import toast from "react-hot-toast";
import axiosInstance from "../config/axiosConfig";
import { useAuth } from "../context/AuthContext";

const Paye = ({ packId, montant }) => {
  const PUBLIC_KEY = "pk_sandbox_JXVRe2Q6LYWAxqt6MjEgW41F";
  const { user } = useAuth();

  const { mutate: createOrRenewAbonnement } = useMutation({
    mutationFn: (data) =>
      axiosInstance.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/abonnement/renouveler?companieId=${user?.company?.id}`,
        data
      ),
    onSuccess: (response) => {
      toast.success(response?.data?.message || "Paiement et renouvellement effectués avec succès !", {
        duration: 3000,
      });
      setTimeout(() => {
        window.location.reload();
      }, 4000);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.error || "Erreur lors du traitement du paiement.");
    },
  });

  const checkoutButtonOptions = {
    public_key: PUBLIC_KEY,
    transaction: {
      amount: montant,
      description: `Abonnement Pack #${packId}`,
    },
    currency: {
      iso: "XOF",
    },
    button: {
      class: "btn btn-primary w-100",
      text: `Choisir ce Pack`,
    },
    onComplete: (resp) => {
      const FedaPay = window["FedaPay"];
      if (resp.reason === FedaPay.COMPLETE) {
        createOrRenewAbonnement({
          packId: packId,
          userId: user.id,
        });
      }
    },
  };

  return (
    <div>
      <FedaCheckoutButton options={checkoutButtonOptions} />
    </div>
  );
};

Paye.propTypes = {
  packId: PropTypes.number.isRequired,
  montant: PropTypes.number.isRequired,
};

export default Paye;