import { jsPDF } from "jspdf";
import "jspdf-autotable"; // Importer le plugin autoTable
import PropTypes from "prop-types";

const ExportToPDFButton = ({ tableId }) => {
  const exportToPDF = () => {
    // Sélectionner la table HTML par son ID
    const table = document.getElementById(tableId);

    if (!table) {
      alert("Tableau non trouvé !");
      console.error("La table avec l'ID spécifié n'existe pas.");
      return;
    }

    // Créer un nouveau document PDF en mode paysage
    const doc = new jsPDF("landscape");

    // Utiliser autoTable pour ajouter le contenu de la table HTML dans le PDF
    doc.autoTable({
      html: `#${tableId}`, // Cibler la table par son ID
      startY: 20, // Positionner la table au bas de la première page
      theme: "grid", // Utiliser un thème de grille
      headStyles: { fillColor: [22, 160, 133] }, // Personnaliser l'apparence des en-têtes
    });

    // Enregistrer le PDF avec un nom de fichier
    doc.save("tableau.pdf");
  };

  return (
    <button className="btn btn-danger" onClick={exportToPDF}>
      Exporter vers PDF
    </button>
  );
};

// Définition des PropTypes
ExportToPDFButton.propTypes = {
  tableId: PropTypes.string.isRequired, // tableId doit être une chaîne de caractères et est requis
};

export default ExportToPDFButton;
