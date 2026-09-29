import PDFDocument from "pdfkit-table";
import { Response } from "express";

export const generateTransactionsPDF = (
  res: Response,
  overview: any,
  vendors: any[]
) => {
  const doc = new PDFDocument({ margin: 30, size: "A4" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=SaveBite_Financial_Report_${new Date().toISOString().slice(0, 10)}.pdf`
  );

  doc.pipe(res);

  // Title
  doc.fontSize(20).text("SaveBite - Financial Transactions Report", { align: "center" });
  doc.moveDown();

  // Overview section
  doc.fontSize(14).text("Financial Overview", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12).text(`Total Gross Sales: Rs. ${overview.totalGrossSales.toLocaleString("en-IN")}`);
  doc.text(`Admin Commission: Rs. ${overview.totalAdminCommission.toLocaleString("en-IN")}`);
  doc.text(`Vendor Net Earnings: Rs. ${overview.totalVendorEarnings.toLocaleString("en-IN")}`);
  doc.text(`Successful Transactions: ${overview.totalTransactions}`);
  doc.moveDown(2);

  // Vendor Table
  const tableRows = vendors.map((v) => [
    v.hotelName || "N/A",
    v.place || "N/A",
    v.businessType || "N/A",
    String(v.totalOrders),
    `Rs. ${v.grossSales.toLocaleString("en-IN")}`,
    `Rs. ${v.adminCommission.toLocaleString("en-IN")}`,
    `Rs. ${v.vendorNetPayout.toLocaleString("en-IN")}`,
  ]);

  const table = {
    title: "Amount Received Per Vendor",
    headers: [
      "Vendor Name",
      "Location",
      "Type",
      "Orders",
      "Gross Sales",
      "Admin Earned",
      "Net Payout",
    ],
    rows: tableRows,
  };

  doc.table(table, {
    prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
    prepareRow: () => doc.font("Helvetica").fontSize(9),
  });

  doc.end();
};
