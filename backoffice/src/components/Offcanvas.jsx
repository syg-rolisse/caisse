//import React from "react";

const Offcanvas = () => {
  return (
    <div className="offcanvas-body tw-absolute tw-top-0">
      <div className="tab-content" id="nav-tabContent">
        <div
          className="tab-pane fade border-0"
          id="switcher-profile"
          role="tabpanel"
          aria-labelledby="switcher-profile-tab"
          tabIndex="0"
        >
          <div>
            <div className="theme-colors">
              <p className="switcher-style-head">Menu Colors:</p>
              <div className="d-flex switcher-style pb-2">
                <div className="form-check switch-select me-3">
                  <input
                    className="form-check-input color-input color-white"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title="Light Menu"
                    type="radio"
                    name="menu-colors"
                    id="switcher-menu-light"
                    defaultChecked
                  />
                </div>
              </div>
              <div className="px-4 pb-3 text-muted fs-11">
                Note:If you want to change color Menu dynamically change from
                below Theme Primary color picker
              </div>
            </div>
            <div className="theme-colors">
              <p className="switcher-style-head">Header Colors:</p>
              <div className="d-flex switcher-style pb-2">
                <div className="form-check switch-select me-3">
                  <input
                    className="form-check-input color-input color-white"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title="Light Header"
                    type="radio"
                    name="header-colors"
                    id="switcher-header-light"
                    defaultChecked
                  />
                </div>
                <div className="form-check switch-select me-3">
                  <input
                    className="form-check-input color-input color-dark"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title="Dark Header"
                    type="radio"
                    name="header-colors"
                    id="switcher-header-dark"
                  />
                </div>
                <div className="form-check switch-select me-3">
                  <input
                    className="form-check-input color-input color-primary"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title="Color Header"
                    type="radio"
                    name="header-colors"
                    id="switcher-header-primary"
                  />
                </div>
                <div className="form-check switch-select me-3">
                  <input
                    className="form-check-input color-input color-gradient"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title="Gradient Header"
                    type="radio"
                    name="header-colors"
                    id="switcher-header-gradient"
                  />
                </div>
                <div className="form-check switch-select me-3">
                  <input
                    className="form-check-input color-input color-transparent"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title="Transparent Header"
                    type="radio"
                    name="header-colors"
                    id="switcher-header-transparent"
                  />
                </div>
              </div>
              <div className="px-4 pb-3 text-muted fs-11">
                Note:If you want to change color Header dynamically change from
                below Theme Primary color picker
              </div>
            </div>
            <div className="theme-colors">
              <p className="switcher-style-head">Theme Primary:</p>
              <div className="d-flex flex-wrap align-items-center switcher-style">
                <div className="form-check switch-select me-3">
                  <input
                    className="form-check-input color-input color-primary-1"
                    type="radio"
                    name="theme-primary"
                    id="switcher-primary"
                  />
                </div>
                <div className="form-check switch-select me-3">
                  <input
                    className="form-check-input color-input color-primary-2"
                    type="radio"
                    name="theme-primary"
                    id="switcher-primary1"
                  />
                </div>
                <div className="form-check switch-select me-3">
                  <input
                    className="form-check-input color-input color-primary-3"
                    type="radio"
                    name="theme-primary"
                    id="switcher-primary2"
                  />
                </div>
                <div className="form-check switch-select me-3">
                  <input
                    className="form-check-input color-input color-primary-4"
                    type="radio"
                    name="theme-primary"
                    id="switcher-primary3"
                  />
                </div>
                <div className="form-check switch-select me-3">
                  <input
                    className="form-check-input color-input color-primary-5"
                    type="radio"
                    name="theme-primary"
                    id="switcher-primary4"
                  />
                </div>
                <div className="form-check switch-select ps-0 mt-1 color-primary-light">
                  <div className="theme-container-primary"></div>
                  <div className="pickr-container-primary"></div>
                </div>
              </div>
            </div>
            <div className="theme-colors">
              <p className="switcher-style-head">Theme Background:</p>
              <div className="d-flex flex-wrap align-items-center switcher-style">
                <div className="form-check switch-select me-3">
                  <input
                    className="form-check-input color-input color-bg-1"
                    type="radio"
                    name="theme-background"
                    id="switcher-background"
                  />
                </div>
                <div className="form-check switch-select me-3">
                  <input
                    className="form-check-input color-input color-bg-2"
                    type="radio"
                    name="theme-background"
                    id="switcher-background1"
                  />
                </div>
                <div className="form-check switch-select me-3">
                  <input
                    className="form-check-input color-input color-bg-3"
                    type="radio"
                    name="theme-background"
                    id="switcher-background2"
                  />
                </div>
                <div className="form-check switch-select me-3">
                  <input
                    className="form-check-input color-input color-bg-4"
                    type="radio"
                    name="theme-background"
                    id="switcher-background3"
                  />
                </div>
                <div className="form-check switch-select me-3">
                  <input
                    className="form-check-input color-input color-bg-5"
                    type="radio"
                    name="theme-background"
                    id="switcher-background4"
                  />
                </div>
                <div className="form-check switch-select ps-0 mt-1 tooltip-static-demo color-bg-transparent">
                  <div className="theme-container-background"></div>
                  <div className="pickr-container-background"></div>
                </div>
              </div>
            </div>
            <div className="menu-image mb-3">
              <p className="switcher-style-head">Menu With Background Image:</p>
              <div className="d-flex flex-wrap align-items-center switcher-style">
                <div className="form-check switch-select m-2">
                  <input
                    className="form-check-input bgimage-input bg-img1"
                    type="radio"
                    name="theme-background"
                    id="switcher-bg-img"
                  />
                </div>
                <div className="form-check switch-select m-2">
                  <input
                    className="form-check-input bgimage-input bg-img2"
                    type="radio"
                    name="theme-background"
                    id="switcher-bg-img1"
                  />
                </div>
                <div className="form-check switch-select m-2">
                  <input
                    className="form-check-input bgimage-input bg-img3"
                    type="radio"
                    name="theme-background"
                    id="switcher-bg-img2"
                  />
                </div>
                <div className="form-check switch-select m-2">
                  <input
                    className="form-check-input bgimage-input bg-img4"
                    type="radio"
                    name="theme-background"
                    id="switcher-bg-img3"
                  />
                </div>
                <div className="form-check switch-select m-2">
                  <input
                    className="form-check-input bgimage-input bg-img5"
                    type="radio"
                    name="theme-background"
                    id="switcher-bg-img4"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Offcanvas;
