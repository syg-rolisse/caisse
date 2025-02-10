import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Aside from "../components/Aside";
import Header from "../components/Header";
import Offcanvas from "../components/Offcanvas";
import Footer from "./Footer";

const MainLayout = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const scripts = [
      "assets/libs/@popperjs/core/umd/popper.min.js",
      "assets/libs/bootstrap/js/bootstrap.bundle.min.js",
      "assets/js/defaultmenu.min.js",
      "assets/libs/node-waves/waves.min.js",
     // "assets/js/sticky.js",
      "assets/libs/simplebar/simplebar.min.js",
      "assets/js/simplebar.js",
      "assets/libs/@simonwep/pickr/pickr.es5.min.js",
      "assets/libs/flatpickr/flatpickr.min.js",
      "assets/js/date-range.js",
      "assets/libs/apexcharts/apexcharts.min.js",
      "assets/js/index3.js",
      "assets/js/custom.js",
    ];

    const loadScriptsSequentially = async () => {
      for (const src of scripts) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = src;
          script.defer = true;
          script.onload = () => resolve();
          script.onerror = () =>
            reject(new Error(`Erreur de chargement : ${src}`));
          document.body.appendChild(script);
        });
      }
      console.log("Tous les scripts ont été chargés.");
    };

    loadScriptsSequentially();

    return () => {
      scripts.forEach((src) => {
        const scriptElement = document.querySelector(`script[src="${src}"]`);
        if (scriptElement) {
          document.body.removeChild(scriptElement);
        }
      });
    };
  }, [location]); // Ajoutez 'location' comme dépendance pour rafraîchir à chaque changement de route

  useEffect(() => {
    setIsLoading(true);

    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  if (isLoading && location.pathname !== "/dashboard") {
    return (
      <div className="loader-overlay">
        <div className="loader-spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <Offcanvas />
      <div className="">
        <Header />
        <Aside />
        <div className="main-content app-content">
          <Outlet />
        </div>
      </div>
      <div className="scrollToTop" id="back-to-top">
        <i className="ri-arrow-up-s-fill fs-20"></i>
      </div>
      <div id="responsive-overlay"></div>
      <Footer />
    </div>
  );
};

export default MainLayout;
