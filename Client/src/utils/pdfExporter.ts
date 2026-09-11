import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { TransactionOverview, VendorFinancialItem } from "../services/adminTransaction.service";

/**
 * Export Admin Transactions & Vendor Revenue Report as PDF
 */
export const downloadTransactionsPDF = (
  overview: TransactionOverview,
  vendors: VendorFinancialItem[]
) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const currentDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Header Title & Branding
  doc.setFillColor(22, 101, 52); // SaveBite Green (#166534)
  doc.rect(0, 0, 210, 24, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("SaveBite - Financial Transactions & Vendor Report", 14, 15);

  // Report Date & Subtitle
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Generated on: ${currentDate}`, 14, 31);
  doc.text("Official Platform Financial Statement", 145, 31);

  // Draw Horizontal Separator Line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 34, 196, 34);

  // Financial Summary Cards Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 38, 182, 32, 3, 3, "F");

  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Platform Summary Overview", 20, 46);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);

  // Column 1: Gross Sales & Admin Earned
  doc.text(`Total Gross Sales:`, 20, 54);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`Rs. ${overview.totalGrossSales.toLocaleString("en-IN")}`, 58, 54);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(`Admin Commission:`, 20, 62);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(22, 101, 52); // Highlighted Admin Green
  doc.text(`Rs. ${overview.totalAdminCommission.toLocaleString("en-IN")}`, 58, 62);

  // Column 2: Vendor Earnings & Transactions
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(`Vendor Net Earnings:`, 110, 54);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(29, 78, 216); // Vendor Blue
  doc.text(`Rs. ${overview.totalVendorEarnings.toLocaleString("en-IN")}`, 150, 54);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(`Total Paid Orders:`, 110, 62);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`${overview.totalTransactions}`, 150, 62);

  // Section Header: Amount Received Per Vendor
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text("Amount Received Per Vendor", 14, 78);

  // Table Data Preparation
  const tableRows = vendors.map((v) => [
    v.hotelName || "N/A",
    v.place || "N/A",
    v.businessType || "Restaurant",
    v.totalOrders.toString(),
    `Rs. ${v.grossSales.toLocaleString("en-IN")}`,
    `Rs. ${v.adminCommission.toLocaleString("en-IN")}`,
    `Rs. ${v.vendorNetPayout.toLocaleString("en-IN")}`,
  ]);

  autoTable(doc, {
    startY: 82,
    head: [
      [
        "Hotel / Vendor Name",
        "Place",
        "Type",
        "Orders",
        "Gross Sales",
        "Admin Cut (10%)",
        "Vendor Share (90%)",
      ],
    ],
    body: tableRows,
    theme: "striped",
    headStyles: {
      fillColor: [22, 101, 52],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      3: { halign: "center" },
      4: { halign: "right" },
      5: { halign: "right", fontStyle: "bold", textColor: [22, 101, 52] },
      6: { halign: "right", fontStyle: "bold", textColor: [29, 78, 216] },
    },
    foot: [
      [
        "TOTAL (Current Page)",
        "",
        "",
        vendors.reduce((acc, curr) => acc + curr.totalOrders, 0).toString(),
        `Rs. ${vendors.reduce((acc, curr) => acc + curr.grossSales, 0).toLocaleString("en-IN")}`,
        `Rs. ${vendors.reduce((acc, curr) => acc + curr.adminCommission, 0).toLocaleString("en-IN")}`,
        `Rs. ${vendors.reduce((acc, curr) => acc + curr.vendorNetPayout, 0).toLocaleString("en-IN")}`,
      ],
    ],
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: "bold",
      fontSize: 9,
    },
  });

  // Footer Signature & Page Number
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`SaveBite Admin Audit Report • Page ${i} of ${pageCount}`, 14, 287);
  }

  doc.save(`SaveBite_Financial_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
};

/**
 * Export Admin Orders List as PDF
 */
export const downloadOrdersPDF = (orders: any[], currentTabLabel: string = "All Orders") => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const currentDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Header Title & Branding
  doc.setFillColor(22, 101, 52); // SaveBite Green (#166534)
  doc.rect(0, 0, 297, 24, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(`SaveBite - Orders & Escrow Audit Report (${currentTabLabel})`, 14, 15);

  // Subtitle
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Generated on: ${currentDate}`, 14, 31);
  doc.text(`Total Records Exported: ${orders.length}`, 230, 31);

  // Draw Horizontal Line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 34, 283, 34);

  // Table Data Preparation
  const tableRows = orders.map((order) => [
    order.pickupCode ? `#${order.pickupCode}` : order._id?.slice(-6) || "N/A",
    order.customerId?.name || "Customer",
    order.hotelId?.hotelName || "Hotel",
    `Rs. ${(order.totalAmount || 0).toFixed(2)}`,
    `Rs. ${(order.platformCommissionAmount || 0).toFixed(2)}`,
    `Rs. ${(order.vendorAmount || 0).toFixed(2)}`,
    (order.orderStatus || "").replace("_", " ").toUpperCase(),
    order.settlementStatus || "PENDING",
    new Date(order.createdAt).toLocaleDateString("en-IN"),
  ]);

  autoTable(doc, {
    startY: 38,
    head: [
      [
        "Order / Pickup Code",
        "Customer Name",
        "Hotel Name",
        "Total Amount",
        "Admin Cut",
        "Vendor Escrow",
        "Order Status",
        "Settlement",
        "Date",
      ],
    ],
    body: tableRows,
    theme: "striped",
    headStyles: {
      fillColor: [22, 101, 52],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      3: { halign: "right", fontStyle: "bold" },
      4: { halign: "right", fontStyle: "bold", textColor: [22, 101, 52] },
      5: { halign: "right", fontStyle: "bold", textColor: [29, 78, 216] },
      6: { halign: "center" },
      7: { halign: "center" },
    },
  });

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`SaveBite Orders Audit Report • Page ${i} of ${pageCount}`, 14, 200);
  }

  doc.save(`SaveBite_Orders_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
};
