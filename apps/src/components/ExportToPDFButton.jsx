import { jsPDF } from "jspdf";
import "jspdf-autotable";
import PropTypes from "prop-types";
import { FileText } from "lucide-react";

const ExportToPDFButton = ({ tableId, fileNamePrefix = "brouillard_de_caisse" }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  const companyName = user?.company?.companyName || "Mon Entreprise";
  const companyAddress = user?.company?.address || "Adresse non spécifiée";
  const companyPhone = user?.company?.phoneNumber || "Contact non spécifié";
  const userFullName = user?.fullName || "Utilisateur inconnu";

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

    doc.autoTable({
      html: `#${tableId}`,
      startY: 50, // Augmenté pour laisser de la place au nouvel en-tête étendu
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
        // ⭐ MODIFICATION CLÉ : Bordures noires (lineWidth: 0.3 est une bonne épaisseur pour le noir)
        lineWidth: 0.3,
        lineColor: [0, 0, 0], // Noir
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
        halign: 'center',
      },
      alternateRowStyles: {
        fillColor: [239, 247, 254],
      },
      columnStyles: {
        0: { // Type de Dépense
          valign: 'middle', 
          halign: 'left',
        },
        5: { // Montant Dû
          halign: 'center',
        },
        6: { // Total Décaissé
          halign: 'center',
        },
        7: { // Reste à Payer
          halign: 'center',
        },
      },
      
      didParseCell: (data) => {
        const cellText = data.cell.text[0];

        if (data.section === 'foot') {
          // Style général du pied de tableau
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.halign = 'center';
          data.cell.styles.fontSize = 10;
          data.cell.styles.fillColor = [220, 220, 220]; 
          
          // Montants totaux en noir
          if (data.column.index >= 5 && data.column.index <= 7) {
             data.cell.styles.textColor = 0; 
          }

          // Titre "TOTAL" en noir et aligné à gauche
          if (data.column.index === 0) {
            data.cell.styles.halign = 'left';
            data.cell.styles.fontSize = 12; 
            data.cell.styles.textColor = 0; 
            return;
          }
        }

        // Nettoyage des nombres dans le corps du tableau ET le pied
        if (typeof cellText === 'string' && /\d/.test(cellText)) {
          data.cell.text[0] = cellText.replace(/\s/g, '').replace(/\//g, '').trim();
        }
      },
      
      didDrawPage: (data) => {
        const margin = data.settings.margin;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        // ⭐ NOUVELLE PRÉSENTATION DE L'IDENTITÉ DE L'ENTREPRISE
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        
        // Nom de l'entreprise (en gras, grande taille)
        doc.text(companyName, margin.left, 10);
        
        // Détails de contact (taille normale)
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(`Adresse : ${companyAddress}`, margin.left, 15);
        doc.text(`Contact : ${companyPhone}`, margin.left, 20);

        // Ligne de séparation visuelle
        doc.setDrawColor(0, 0, 0); // Noir
        doc.line(margin.left, 25, pageWidth - margin.right, 25);
        
        // 2. Titre principal (Centré, position ajustée)
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(40);
        doc.text(mainTitle, pageWidth / 2, 35, { align: "center" }); 
        
        // 3. Infos sur le rapport (En-tête, à droite)
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Date du rapport : ${reportDate}`, pageWidth - margin.right, 10, { align: "right" });
        doc.text(`Imprimé par : ${userFullName}`, pageWidth - margin.right, 15, { align: "right" });
        
        // 4. Numérotation des pages (Pied de page)
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.text(`Page ${data.pageNumber} sur ${pageCount}`, pageWidth - margin.right, pageHeight - 10, { align: "right" });
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