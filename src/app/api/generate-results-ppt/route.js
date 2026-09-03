import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { generateResultsPpt } from "../../../../lib/generatePpt";

// POST body: { data: [{ section: string, events: [{ event: string, results: [{rank, name, samithi}] }] }] }
export async function POST(request) {
  try {
    const { data } = await request.json();

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: "No results to export" }, { status: 400 });
    }

    // Place the template file (the one you uploaded) here in your project.
    const templatePath = path.join(process.cwd(), "assets", "DLBTS-2025-template.pptx");
    const templateBuffer = await fs.readFile(templatePath);

    const pptxBuffer = await generateResultsPpt(templateBuffer, data, {
      districtName: process.env.NEXT_PUBLIC_DISTRICT_NAME,
      year: process.env.NEXT_PUBLIC_EVENT_YEAR,
    });

    return new NextResponse(pptxBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": 'attachment; filename="DLBTS-2025-Results.pptx"',
      },
    });
  } catch (err) {
    console.error("PPT generation failed:", err);
    return NextResponse.json({ error: "Failed to generate PPT" }, { status: 500 });
  }
}