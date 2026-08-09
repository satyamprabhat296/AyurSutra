import PDFDocument from "pdfkit";

export const generatePrescriptionPDF = (prescription, res) => {
  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
  });

  res.setHeader("Content-Type", "application/pdf");

  res.setHeader(
    "Content-Disposition",
    `inline; filename=prescription-${prescription._id}.pdf`
  );

  doc.pipe(res);

  // --------------------------------------------------
  // Header
  // --------------------------------------------------

  doc
    .fontSize(22)
    .font("Helvetica-Bold")
    .text("AyurSutra", {
      align: "center",
    });

  doc
    .fontSize(11)
    .font("Helvetica")
    .text("Ayurvedic Panchakarma Clinic", {
      align: "center",
    });

  doc.moveDown();

  doc
    .moveTo(50, doc.y)
    .lineTo(545, doc.y)
    .stroke();

  doc.moveDown();

  // --------------------------------------------------
  // Prescription Information
  // --------------------------------------------------

  doc
    .fontSize(16)
    .font("Helvetica-Bold")
    .text("PRESCRIPTION");

  doc.moveDown(0.5);

  doc
    .fontSize(10)
    .font("Helvetica")
    .text(`Prescription ID: ${prescription._id}`);

  doc.text(
    `Date: ${
      prescription.createdAt
        ? new Date(prescription.createdAt).toLocaleDateString()
        : "-"
    }`
  );

  doc.moveDown();

  // --------------------------------------------------
  // Patient Information
  // --------------------------------------------------

  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("Patient Information");

  doc.moveDown(0.3);

  doc
    .fontSize(10)
    .font("Helvetica")
    .text(
      `Patient ID: ${
        prescription.patient?.patientId || "-"
      }`
    );

  doc.text(
    `Name: ${
      prescription.patient?.fullName || "-"
    }`
  );

  doc.moveDown();

  // --------------------------------------------------
  // Doctor Information
  // --------------------------------------------------

  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("Doctor");

  doc.moveDown(0.3);

  doc
    .fontSize(10)
    .font("Helvetica")
    .text(
      `Dr. ${
        prescription.prescribedBy?.name || "-"
      }`
    );

  doc.moveDown();

  // --------------------------------------------------
  // Medicines
  // --------------------------------------------------

  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("Medicines");

  doc.moveDown(0.5);

  prescription.medicines.forEach((item, index) => {

    const medicineName =
      item.medicine?.medicineName || "Unknown Medicine";

    const medicineCode =
      item.medicine?.medicineCode || "-";

    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .text(
        `${index + 1}. ${medicineName}`
      );

    doc
      .fontSize(9)
      .font("Helvetica")
      .text(
        `Medicine Code: ${medicineCode}`
      );

    doc.text(
      `Dosage: ${item.dosage || "-"}`
    );

    doc.text(
      `Frequency: ${item.frequency || "-"}`
    );

    doc.text(
      `Duration: ${item.duration || "-"}`
    );

    doc.text(
      `Quantity: ${item.quantity || 0}`
    );

    doc.text(
      `Instructions: ${
        item.instructions || "-"
      }`
    );

    doc.moveDown(0.8);
  });

  // --------------------------------------------------
  // Notes
  // --------------------------------------------------

  if (prescription.notes) {

    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Doctor's Notes");

    doc.moveDown(0.3);

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(prescription.notes);

    doc.moveDown();
  }

  // --------------------------------------------------
  // Follow-up
  // --------------------------------------------------

  if (prescription.consultation?.followUpDate) {

    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("Follow-up Date");

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(
        new Date(
          prescription.consultation.followUpDate
        ).toLocaleDateString()
      );

    doc.moveDown();
  }

  // --------------------------------------------------
  // Footer
  // --------------------------------------------------

  doc.moveDown(2);

  doc
    .fontSize(9)
    .font("Helvetica")
    .text(
      "This prescription was generated electronically by AyurSutra.",
      {
        align: "center",
      }
    );

  doc.end();
};
export const generateInvoicePDF = (bill, res) => {
  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
  });

  res.setHeader("Content-Type", "application/pdf");

  res.setHeader(
    "Content-Disposition",
    `inline; filename=invoice-${bill.invoiceNumber}.pdf`
  );

  doc.pipe(res);

  // Header
  doc
    .fontSize(22)
    .font("Helvetica-Bold")
    .text("AyurSutra", {
      align: "center",
    });

  doc
    .fontSize(11)
    .font("Helvetica")
    .text("Ayurvedic Panchakarma Clinic", {
      align: "center",
    });

  doc.moveDown();

  doc
    .fontSize(16)
    .font("Helvetica-Bold")
    .text("INVOICE", {
      align: "center",
    });

  doc.moveDown();

  doc
    .fontSize(10)
    .font("Helvetica")
    .text(`Invoice Number: ${bill.invoiceNumber}`);

  doc.text(
    `Date: ${
      bill.createdAt
        ? new Date(bill.createdAt).toLocaleDateString()
        : "-"
    }`
  );

  doc.moveDown();

  // Patient
  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("Patient");

  doc
    .fontSize(10)
    .font("Helvetica")
    .text(
      `Patient ID: ${bill.patient?.patientId || "-"}`
    );

  doc.text(
    `Name: ${bill.patient?.fullName || "-"}`
  );

  doc.moveDown();

  // Items
  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("Bill Details");

  doc.moveDown(0.5);

  bill.items.forEach((item, index) => {
    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .text(`${index + 1}. ${item.name}`);

    doc
      .fontSize(9)
      .font("Helvetica")
      .text(`Category: ${item.category}`);

    doc.text(`Quantity: ${item.quantity}`);

    doc.text(
      `Price: Rs. ${item.price.toFixed(2)}`
    );

    doc.text(
      `Amount: Rs. ${item.amount.toFixed(2)}`
    );

    doc.moveDown(0.5);
  });

  doc.moveDown();

  // Totals
  doc
    .fontSize(10)
    .font("Helvetica")
    .text(
      `Subtotal: Rs. ${bill.subtotal.toFixed(2)}`,
      { align: "right" }
    );

  doc.text(
    `Discount: Rs. ${bill.discount.toFixed(2)}`,
    { align: "right" }
  );

  doc.text(
    `Tax: Rs. ${bill.tax.toFixed(2)}`,
    { align: "right" }
  );

  doc
    .fontSize(13)
    .font("Helvetica-Bold")
    .text(
      `TOTAL: Rs. ${bill.total.toFixed(2)}`,
      { align: "right" }
    );

  doc.moveDown();

  doc
    .fontSize(10)
    .font("Helvetica")
    .text(
      `Payment Status: ${bill.paymentStatus}`
    );

  doc.text(
    `Payment Method: ${bill.paymentMethod}`
  );

  if (bill.notes) {
    doc.moveDown();

    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("Notes");

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(bill.notes);
  }

  doc.moveDown(3);

  doc
    .fontSize(9)
    .text(
      "Thank you for choosing AyurSutra.",
      { align: "center" }
    );

  doc.end();
};