import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ProgressBar() {
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Crée un intervalle pour augmenter la progression de 0 à 100 en 3 minutes (180 secondes)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 100) {
          return prev + 100 / 180; // Chaque intervalle augmente de 100/180 pour 180 secondes
        } else {
          clearInterval(interval); // Nettoyer l'intervalle une fois qu'on atteint 100%
          return 100;
        }
      });
    }, 1000); // Met à jour toutes les secondes

    // Redirection après 3 minutes
    setTimeout(() => {
      // Ajoute l'ID de la thematique dans le localStorage
      localStorage.setItem("cohorteId", "ID_DE_LA_COORTE"); // Remplacez par l'ID réel
      navigate("/test"); // Redirige vers la route /test
    }, 180000); // 180000 ms = 3 minutes

    // Cleanup si le composant est démonté avant la fin
    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="progress-bar-container">
      <div className="progress" style={{ width: `${progress}%` }} />
      <p className="progress-text">{Math.round(progress)}% Chargé...</p>
    </div>
  );
}

export default ProgressBar;
