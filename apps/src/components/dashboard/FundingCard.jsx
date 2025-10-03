// src/components/Dashboard/FundingCard.js
import PropTypes from 'prop-types';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString("fr-CA", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
};

const FundingCard = ({ summary }) => {
  return (
    <div className="col-sm-12 col-md-6 col-lg-6 col-xxl-3">
      <div className="card custom-card">
        <div className="card-header justify-content-between">
            <div>
                <div className="card-title">Approvisionnements</div>
            </div>
            {/* ... card options ... */}
        </div>
        <div className="p-3">
          <div className="d-flex">
            <div>
              <h6 className="text-muted">Total approvisionné</h6>
              <div className="tw-mt-2 tw-space-x-4">
                <span className="tag tw-font-bold tw-bg-green-600 tw-text-white">
                  {summary?.total?.toLocaleString() ?? '0'}
                </span>
              </div>
            </div>
            <span className="ms-auto" id="total-tasks"></span>
          </div>
        </div>
        <div className="card-footer">
          <span className="text-start">
            <i className="fa fa-money text-success me-1"></i>
            Dernier: {summary?.dernierMontant?.toLocaleString() ?? '0'}
          </span>
          <span className="float-end">
            <i className="fa fa-calendar text-primary me-1"></i>
            {formatDate(summary?.du)}
          </span>
        </div>
      </div>
    </div>
  );
};

FundingCard.propTypes = {
  summary: PropTypes.object.isRequired,
};

export default FundingCard;