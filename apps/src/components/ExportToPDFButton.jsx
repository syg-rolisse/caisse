import { jsPDF } from "jspdf";
import "jspdf-autotable";
import PropTypes from "prop-types";
import { FileText } from "lucide-react";

const ExportToPDFButton = ({ tableId, fileNamePrefix = "brouillard_de_caisse" }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  
  const exportToPDF = () => {
    const table = document.getElementById(tableId);
    if (!table) {
      console.error(`La table avec l'ID #${tableId} n'a pas été trouvée.`);
      alert("Erreur : Le tableau à exporter est introuvable.");
      return;
    }

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    doc.setFont("helvetica", "bold");
    
    // CORRECTION N°1 : Mise à jour du titre du document
    const mainTitle = "Brouillard de caisse";
    const reportDate = new Date().toLocaleDateString("fr-FR");
    const companyName = user?.company?.companyName || "Mon Entreprise";

    doc.autoTable({
      html: `#${tableId}`,
      startY: 30,
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
        halign: 'center',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      // CORRECTION N°2 : Centrer verticalement le contenu de la première colonne
      columnStyles: {
        0: { // Cible la première colonne (index 0)
          valign: 'middle', 
          halign: 'center',
        },
      },
      // CORRECTION N°3 : Nettoyer les données des cellules pour éviter les erreurs de formatage
      // Ce hook est appelé pour chaque cellule avant qu'elle ne soit dessinée
      didParseCell: (data) => {
        // On s'assure de travailler sur les cellules du corps du tableau
        if (data.section === 'body') {
          const cellText = data.cell.text[0]; // On récupère le texte de la cellule
          
          // Si le texte est une chaîne et contient un chiffre
          // (pour ne pas affecter les textes qui ne sont pas des nombres)
          if (typeof cellText === 'string' && /\d/.test(cellText)) {
            // On supprime les espaces et les slashs qui pourraient être mal interprétés
            // "11 000" -> "11000", "11/000" -> "11000"
            data.cell.text[0] = cellText.replace(/[\s/]/g, '');
          }
        }
      },
      didDrawPage: (data) => {
        doc.setFontSize(16);
        doc.setTextColor(40);
        doc.text(mainTitle, data.settings.margin.left, 20);

        doc.setFontSize(10);
        doc.text(`Date: ${reportDate}`, doc.internal.pageSize.getWidth() - data.settings.margin.right, 20, { align: "right" });
        
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.text(companyName, data.settings.margin.left, doc.internal.pageSize.getHeight() - 10);
        doc.text(`Page ${data.pageNumber} sur ${pageCount}`, doc.internal.pageSize.getWidth() - data.settings.margin.right, doc.internal.pageSize.getHeight() - 10, { align: "right" });
      },
    });

    const formattedDate = new Date().toISOString().split('T')[0];
    const fileName = `${fileNamePrefix}_${formattedDate}.pdf`;

    doc.save(fileName);
  };

  return (
    <button className="btn btn-danger d-flex align-items-center gap-2" onClick={exportToPDF}>
      <FileText size={16} />
      Exporter en PDF
    </button>
  );
};

ExportToPDFButton.propTypes = {
  tableId: PropTypes.string.isRequired,
  fileNamePrefix: PropTypes.string,
};

export default ExportToPDFButton;