import jsPDF from "jspdf";
import axios from "axios";

const generateServiceTicketPDF = async (ticketNo) => {
  const doc = new jsPDF();
  const imgUrl = "/image_black.png";
  const imgWidth = 35;
  const imgHeight = 35;

  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/ticket-details/${ticketNo}`
    );
    const ticket = response.data;

    const imageResponse = await fetch(imgUrl);
    if (!imageResponse.ok) {
      throw new Error("Network response for image was not ok");
    }
    const imageBlob = await imageResponse.blob();
    const reader = new FileReader();

    reader.onloadend = () => {
      const imgData = reader.result;
      doc.addImage(
        imgData,
        "PNG",
        10,
        4,
        imgWidth,
        imgHeight,
        undefined,
        "FAST"
      );

      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("Service Ticket", 140, 20);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`#${ticket.ticketId || "N/A"}`, 140, 30); // Fallback value

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Ticket Owner:", 10, 50);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(ticket.name || "N/A", 42, 49.5); // Fallback value
      doc.text(`Contact No: ${ticket.contactNumber || "N/A"}`, 10, 58); // Fallback value
      doc.text(`Email: ${ticket.email || "N/A"}`, 10, 64); // Fallback value

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Ticket Assigned to:", 140, 50);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(ticket.assignedTo || "N/A", 156, 57.5); // Fallback value

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Company Name:", 10, 75);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(ticket.companyName || "N/A", 10, 83); // Fallback value

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Created on:", 140, 70);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      const createdDate = new Date(ticket.date); // Change 'createdDate' to 'date'
      const formattedCreatedDate = isNaN(createdDate)
        ? "N/A"
        : createdDate.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
      doc.text(formattedCreatedDate, 165, 70); // Use the formatted date

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Closed on:", 140, 80);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(ticket.closedDate || "NA", 165, 80); // Fallback value

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Turnaround Time (TAT):", 140, 90);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(ticket.turnaroundTime || "N/A", 190, 90); // Fallback value

      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(13, 110, 200, 110);

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Issue Category", 20, 130);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(ticket.issueCategory || "N/A", 100, 130); // Fallback value

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Issue Description", 20, 140);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(ticket.issueDescription || "N/A", 100, 140); // Fallback value

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Resolution", 20, 150);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(ticket.resolution || "N/A", 100, 150); // Fallback value

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Preventive Action", 20, 160);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(ticket.preventiveAction || "N/A", 100, 160); // Fallback value

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Warranty Category", 20, 170);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(ticket.warrantyCategory || "N/A", 100, 170); // Fallback value

      // Ticket Status section with colored dot
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Ticket Status", 20, 180);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const status = ticket.status || "N/A";
      const dotX = 105; // X position for the dot
      const dotY = 180; // Y position for the dot
      const dotRadius = 2; // Adjusted radius for smaller dot

      // Set color based on status
      if (status.toLowerCase() === "open") {
        doc.setFillColor(87, 204, 32); // Green for open
      } else if (status.toLowerCase() === "closed") {
        doc.setFillColor(255, 0, 0); // Red for closed
      } else {
        doc.setFillColor(0, 0, 0); // Default black if unknown
      }

      // Draw the dot
      doc.circle(dotX - dotRadius - 1, dotY - 1, dotRadius, "F"); // 'F' for fill
      doc.setTextColor(0, 0, 0); // Reset text color to black
      doc.text(` ${status}`, dotX, dotY); // Position the text next to the dot

      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(13, 270, 200, 270);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(
        "This is a system-generated service report. Manual signing is not required.",
        50,
        280
      );

      const pdfBlob = doc.output("blob");
      const url = URL.createObjectURL(pdfBlob);
      window.open(url);

      const a = document.createElement("a");
      a.href = url;
      a.download = "ticket.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    reader.readAsDataURL(imageBlob);
  } catch (error) {
    console.error("Error fetching data or generating PDF:", error);
  }
};

export default generateServiceTicketPDF;
