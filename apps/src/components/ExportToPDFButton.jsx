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
    
    const mainTitle = "Brouillard de caisse";
    const reportDate = new Date().toLocaleDateString("fr-FR");
    const companyName = user?.company?.name || "Mon Entreprise"; // Correction de companyName -> name

    doc.autoTable({
      html: `#${tableId}`,
      startY: 30,
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
        // MODIFICATION N°1 : Bordures plus fines et couleur plus douce
        lineWidth: 0.1,
        lineColor: [220, 220, 220], 
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
        halign: 'center',
      },
      // MODIFICATION N°2 : Couleur de ligne alternée plus subtile
      alternateRowStyles: {
        fillColor: [239, 247, 254], // Un bleu très clair au lieu du gris
      },
      columnStyles: {
        0: { 
          valign: 'middle', 
          halign: 'center',
        },
      },
      didParseCell: (data) => {
        if (data.section === 'body') {
          const cellText = data.cell.text[0];
          if (typeof cellText === 'string' && /\d/.test(cellText)) {
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