import { useMutation } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../config/axiosConfig";
import { useAuth } from "../context/AuthContext";
import WelcomeModal from "../components/WelcomeModal";
import { User as UserIcon, Camera, XCircle, Loader2, CheckCircle, Edit2, Shield, MailCheck, MailWarning } from "lucide-react";

function ProfileComponent({ user, onUpdateSuccess }) {
  const [isEditing, setIsEditing] = useState(false);
  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      address: user?.address || "",
      phoneNumber: user?.phoneNumber || "",
      photo: null,
    }
  });

  const photoFile = watch("photo");
  const selectedImage = photoFile && photoFile[0] ? URL.createObjectURL(photoFile[0]) : null;
  const avatarSrc = selectedImage || `${import.meta.env.VITE_BACKEND_URL}/${user?.avatarUrl || `uploads/avatars/${(user?.id % 5) + 1}.png`}`;

  const { mutate: updateUser, isLoading } = useMutation({
    mutationFn: (formData) =>
      axiosInstance.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user?userId=${user.id}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      ),
    onSuccess: () => {
      toast.success("Profil mis à jour. Veuillez vous reconnecter pour appliquer les changements.", { duration: 4000 });
      onUpdateSuccess();
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.error || "Erreur lors de la mise à jour.";
      toast.error(errorMessage);
    }
  });

  const onSubmit = (data) => {
    const formDataToSend = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'photo' && data.photo[0]) {
        formDataToSend.append(key, data.photo[0]);
      } else if (key !== 'photo') {
        formDataToSend.append(key, data[key]);
      }
    });
    formDataToSend.append("profilId", user?.profil?.id);
    updateUser(formDataToSend);
  };
  
  return (
    <div className="tw-bg-white tw-p-6">
      <div className="tw-flex tw-justify-between tw-items-center tw-mb-6">
        <h3 className="tw-text-xl tw-font-semibold tw-text-gray-800">Mon Profil</h3>
        <button onClick={() => setIsEditing(!isEditing)} className="btn btn-sm btn-light tw-flex tw-items-center">
          <Edit2 size={14} className="tw-mr-1" />
          {isEditing ? "Annuler" : "Modifier"}
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="tw-flex tw-flex-col tw-items-center tw-mb-4">
          <div className="tw-relative">
            <img src={avatarSrc} alt="Avatar" className="tw-w-24 tw-h-24 tw-rounded-full tw-object-cover tw-border-4 tw-border-gray-200" />
            {isEditing && (
              <label htmlFor="photo-upload" className="tw-absolute tw-bottom-0 tw-right-0 tw-bg-blue-600 tw-text-white tw-p-1.5 tw-rounded-full tw-cursor-pointer hover:tw-bg-blue-700">
                <Camera size={16} />
                <input id="photo-upload" type="file" className="tw-hidden" {...register("photo")} />
              </label>
            )}
          </div>
          <div className="tw-mt-3 tw-text-center">
            <h4 className="tw-font-bold tw-text-lg">{user?.fullName}</h4>
            <div className="tw-flex tw-items-center tw-justify-center tw-gap-2">
              <span className={`badge ${user?.Profil?.wording === 'Superadmin' ? 'bg-danger-transparent' : 'bg-primary-transparent'}`}>
                <Shield size={12} className="tw-inline tw-mr-1"/>{user?.Profil?.wording}
              </span>
              <span className={`badge ${user?.status ? 'bg-success-transparent' : 'bg-warning-transparent'}`}>
                {user?.status ? <CheckCircle size={12} className="tw-inline tw-mr-1"/> : <XCircle size={12} className="tw-inline tw-mr-1"/>}
                {user?.status ? 'Actif' : 'Inactif'}
              </span>
            </div>
          </div>
        </div>

        <div className="tw-space-y-4">
          <div className="form-group">
            <label>Nom Complet</label>
            <input type="text" className="form-control" {...register("fullName")} disabled={!isEditing} />
          </div>
          <div className="form-group">
            <label className="tw-flex tw-items-center">Email 
                {user?.validEmail ? <MailCheck size={14} className="tw-ml-2 tw-text-green-600"/> : <MailWarning size={14} className="tw-ml-2 tw-text-orange-500"/>}
            </label>
            <input type="email" className="form-control" {...register("email")} disabled={!isEditing} />
          </div>
          <div className="form-group">
            <label>Adresse</label>
            <input type="text" className="form-control" {...register("address")} disabled={!isEditing} />
          </div>
          <div className="form-group">
            <label>Téléphone</label>
            <input type="text" className="form-control" {...register("phoneNumber")} disabled={!isEditing} />
          </div>
        </div>

        {isEditing && (
          <div className="tw-mt-6 tw-flex tw-justify-end tw-gap-3">
            <button type="button" className="btn btn-light" onClick={() => setIsEditing(false)}>Annuler</button>
            <button type="submit" className="btn btn-primary tw-flex tw-items-center" disabled={isLoading}>
              {isLoading ? <Loader2 className="tw-animate-spin tw-mr-2" /> : <CheckCircle size={16} className="tw-mr-2" />}
              Sauvegarder
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

ProfileComponent.propTypes = {
  onClose: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  onUpdateSuccess: PropTypes.func.isRequired,
};

export default function Profile() {
  const [isModalOpen, setModalOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleUpdateSuccess = () => {
    setModalOpen(false);
    setTimeout(() => {
      logout();
      navigate("/");
    }, 3000);
  };

  return (
    <>
      <button onClick={() => setModalOpen(true)} className="tw-w-full tw-text-left tw-px-4 tw-py-2 tw-text-sm tw-text-gray-700 hover:tw-bg-gray-100 tw-flex tw-items-center">
        <UserIcon size={16} className="tw-mr-2" />
        Profil
      </button>

      <WelcomeModal isActive={isModalOpen} onClose={() => setModalOpen(false)}>
        <ProfileComponent onClose={() => setModalOpen(false)} user={user} onUpdateSuccess={handleUpdateSuccess} />
      </WelcomeModal>
    </>
  );
}