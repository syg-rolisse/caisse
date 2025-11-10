// src/utils/downloadDepense.js

import jsPDF from 'jspdf';
import 'jspdf-autotable'; 

const FONT_NORMAL = 'Quicksand';
const FONT_BOLD = 'Quicksand-Bold'; 

/**
 * Fonction centrale pour dessiner une fiche de dépense sur un document PDF.
 * (Mise en page latérale pour maximiser deux fiches sur A5)
 */
export const drawDepenseFiche = (doc, depense, companyInfo, formatDate, yStart) => {
    let y = yStart;
    
    doc.setLineWidth(0.2); 

    const docWidth = doc.internal.pageSize.getWidth(); 
    const endX = docWidth - 10; 
    const centerX = docWidth / 2;

    // Colonnages ajustés (maintenus pour la section supérieure)
    const col1X = 10;
    const col2X = docWidth > 150 ? 65 : 40; 
    const col3X = docWidth > 150 ? 120 : 75; 
    const col3TextOffset = docWidth > 150 ? 45 : 25; 

    const lineSpacing = 4.5;
    
    // Définition des colonnes pour la nouvelle section latérale
    const leftBlockX = 10;
    // Décalage du bloc droit (Objet Dépense) pour l'éloigner de la barre
    const rightBlockX = docWidth > 150 ? 110 : 80; // Augmenté de 5mm
    const rightBlockWidth = docWidth - rightBlockX - 10;
    const separatorX = docWidth > 150 ? 105 : 75; // Position de la ligne verticale de séparation
    
    // --- EN-TÊTE DE L'ENTREPRISE (PARTIE HAUTE DE LA FICHE) ---
    doc.setFontSize(10);
    doc.setTextColor(50);
    doc.setFont(FONT_BOLD, 'normal'); 
    doc.text(companyInfo.name, 10, y);
    y += 4;
    doc.setFontSize(8);
    doc.setFont(FONT_NORMAL, 'normal'); 
    doc.text(companyInfo.address, 10, y);
    y += 3;
    doc.text(`Tél : ${companyInfo.phone}`, 10, y);
    y += 5;

    // Ligne de séparation de l'en-tête (épaisseur fine)
    doc.line(10, y, endX, y); 
    y += 6;

    // --- TITRE PRINCIPAL ---
    doc.setFontSize(14);
    doc.setTextColor(52, 152, 219);
    doc.setFont(FONT_BOLD, 'normal'); 
    
    const titleText = `FICHE DE DÉPENSE N° ${depense.id}`;
    doc.text(titleText, centerX, y, null, null, 'center');
    y += 8;

    // --- INFORMATIONS CLÉS (Lignes 1 et 2 - conservées sur la largeur) ---
    doc.setFontSize(9);
    doc.setTextColor(0);

    // Ligne 1 : Date et Type de Dépense
    doc.setFont(FONT_BOLD, 'normal'); 
    doc.text('Date de l\'Opération:', col1X, y);
    doc.setFont(FONT_NORMAL, 'normal');
    doc.text(formatDate(depense.dateOperation), col2X, y); 

    doc.setFont(FONT_BOLD, 'normal'); 
    doc.text('Type de Dépense:', col3X, y); 
    doc.setFont(FONT_NORMAL, 'normal');
    doc.text(depense?.typeDeDepense?.wording || 'N/A', col3X + col3TextOffset, y); 
    let yAfterInfo = y + lineSpacing; 
    
    // Ligne de séparation avant les blocs compacts
    doc.line(10, yAfterInfo, endX, yAfterInfo); 
    yAfterInfo += 4; // Nouvel espace Y de départ pour les blocs gauche/droite

    // On utilise la nouvelle position Y
    let yBlock = yAfterInfo;
    const initialYBlock = yBlock;


    // =========================================================================
    // BLOC GAUCHE : MONTANT et EFFECTUÉ PAR
    // =========================================================================
    // const leftBlockWidth = docWidth > 150 ? 90 : 60; // Largeur pour le bloc gauche
    const leftTextX = leftBlockX;
    
    // Titre de la section (MAJ : mis en gras)
    doc.setFontSize(10);
    doc.setFont(FONT_BOLD, 'normal');
    doc.text('Détails de l\'opération', leftTextX, yBlock);
    
    // Espace sous le titre (MAJ : Ajout de marge)
    yBlock += 4 + 3; 
    
    // Montant Total
    doc.setFontSize(9);
    doc.setFont(FONT_BOLD, 'normal');
    doc.text('Montant Total:', leftTextX, yBlock); 
    doc.setTextColor(0, 0, 0); 
    
    let formattedAmount = depense.montant.toLocaleString('fr-FR', { 
        useGrouping: true, 
        minimumFractionDigits: 0 
    });
    formattedAmount = formattedAmount.replace(/[\s/.,]/g, ' '); 
    formattedAmount = formattedAmount.replace(/\s+/g, ' ').trim();

    doc.text(`${formattedAmount} CFA`, leftTextX + 25, yBlock); // Décalage pour le montant
    yBlock += lineSpacing; 

    // Effectué par
    doc.setFont(FONT_BOLD, 'normal');
    doc.text('Effectué par:', leftTextX, yBlock); 
    doc.setFont(FONT_NORMAL, 'normal');
    const beneficiaryName = depense?.user?.fullName || 'N/A';
    doc.text(beneficiaryName, leftTextX + 25, yBlock); 
    yBlock += 5;
    
    // Ligne verticale de séparation des blocs (droite du bloc gauche)
    doc.line(separatorX, initialYBlock, separatorX, yBlock + 2); 


    // =========================================================================
    // BLOC DROIT : OBJET DÉPENSE
    // =========================================================================
    let yBlockRight = initialYBlock;
    
    // Titre de la section
    doc.setFontSize(10);
    doc.setFont(FONT_BOLD, 'normal');
    doc.text('Objet Dépense', rightBlockX, yBlockRight); 
    yBlockRight += 4 + 3; // Espace similaire au bloc gauche
    
    doc.setFontSize(9);
    doc.setFont(FONT_NORMAL, 'normal');
    // Le texte prend le reste de la largeur disponible
    const splitWording = doc.splitTextToSize(depense?.wording || 'Non spécifié', rightBlockWidth); 
    doc.text(splitWording, rightBlockX, yBlockRight);
    yBlockRight += (splitWording.length * 3.5); 
    

    // --- Ligne de séparation et SIGNATURES (Reprend sous le bloc le plus bas) ---
    // On prend la position Y la plus basse des deux blocs + un peu de marge
    y = Math.max(yBlock, yBlockRight) + 3;

    doc.line(10, y, endX, y); 
    y += 5;
    doc.setFontSize(10);
    doc.setFont(FONT_BOLD, 'normal'); 
    doc.text('ORDRE DE PAIEMENT & VALIDATION', 10, y);
    y += 8;

    const signatureAreaY = y;
    const signatureLineLength = docWidth > 150 ? 50 : 35;
    const colSpacing = docWidth > 150 ? 65 : 45;

    const drawSignatureBlock = (x, title, info) => {
        doc.setFontSize(8);
        doc.setFont(FONT_BOLD, 'normal'); 
        doc.text(title, x, signatureAreaY);
        doc.setFont(FONT_NORMAL, 'normal');
        doc.text(`Nom: ${info}`, x, signatureAreaY + 4);

        doc.line(x, signatureAreaY + 12, x + signatureLineLength, signatureAreaY + 12);
        doc.setFont(FONT_NORMAL, 'italic'); 
        doc.text('Signature', x + (signatureLineLength / 2) - 5, signatureAreaY + 16);
        doc.setFont(FONT_NORMAL, 'normal');
    };

    drawSignatureBlock(10, 'ORDONNATEUR (Approbation)', '________________');
    drawSignatureBlock(10 + colSpacing, 'CAISSE (Exécution)', '________________');
    drawSignatureBlock(10 + (colSpacing * 2), 'BÉNÉFICIAIRE (Réception)', depense?.user?.fullName || '________________');

    y = signatureAreaY + 20; 

    // --- Conclusion/Pied de page ---
    doc.line(10, y, endX, y); 
    y += 4;
    doc.setFontSize(7);
    doc.setFont(FONT_NORMAL, 'italic'); 
    doc.text(`Fiche générée par: ${companyInfo.userFullName} | Date: ${formatDate(new Date())}`, 10, y);
    doc.text(`https://caisse.oraadvices.com`, endX, y, null, null, 'right'); 
    y += 5;
    
    return y;
};

// Le wrapper pour une seule dépense reste inchangé
export const downloadSingleDepense = (depense, companyInfo, formatDate, paperFormat = 'a5') => {
    const doc = new jsPDF('p', 'mm', paperFormat); 
    drawDepenseFiche(doc, depense, companyInfo, formatDate, 10); 
    const filename = `Fiche_Depense_${depense.id}_${formatDate(depense.createdAt).replace(/\//g, '-')}.pdf`;
    doc.save(filename);
};

/**
 * Wrapper pour télécharger plusieurs fiches sur la même page, séparées par des pointillés.
 * Logique pour deux fiches par page restaurée.
 * @param {string} paperFormat - Format du papier ('a4', 'a5', etc.). Par défaut 'a5'.
 */
export const downloadMultipleDepenses = (depensesList, user, formatDate, paperFormat = 'a5') => {
    if (depensesList.length === 0) return;

    const doc = new jsPDF('p', 'mm', paperFormat);
    const companyInfo = {
        name: user?.company?.companyName || "Mon Entreprise",
        address: user?.company?.address || "Adresse non spécifiée",
        phone: user?.company?.phoneNumber || "Contact non spécifié",
        userFullName: user?.fullName || "Utilisateur inconnu",
    };
    
    let y = 10;
    const margin = 10;
    const pageHeight = doc.internal.pageSize.height;
    const docWidth = doc.internal.pageSize.getWidth();
    const endX = docWidth - 10;

    depensesList.forEach((depense, index) => {
        // Estimation de l'espace requis (la mise en page latérale rend ceci plus fiable)
        const requiredHeightEstimate = 75; 

        // Gestion du saut de page
        if (y + requiredHeightEstimate > pageHeight - margin) {
            doc.addPage();
            y = 10; 
        }

        // Dessiner la fiche
        y = drawDepenseFiche(doc, depense, companyInfo, formatDate, y);

        // Ajouter des pointillés de séparation SI ce n'est pas la dernière fiche
        if (index < depensesList.length - 1) {
            if (y + 10 > pageHeight - margin) {
                doc.addPage();
                y = 10;
            } else {
                // Ligne de pointillés pour séparer les fiches sur la même page
                doc.setLineDash([2, 2], 0); 
                doc.line(10, y, endX, y); 
                doc.setLineDash([], 0); 
                y += 5; // Espacement
            }
        }
    });

    const filename = `Recap_Fiches_Depenses_${formatDate(new Date()).replace(/\//g, '-')}.pdf`;
    doc.save(filename);
};

// Fonction utilitaire pour le format de date
export const simpleFormatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString("fr-FR", {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });
};