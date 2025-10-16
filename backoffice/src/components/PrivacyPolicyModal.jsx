import PropTypes from "prop-types";
import { useState } from "react";

function PrivacyPolicyModal({ onClose }) {
  return (
    <div className="modal-overlay tw-z-50 tw-fixed tw-top-0 tw-left-0 tw-w-full tw-h-full card tw-flex tw-justify-center tw-items-center">
      <div className="container-fluid">
        {/* Page Header */}
        <div className="d-md-flex d-block align-items-center justify-content-between my-4 page-header-breadcrumb">
          <div className="">
            <div className="">
              <nav>
                <ol className="breadcrumb mb-1 mb-md-0">
                  <li className="breadcrumb-item">
                    <a href="javascript:void(0);">
                      Politique de Confidentialité
                    </a>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Terms
                  </li>
                </ol>
              </nav>
            </div>
          </div>
          <div className="ms-auto pageheader-btn">
            <nav>
              <div className="breadcrumb mb-0">
                <div className="d-flex">
                  <a
                    href="#"
                    onClick={onClose}
                    className="btn btn-secondary text-fixed-white"
                    data-bs-toggle="tooltip"
                    title=""
                    data-placement="bottom"
                    data-original-title="Rating"
                  >
                    <span>
                      <i className="fe fe-star"></i>
                    </span>
                  </a>
                </div>
              </div>
            </nav>
          </div>
        </div>
        {/* Page Header Close */}

        {/* ROW-1 OPEN */}
        <div className="row ">
          <div className="col-md-12">
            <div className="card">
              <div className="card-body">
                <h5 className="fs-16 fw-semibold">Welcome to Hogo</h5>
                <p className="op-8">
                  I must explain to you how all this mistaken idea of denouncing
                  pleasure and praising pain was born and I will give you a
                  complete account of the system, and expound the actual
                  teachings of the great explorer of the truth, the
                  master-builder of human happiness. No one rejects, dislikes,
                  or avoids pleasure itself, because it is pleasure, but because
                  those who do not know how to pursue pleasure rationally
                  encounter consequences
                </p>
              </div>
            </div>
          </div>
          {/* COL-END */}
          <div className="col-md-12">
            <div className="card">
              <div className="card-body">
                <h5 className="fs-16 fw-semibold">Using Our Services</h5>
                <p className="op-8">
                  I must explain to you how all this mistaken idea of denouncing
                  pleasure and praising pain was born and I will give you a
                  complete account of the system, and expound the actual
                  teachings of the great explorer of the truth, the
                  master-builder of human happiness. No one rejects, dislikes,
                  or avoids pleasure itself, because it is pleasure, but because
                  those who do not know how to pursue pleasure rationally
                  encounter consequences
                </p>
              </div>
            </div>
          </div>
          {/* COL-END */}
          <div className="col-md-12">
            <div className="card">
              <div className="card-body">
                <h5 className="fs-16 fw-semibold">Privacy policy</h5>
                <p className="op-8">
                  I must explain to you how all this mistaken idea of denouncing
                  pleasure and praising pain was born and I will give you a
                  complete account of the system, and expound the actual
                  teachings of the great explorer of the truth, the
                  master-builder of human happiness. No one rejects, dislikes,
                  or avoids pleasure itself, because it is pleasure, but because
                  those who do not know how to pursue pleasure rationally
                  encounter consequences
                </p>
              </div>
            </div>
          </div>
          {/* COL-END */}
          <div className="col-md-12">
            <div className="card">
              <div className="card-body">
                <h5 className="fs-16 fw-semibold">Copyright</h5>
                <p className="op-8">
                  I must explain to you how all this mistaken idea of denouncing
                  pleasure and praising pain was born and I will give you a
                  complete account of the system, and expound the actual
                  teachings of the great explorer of the truth, the
                  master-builder of human happiness. No one rejects, dislikes,
                  or avoids pleasure itself, because it is pleasure, but because
                  those who do not know how to pursue pleasure rationally
                  encounter consequences
                </p>
              </div>
            </div>
          </div>
          {/* COL-END */}
          <div className="col-md-12">
            <div className="card">
              <div className="card-body">
                <h5 className="fs-16 fw-semibold">Terms and Conditions</h5>
                <p className="op-8">
                  I must explain to you how all this mistaken idea of denouncing
                  pleasure and praising pain was born and I will give you a
                  complete account of the system, and expound the actual
                  teachings of the great explorer of the truth, the
                  master-builder of human happiness. No one rejects, dislikes,
                  or avoids pleasure itself, because it is pleasure, but because
                  those who do not know how to pursue pleasure rationally
                  encounter consequences
                </p>
                <ul className="ps-0 op-8">
                  <li>
                    <i className="bi bi-chevron-double-right"></i> ducimus qui
                    blanditiis praesentium voluptatum deleniti atque corrupti
                    quos dolores
                  </li>
                  <li>
                    <i className="bi bi-chevron-double-right"></i> quas
                    molestias excepturi sint occaecati cupiditate non provident
                  </li>
                  <li>
                    <i className="bi bi-chevron-double-right"></i> Nam libero
                    tempore, cum soluta nobis est eligendi optio cumque
                  </li>
                  <li>
                    <i className="bi bi-chevron-double-right"></i> Temporibus
                    autem quibusdam et aut officiis debitis aut rerum
                    necessitatibus saepe eveniet ut et voluptates
                  </li>
                  <li>
                    <i className="bi bi-chevron-double-right"></i> repudiandae
                    sint et molestiae non recusandae itaque earum rerum hic
                    tenetur a sapiente delectus
                  </li>
                  <li>
                    <i className="bi bi-chevron-double-right"></i> ut aut
                    reiciendis voluptatibus maiores alias consequatur aut
                    perferendis doloribus asperiores repellat
                  </li>
                </ul>
              </div>
            </div>
            <div className="card">
              <div className="card-body text-start">
                <div className="terms">
                  <h5 className="fs-16 fw-semibold">
                    Was this information is Helpful?
                  </h5>
                  <a className="btn btn-primary">Yes</a>
                  <a className="btn btn-secondary" onClick={onClose}>
                    No
                  </a>
                </div>
              </div>
            </div>
          </div>
          {/* COL-END */}
        </div>
        {/* ROW-1 CLOSE */}
      </div>
    </div>
  );
}

PrivacyPolicyModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default function PrivacyPolicyComponent() {
  const [isModalOpen, setModalOpen] = useState(false);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  return (
    <div>
      <div className="form-check mt-3">
        <input
          className="form-check-input"
          type="checkbox"
          value=""
          id="defaultCheck1"
        />
        <label
          className="form-check-label text-muted fw-normal"
          htmlFor="defaultCheck1"
        >
          En créant un compte, vous acceptez nos
          <a href="#" onClick={openModal} className="tw-text-orange-500 mx-1">
            <u>Terms & Conditions</u>
          </a>
          et
          <a
            href="#"
            onClick={openModal}
            className="tw-text-orange-500 tw-pl-1"
          >
            <u className="">Politique de confidentialité</u>
          </a>
        </label>
      </div>

      {isModalOpen && <PrivacyPolicyModal onClose={closeModal} />}
    </div>
  );
}
