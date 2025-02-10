import TopBar from "../components/TopBar";
import Offcanvas from "./Offcanvas";

const AuthHeader = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const handleFullOverlay = () => {
    //setOverlay(value);
  };
  return (
    <div>
      <Offcanvas />
      <header className="app-header tw-bg-transparent tw-border-b-0 tw-z-40">
        <div className="main-header-container container-fluid">
          <div className="header-content-left"></div>

          <div className="header-content-right">
            <div className="header-element header-search d-lg-none d-block"></div>

            <div className="header-element header-theme-mode tw-mr-24">
              {/* <div
              className={`header-element header-theme-mode ${user?.id} ? 'tw-mr-24' : 'tw-mr-0'`}
            > */}
              {/* <a
                href="#"
                className="header-link layout-setting"
              >
                <span className="light-layout">
                  <i className="bx bx-moon fe-moon header-link-icon"></i>
                </span>
                <span className="dark-layout">
                  <i className="bx bx-sun header-link-icon"></i>
                </span>
              </a> */}
            </div>

            <div className="-tw-mt-3">
              {user?.id && <TopBar fullOverlay={handleFullOverlay} />}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default AuthHeader;
