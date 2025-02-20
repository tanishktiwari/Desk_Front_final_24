import jsPDF from 'jspdf';
import axios from 'axios';

const formatDate = (dateStr) => {
    return dateStr;
};

const splitTextToFit = (doc, text, maxWidth) => {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];
    let wordCount = 1;

    // If total words exceed 40, truncate with ellipsis
    if (words.length > 30) {
        words.length = 30;
        words.push('...');
    }

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = doc.getStringUnitWidth(currentLine + ' ' + word) * doc.getFontSize() / doc.internal.scaleFactor;
        
        if (width < maxWidth) {
            currentLine += ' ' + word;
            wordCount++;
        } else {
            lines.push(currentLine);
            currentLine = word;
            wordCount++;
        }
    }
    lines.push(currentLine);
    return lines;
};

const generateServiceTicketPDF = async (ticketNo) => {
    const doc = new jsPDF();
    const imgUrl = '/pdflogo.png';
    const imgWidth = 50;
    const imgHeight = 20;

    try {
        const [ticketResponse, companiesResponse] = await Promise.all([
            axios.get(`${import.meta.env.VITE_API_URL}/ticket-details/${ticketNo}`),
            axios.get(`${import.meta.env.VITE_API_URL}/companies`)
        ]);
        
        const ticket = ticketResponse.data;
        const companies = companiesResponse.data;
        
        // Find the matching company
        const selectedCompany = companies.find(company => company.name === ticket.companyName) || {
            name: ticket.companyName,
            gst: '',
            address: ''
        };

        const imageResponse = await fetch(imgUrl);
        if (!imageResponse.ok) {
            throw new Error('Network response for image was not ok');
        }
        const imageBlob = await imageResponse.blob();
        const reader = new FileReader();

        reader.onloadend = () => {
            const imgData = reader.result;
            
            // Add logo to the top right
            doc.addImage(imgData, 'PNG', 160, 4, imgWidth, imgHeight, undefined, 'FAST');

            // Header Section
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text('Service Ticket', 10, 20);

            // Ticket Details
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            
            const detailsY = 40; // Starting Y position for the details section

            // Add Ticket Number
            doc.text('Ticket No:', 10, detailsY);
            doc.setFont('helvetica', 'normal');
            doc.text(ticket.ticketId || '', 85, detailsY);

            // Rest of the ticket details with reduced spacing
            doc.setFont('helvetica', 'bold');
            doc.text('Ticket Assigned to:', 10, detailsY + 10);
            doc.setFont('helvetica', 'normal');
            doc.text(ticket.engineerName || '', 85, detailsY + 10);

            doc.setFont('helvetica', 'bold');
            doc.text('Created on:', 10, detailsY + 20);
            doc.setFont('helvetica', 'normal');
            doc.text(`${ticket.date}` || '', 85, detailsY + 20);

            doc.setFont('helvetica', 'bold');
            doc.text('Closed on:', 10, detailsY + 30);
            doc.setFont('helvetica', 'normal');
            doc.text(ticket.closeDate || '', 85, detailsY + 30);

            doc.setFont('helvetica', 'bold');
            doc.text('Turnaround Time (TAT):', 10, detailsY + 40);
            doc.setFont('helvetica', 'normal');
            const tatText = ticket.eta.exceeds24Hours ? 
                `${ticket.eta.totalDays} days` : 
                '0 days';
            doc.text(tatText, 85, detailsY + 40);

            // Draw line after header section
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.5);
            doc.line(10, detailsY + 50, 200, detailsY + 50);

            // Company Details Section
            const companyY = detailsY + 60;
            
            // Ticket By section
            doc.setFont('helvetica', 'bold');
            doc.text('Ticket By:', 10, companyY);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            
            const ticketByAddress = [
                'Foxnet Securitas Pvt Ltd.',
                'Office 16, Plot No. 14, SMG-1,',
                'Ghaziabad, Uttar Pradesh, 201005',
                'GSTIN: 09AADCF6548G1ZF',
                'PAN: AADCF6548G'
            ];
            
            ticketByAddress.forEach((line, index) => {
                doc.text(line, 10, companyY + 10 + (index * 7));
            });

            // Ticket To section
            doc.setFont('helvetica', 'bold');
            doc.text('Ticket To:', 110, companyY);
            doc.setFont('helvetica', 'normal');
            
            // Format company address
            const ticketToAddress = [
                selectedCompany.name,
                selectedCompany.address,
                `GSTIN: ${selectedCompany.gst === 'test' ? '---' : (selectedCompany.gst || '---')}`
            ].filter(Boolean);
            
            ticketToAddress.forEach((line, index) => {
                doc.text(line, 110, companyY + 10 + (index * 7));
            });

            // Issue Details Table
            const tableY = companyY + 60;
            const tableWidth = 190;
            const columns = 5;
            const columnWidth = tableWidth / columns;
            const cellPadding = 2;

            // Table Headers
            const headers = ['Issue Category', 'Issue Description', 'Preventive Action', 'Warranty Category', 'Ticket Status'];
            
            // Prepare data
            const rowData = [
                ticket.issueCategory || '',
                ticket.issueDescription || '',
                ticket.preventiveAction || '',
                ticket.warrantyCategory || '',
                ticket.status || ''
            ];

            // Calculate wrapped text and maximum lines needed
            let maxLines = 1;
            const wrappedTexts = rowData.map((text, index) => {
                const maxWidth = columnWidth - (cellPadding * 2);
                const lines = splitTextToFit(doc, text, maxWidth);
                maxLines = Math.max(maxLines, lines.length);
                return lines;
            });

            // Calculate table dimensions
            const lineHeight = 7;
            const headerHeight = 10;
            const contentHeight = (maxLines * lineHeight) + 5; // 5px padding
            const tableHeight = headerHeight + contentHeight;

            // Draw header background
            doc.setFillColor(0, 0, 0);
            doc.rect(10, tableY, tableWidth, headerHeight, 'F');

            // Draw table outline
            doc.setDrawColor(0);
            doc.setLineWidth(0.2);
            doc.rect(10, tableY, tableWidth, tableHeight);

            // Draw vertical separators
            for (let i = 1; i < columns; i++) {
                const x = 10 + (i * columnWidth);
                doc.line(x, tableY, x, tableY + tableHeight);
            }

            // Draw horizontal separator between header and content
            doc.line(10, tableY + headerHeight, 200, tableY + headerHeight);

            // Add headers with white text
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(10);
            headers.forEach((header, index) => {
                const x = 10 + (index * columnWidth) + cellPadding;
                const textWidth = doc.getStringUnitWidth(header) * doc.getFontSize() / doc.internal.scaleFactor;
                const centerX = x + (columnWidth - textWidth - cellPadding * 2) / 2;
                doc.text(header, centerX, tableY + 7);
            });

            // Add wrapped content
            doc.setTextColor(0);
            wrappedTexts.forEach((lines, columnIndex) => {
                const x = 10 + (columnIndex * columnWidth) + cellPadding;
                lines.forEach((line, lineIndex) => {
                    const y = tableY + headerHeight + 7 + (lineIndex * lineHeight);
                    doc.text(line, x, y);
                });
            });

            // Resolution Section with truncation
            const resolutionY = tableY + tableHeight + 15;
            doc.setFont('helvetica', 'bold');
            doc.text('Resolution:', 12, resolutionY);
            doc.setFont('helvetica', 'normal');

            // Handle resolution text wrapping with truncation
            const resolutionLines = splitTextToFit(doc, ticket.resolution || '', 180);
            resolutionLines.forEach((line, index) => {
                doc.text(line, 12, resolutionY + 10 + (index * lineHeight));
            });

            // Footer
            const footerY = Math.max(280, resolutionY + (resolutionLines.length * lineHeight) + 30);
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text('This is a system-generated service report. Manual signing is not required.', 50, footerY);

            // Generate and download PDF
            const pdfBlob = doc.output('blob');
            const url = URL.createObjectURL(pdfBlob);
            window.open(url);

            const a = document.createElement('a');
            a.href = url;
            a.download = `service_ticket_${ticketNo}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };

        reader.readAsDataURL(imageBlob);
    } catch (error) {
        console.error('Error generating service ticket PDF:', error);
    }
};

export default generateServiceTicketPDF;