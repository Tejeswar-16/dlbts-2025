
const TEMPLATE_PATH = "/certificate_template.png";

// Text colors
const TEXT_COLOR = "#3926A5";
const RED_COLOR = "#E52A18";

const POSITIONS = {
    // Student name after "Selvan / Selvi"
    name: {
        x: 0.548,
        y: 0.522,
        maxWidth: 0.48,
    },

    // Samithi name on the dotted line after "of"
    samithi: {
        x: 0.348,
        y: 0.590,
        maxWidth: 0.30,
    },

    // Dynamic event heading
    event: {
        x: 0.195,
        y: 0.662,
        maxWidth: 0.48,
    },

    // Date field
    date: {
        x: 0.135,
        y: 0.890,
    },

    // Place field
    place: {
        x: 0.135,
        y: 0.943,
    },

    heldOn: {
        x: 0.135,
        y: 0.740
    },

    prize: {
        x: 0.495,
        y: 0.740
    }
};

// Group tick positions.
// These are approximate positions above the Roman numerals.
const GROUP_TICK_POSITIONS = {
    "Group 1": {
        x: 0.167,
        y: 0.555,
    },
    "Group 2": {
        x: 0.201,
        y: 0.555,
    },
    "Group 3": {
        x: 0.230,
        y: 0.555,
    },
};

// Helper: sanitize filename
function sanitizeFilename(value) {
    return (
        String(value ?? "student")
            .replace(/[^a-zA-Z0-9 ]/g, "")
            .trim()
            .replace(/\s+/g, "_") || "student"
    );
}

// Helper: fit text within the available width
function drawFittedText(
    ctx,
    text,
    x,
    y,
    maxWidth,
    initialFontSize,
    options = {}
) {
    const {
        color = TEXT_COLOR,
        fontFamily = "Georgia, 'Times New Roman', serif",
        bold = true,
        align = "left",
    } = options;

    let fontSize = initialFontSize;

    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = "alphabetic";

    const fontWeight = bold ? "bold" : "normal";

    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;

    while (
        ctx.measureText(text).width > maxWidth &&
        fontSize > 10
    ) {
        fontSize -= 1;
        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    }

    ctx.fillText(text, x, y);
}

// Helper: draw a tick above the selected group numeral
function drawGroupTick(ctx, group, imgW, imgH) {
    // Database returns: "Group 1", "Group 2", or "Group 3"
    const normalizedGroup = String(group).trim();

    const position = GROUP_TICK_POSITIONS[normalizedGroup];

    if (!position) {
        throw new Error(
            "Invalid group. Use Group 1, Group 2, or Group 3."
        );
    }

    const x = imgW * position.x;
    const y = imgH * position.y;

    const size = imgW * 0.012;

    ctx.save();

    ctx.strokeStyle = TEXT_COLOR;
    ctx.lineWidth = Math.max(2, imgW * 0.002);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();

    // Short descending stroke
    ctx.moveTo(
        x - size * 0.5,
        y
    );

    ctx.lineTo(
        x - size * 0.1,
        y + size * 0.4
    );

    // Longer ascending stroke
    ctx.lineTo(
        x + size * 0.65,
        y - size * 0.55
    );

    ctx.stroke();

    ctx.restore();
}

// Main function
export async function generateCertificatePDF(
    studentName,
    group,
    samithi,
    eventName
) {
    // Validate required values
    if (!studentName?.trim()) {
        throw new Error("Student name is required.");
    }

    if (!group?.trim()) {
        throw new Error("Group is required.");
    }

    if (!samithi?.trim()) {
        throw new Error("Samithi name is required.");
    }

    if (!eventName?.trim()) {
        throw new Error("Event name is required.");
    }

    // Validate group before generating the certificate
    const normalizedGroup = String(group).trim();

    if (!GROUP_TICK_POSITIONS[normalizedGroup]) {
        throw new Error(
            "Invalid group. Use Group 1, Group 2, or Group 3."
        );
    }

    // Dynamically import jsPDF for client-side use
    const { jsPDF } = await import("jspdf");

    return new Promise((resolve, reject) => {
        const templateImg = new Image();

        templateImg.onload = () => {
            try {
                const imgW = templateImg.naturalWidth;
                const imgH = templateImg.naturalHeight;

                // Create a canvas matching the original image
                const canvas = document.createElement("canvas");

                canvas.width = imgW;
                canvas.height = imgH;

                const ctx = canvas.getContext("2d");

                if (!ctx) {
                    throw new Error(
                        "Unable to create canvas context."
                    );
                }

                // 1. Draw the original certificate background
                ctx.drawImage(
                    templateImg,
                    0,
                    0,
                    imgW,
                    imgH
                );

                // Calculate font size relative to image height
                const fontSize = Math.round(imgH * 0.027);

                // 2. Draw the student's name
                drawFittedText(
                    ctx,
                    studentName.trim().toUpperCase(),
                    Math.round(imgW * POSITIONS.name.x),
                    Math.round(imgH * POSITIONS.name.y),
                    Math.round(imgW * POSITIONS.name.maxWidth),
                    fontSize,
                    {
                        color: TEXT_COLOR,
                        fontFamily: "Georgia, 'Times New Roman', serif",
                        bold: true,
                        align: "left",
                    }
                );

                // 3. Tick the selected group numeral
                // Original "Group I/II/III" text remains visible
                drawGroupTick(
                    ctx,
                    normalizedGroup,
                    imgW,
                    imgH
                );

                // 4. Draw the Samithi name after "of"
                drawFittedText(
                    ctx,
                    samithi.trim(),
                    Math.round(imgW * POSITIONS.samithi.x),
                    Math.round(imgH * POSITIONS.samithi.y),
                    Math.round(imgW * POSITIONS.samithi.maxWidth),
                    fontSize,
                    {
                        color: TEXT_COLOR,
                        fontFamily: "Georgia, 'Times New Roman', serif",
                        bold: true,
                        align: "left",
                    }
                );

                // Draw the dynamic event heading centered
                drawFittedText(
                    ctx,
                    eventName.trim(),
                    Math.round(imgW * POSITIONS.event.x),
                    Math.round(imgH * POSITIONS.event.y),
                    Math.round(imgW * POSITIONS.event.maxWidth),
                    fontSize,
                    {
                        color: TEXT_COLOR,
                        fontFamily: "Georgia, 'Times New Roman', serif",
                        bold: true,
                        align: "left",
                    }
                );

                // 6. Draw the participation prize
                ctx.fillStyle = TEXT_COLOR;
                ctx.textAlign = "left";
                ctx.textBaseline = "alphabetic";
                ctx.font = `${fontSize}px Georgia, 'Times New Roman', serif`;

                ctx.fillText(
                    "01/11/2026",
                    Math.round(imgW * POSITIONS.heldOn.x),
                    Math.round(imgH * POSITIONS.heldOn.y)
                );

                ctx.fillText(
                    "-",
                    Math.round(imgW * POSITIONS.prize.x),
                    Math.round(imgH * POSITIONS.prize.y)
                );

                // 7. Draw the date
                ctx.fillStyle = RED_COLOR;
                ctx.font = `${fontSize}px Georgia, 'Times New Roman', serif`;

                ctx.fillText(
                    "01/11/2026",
                    Math.round(imgW * POSITIONS.date.x),
                    Math.round(imgH * POSITIONS.date.y)
                );

                // 8. Draw the place
                ctx.fillText(
                    "Chennai",
                    Math.round(imgW * POSITIONS.place.x),
                    Math.round(imgH * POSITIONS.place.y)
                );

                // 9. Convert canvas to JPEG
                const imgData = canvas.toDataURL(
                    "image/jpeg",
                    0.98
                );

                // 10. Create an A4 landscape PDF
                const pdf = new jsPDF({
                    orientation: "landscape",
                    unit: "mm",
                    format: "a4",
                });

                // Preserve original image aspect ratio
                const pageW = 297;
                const pageH = 210;

                const scale = Math.min(
                    pageW / imgW,
                    pageH / imgH
                );

                const drawW = imgW * scale;
                const drawH = imgH * scale;

                const offsetX = (pageW - drawW) / 2;
                const offsetY = (pageH - drawH) / 2;

                pdf.addImage(
                    imgData,
                    "JPEG",
                    offsetX,
                    offsetY,
                    drawW,
                    drawH
                );

                // 11. Download the generated certificate
                const safeName = sanitizeFilename(studentName);

                pdf.save(
                    `${safeName}_${eventName}.pdf`
                );

                resolve();
            } catch (error) {
                console.error(
                    "Certificate generation error:",
                    error
                );

                reject(error);
            }
        };

        templateImg.onerror = () => {
            reject(
                new Error(
                    "Certificate template not found. " +
                    "Save the image as public/certificate_template.png."
                )
            );
        };

        // Load image from the Next.js public folder
        templateImg.src = TEMPLATE_PATH;
    });
}