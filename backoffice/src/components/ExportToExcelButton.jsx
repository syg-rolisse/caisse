import PropTypes from "prop-types";
import * as XLSX from "xlsx";

const ExportToExcelButton = ({ tableId }) => {
  const exportToExcel = () => {
    const table = document.getElementById(tableId);
    if (!table) {
      alert("Tableau non trouvé !");
      return;
    }
    const ws = XLSX.utils.table_to_sheet(table);

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Feuille1");

    const currentDate = new Date().toISOString().split("T")[0];

    const fileName = `brouillard_de_caisse_${currentDate}.xlsx`;

    XLSX.writeFile(wb, fileName);
  };

  return (
    <button
      className="btn btn-success d-flex align-items-center tw-font-semibold"
      onClick={exportToExcel}
    >
      <i className="ri-file-excel-line tw-mr-1"></i>
      Exporter vers Excel
    </button>
  );
};

ExportToExcelButton.propTypes = {
  tableId: PropTypes.string.isRequired,
};

export default ExportToExcelButton;
