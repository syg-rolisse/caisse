import PropTypes from "prop-types";
import { useForm } from "react-hook-form";

const FilterCard = ({ users, onFilterSubmit, isLoadingUsers, initialValues }) => {
  const { register, handleSubmit } = useForm({
    defaultValues: initialValues,
  });

  // Quand le formulaire est soumis, on appelle la fonction du parent avec les données du formulaire.
  const onSubmit = (data) => {
    onFilterSubmit(data);
  };

  return (
    <div className="col-12">
      <div className="card custom-card">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-3">
            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-3">
              <div>
                <h6 className="text-muted">Utilisateurs</h6>
                <div className="form-group tw-mt-2">
                  <select
                    id="userId"
                    className="form-control form-control-lg"
                    {...register("userId")}
                    disabled={isLoadingUsers}
                  >
                    {isLoadingUsers ? (
                      <option>Chargement...</option>
                    ) : (
                      <>
                        <option value="">Tous les utilisateurs</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.fullName}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="du" className="form-label">Du</label>
                <input type="date" id="du" className="form-control" {...register("du")} />
              </div>
              <div>
                <label htmlFor="au" className="form-label">Au</label>
                <input type="date" id="au" className="form-control" {...register("au")} />
              </div>
            </div>
          </div>
          <div className="tw-pl-4 tw-pb-4 tw-w-40">
            <button type="submit" className="btn btn-primary" disabled={isLoadingUsers}>
              Recherche
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

FilterCard.propTypes = {
  users: PropTypes.array.isRequired,
  onFilterSubmit: PropTypes.func.isRequired,
  isLoadingUsers: PropTypes.bool,
  initialValues: PropTypes.object.isRequired,
};

export default FilterCard;