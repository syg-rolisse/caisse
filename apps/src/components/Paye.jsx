import { useMutation } from "@tanstack/react-query";
import { FedaCheckoutButton } from "fedapay-reactjs";
import PropTypes from "prop-types";
import toast from "react-hot-toast";
import axiosInstance from "../config/axiosConfig";
import { useAuth } from "../context/AuthContext";

const Paye = ({ packId, montant }) => {
  //const PUBLIC_KEY = import.meta.env.VITE_FEDA_PUBLIC_SANDBOX_KEY;
  const PUBLIC_KEY = import.meta.env.VITE_FEDA_PUBLIC_LIVE_KEY;
  
  const { user } = useAuth();

  const { mutate: createOrRenewAbonnement } = useMutation({
    mutationFn: (data) =>
      axiosInstance.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/abonnement/renouveler?companieId=${user?.company?.id}`,
        data
      ),
    onSuccess: (response) => {
      console.log(response);
      
      toast.success(response?.data?.message || "Paiement et renouvellement effectués avec succès !", {
        duration: 3000,
      });
      setTimeout(() => {
        window.location.reload();
      }, 4000);
    },
    onError: (error) => {
      console.log(error);
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
  if (resp.reason === "CHECKOUT COMPLETE" && resp.transaction?.status === "approved") {
    
    toast.success("Paiement FedaPay validé, mise à jour en cours...");
    
    createOrRenewAbonnement({
      packId: packId,
      userId: user.id,
      transactionId: resp.transaction.id 
    });

  } else {
    toast.error("Le paiement a échoué ou a été annulé.");
  }
},
  };

  return (
    <div>
      {/* <button className="btn btn-primary" onClick={() => createOrRenewAbonnement({ packId: packId, userId: user.id })}>Renouveler Maintenant</button> */}
      <FedaCheckoutButton options={checkoutButtonOptions} />
    </div>
  );
};

Paye.propTypes = {
  packId: PropTypes.number.isRequired,
  montant: PropTypes.number.isRequired,
};

export default Paye;