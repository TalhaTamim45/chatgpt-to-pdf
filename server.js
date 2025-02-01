const express = require('express');
const cors = require('cors');
const { PDFDocument, rgb } = require('pdf-lib');

const app = express();
app.use(cors());
app.use(express.json());

// Route to generate PDF
app.post('/generate-pdf', async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).send('No content provided.');
  }

  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]); // Custom page size
    const { width, height } = page.getSize();

    // Add content to the PDF
    const fontSize = 12;
    const lines = content.split('\n'); // Split content into lines
    let yOffset = height - 40; // Start from the top of the page

    lines.forEach((line) => {
      if (yOffset < 40) {
        // If we run out of space, add a new page
        const newPage = pdfDoc.addPage([600, 800]);
        const { width: newWidth, height: newHeight } = newPage.getSize();
        yOffset = newHeight - 40;
        page.drawText(line, {
          x: 40,
          y: yOffset,
          size: fontSize,
          color: rgb(0, 0, 0),
        });
        yOffset -= fontSize + 2; // Move down for the next line
      } else {
        page.drawText(line, {
          x: 40,
          y: yOffset,
          size: fontSize,
          color: rgb(0, 0, 0),
        });
        yOffset -= fontSize + 2; // Move down for the next line
      }
    });

    // Serialize the PDF to bytes
    const pdfBytes = await pdfDoc.save();

    // Send the PDF as a response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=chatgpt-conversation.pdf');
    res.send(pdfBytes);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating PDF.');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
