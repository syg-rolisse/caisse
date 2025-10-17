import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Aside from "../components/Aside";
import Header from "../components/Header";
import Offcanvas from "../components/Offcanvas";
import Footer from "./Footer";

const MainLayout = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);

  const toggleSidebar = () => {
    setSidebarOpen(prevState => !prevState);
  };

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  if (isLoading && location.pathname !== "/dashboard") {
    return (
      <div className="loader-overlay">
        <div className="loader-spinner"></div>
      </div>
    );
  }

  return (
    <div className="tw-bg-gray-50">
      <Offcanvas />
      
      {isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="tw-fixed tw-inset-0 tw-bg-black/50 tw-z-30 lg:tw-hidden"
          aria-hidden="true"
        ></div>
      )}
      
      {/* On passe maintenant toggleSidebar à Aside également */}
      <Aside isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div 
        className={`
          tw-relative tw-min-h-screen
          tw-transition-all tw-duration-300 ease-in-out
          ${isSidebarOpen ? 'lg:tw-ml-64' : 'lg:tw-ml-0'}
        `}
      >
        <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        
        <main className="tw-p-6">
          <Outlet />
        </main>
        
        <Footer />
      </div>

      <div className="scrollToTop" id="back-to-top">
        <i className="ri-arrow-up-s-fill fs-20"></i>
      </div>
      <div id="responsive-overlay"></div>
    </div>
  );
};

export default MainLayout;