// src/components/dashboard/TypeDepenseStatsCard.js
import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { Layers, ArrowRightLeft, DollarSign } from 'lucide-react';

const TypeDepenseStatsCard = ({ allTypeDepense }) => {

  // Utilise useMemo pour calculer les totaux de manière performante.
  // Ce calcul ne se relance que si `allTypeDepense` change.
  const summaryStats = useMemo(() => {
    if (!allTypeDepense || allTypeDepense.length === 0) {
      return { grandTotalDepense: 0, grandTotalMouvement: 0 };
    }

    return allTypeDepense.reduce(
      (acc, type) => {
        acc.grandTotalDepense += type.totalDepense || 0;
        acc.grandTotalMouvement += type.totalMouvement || 0;
        return acc;
      },
      { grandTotalDepense: 0, grandTotalMouvement: 0 }
    );
  }, [allTypeDepense]);

  return (
    <div className="col-sm-12 col-md-6 col-lg-6 col-xxl-3">
      <div className="card custom-card">
        <div className="card-header justify-content-between">
          <div>
            <div className="card-title">Types de Dépenses</div>
          </div>
          <div className="card-options">
            <div className="form-check form-check-md form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="flexSwitchCheckTypeDepense"
                defaultChecked
              />
            </div>
          </div>
        </div>
        <div className="p-3">
          <div className="d-flex">
            <div>
              <h6 className="text-muted">Nombre de catégories</h6>
              <div className="d-flex align-items-center">
                <Layers className="text-info me-2" size={24} />
                <h3 className="text-dark count mt-0 font-30 mb-0">
                  {allTypeDepense?.length || 0}
                </h3>
              </div>
            </div>
            <span className="ms-auto" id="total-projects"></span>
          </div>
        </div>
        <div className="card-footer">
          <span className="text-start d-flex align-items-center text-success">
            <DollarSign size={16} className="me-1" />
            Total Dépensé: {summaryStats.grandTotalDepense.toLocaleString()}
          </span>
          <span className="float-end d-flex align-items-center text-primary">
            <ArrowRightLeft size={16} className="me-1" />
            Total Mouvements: {summaryStats.grandTotalMouvement.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

// On met à jour les propTypes pour ne garder que ce qui est nécessaire
TypeDepenseStatsCard.propTypes = {
  allTypeDepense: PropTypes.array.isRequired,
};

export default TypeDepenseStatsCard;