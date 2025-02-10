import TopBar from "../components/TopBar";

const Header = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div>
      <header className="app-header">
        <div className="main-header-container container-fluid">
          <div className="header-content-left">
            <div className="header-element">
              <a
                aria-label="Hide Sidebar"
                className="sidemenu-toggle header-link animated-arrow hor-toggle horizontal-navtoggle mx-0"
                data-bs-toggle="sidebar"
                href="#"
              >
                <span></span>
              </a>
            </div>

            <div className="header-element header-search  tw-rounded-lg ">
              <div className="tw-flex tw-items-center tw-justify-center tw-ml-4">
                <span className="tw-inline-block tw-w-3 tw-h-3 tw-bg-green-600 tw-rounded-full tw-mr-2"></span>
                <span className="tw-text-green-600 tw-font-semibold tw-text-sm">
                  en ligne
                </span>
                <span className="tw-text-gray-800 tw-font-semibold tw-text-sm tw-ml-2">
                  {user?.fullName}
                </span>
              </div>
            </div>
          </div>

          <div className="header-content-right">
           

            <div className="header-element header-theme-mode">
              <a href="#" className="header-link layout-setting">
                <span className="light-layout">
                  <i className="bx bx-moon fe-moon header-link-icon"></i>
                </span>
                <span className="dark-layout">
                  <i className="bx bx-sun header-link-icon"></i>
                </span>
              </a>
            </div>

            <div className="header-element header-fullscreen">
              <a href="#" className="header-link">
                <i className="bx bx-fullscreen full-screen-open header-link-icon"></i>
                <i className="bx bx-exit-fullscreen full-screen-close header-link-icon d-none"></i>
              </a>
            </div>

            <div className="header-element meassage-dropdown">
              <a
                href="#"
                className="header-link dropdown-toggle"
                data-bs-auto-close="outside"
                data-bs-toggle="dropdown"
              >
                <i className="bx bx-message-square-dots header-link-icon"></i>
                <span className="pulse-danger"></span>
              </a>
            </div>

            <div className="header-element notifications-dropdown">
              <a
                href="#"
                className="header-link dropdown-toggle"
                data-bs-auto-close="outside"
                data-bs-toggle="dropdown"
              >
                <i className="bx bx-bell header-link-icon"></i>
                <span
                  className="badge bg-secondary fw-normal rounded-pill cart-badge"
                  id="notifiation-data"
                >
                  5
                </span>
              </a>
            </div>

          

            <div className="header-element d-none d-sm-block">
              <a
                href="#"
                className="header-link"
                data-bs-toggle="offcanvas"
                data-bs-target="#offcanvassidebar"
              >
                <i className="bx bx-grid-alt header-link-icon"></i>
              </a>
            </div>

            <div className="header-element tw-mr-24">
              <a
                href="#"
                className="header-link me-0"
                data-bs-toggle="offcanvas"
                data-bs-target="#switcher-canvas"
              >
                <i className="bx bx-cog header-link-icon"></i>
              </a>
            </div>

            <div className="-tw-mt-3">{user?.id && <TopBar />}</div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
