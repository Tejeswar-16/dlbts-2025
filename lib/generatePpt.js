// Fills the DLBTS-2025.pptx template with live results data and returns a Buffer.
// Tested against the actual uploaded template — see usage notes at the bottom of this file.
import { _jszip } from "jszip";

const JSZip = _jszip.default || _jszip; // handle both CJS and interop-wrapped exports

const SLIDE_CT =
  "application/vnd.openxmlformats-officedocument.presentationml.slide+xml";
const ARROW = "\uF0E8"; // Wingdings right-arrow glyph used in the template's event titles

// ---- XML snippets lifted verbatim from the template (see slide2.xml / slide3.xml) ----

const ORDINAL_SUFFIX = { 1: "st", 2: "nd", 3: "rd" };

function ordinalCellXml(n) {
  const suffix = ORDINAL_SUFFIX[n] || "th";
  return `<a:tc><a:txBody><a:bodyPr/><a:lstStyle/><a:p><a:pPr algn="ctr"><a:lnSpc><a:spcPct val="200000"/></a:lnSpc></a:pPr><a:r><a:rPr lang="en-IN" sz="2500" b="1" dirty="0"><a:latin typeface="Britannic Bold" panose="020B0903060703020204" pitchFamily="34" charset="0"/></a:rPr><a:t>${n}</a:t></a:r><a:r><a:rPr lang="en-IN" sz="2500" b="1" baseline="30000" dirty="0"><a:latin typeface="Britannic Bold" panose="020B0903060703020204" pitchFamily="34" charset="0"/></a:rPr><a:t>${suffix}</a:t></a:r><a:endParaRPr lang="en-IN" sz="2500" b="1" dirty="0"><a:latin typeface="Britannic Bold" panose="020B0903060703020204" pitchFamily="34" charset="0"/></a:endParaRPr></a:p></a:txBody><a:tcPr/></a:tc>`;
}

function textCellXml(text) {
  const safe = escapeXml(text || "\u2014"); // em dash if no entry for that rank
  return `<a:tc><a:txBody><a:bodyPr/><a:lstStyle/><a:p><a:pPr marL="0" algn="ctr" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:lnSpc><a:spcPct val="200000"/></a:lnSpc></a:pPr><a:r><a:rPr lang="en-IN" sz="1800" b="1" i="0" kern="1200" dirty="0"><a:solidFill><a:schemeClr val="dk1"/></a:solidFill><a:effectLst/><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:rPr><a:t>${safe}</a:t></a:r></a:p></a:txBody><a:tcPr/></a:tc>`;
}

function rowXml(rank, name, samithi, rowHeight) {
  return `<a:tr h="${rowHeight}">${ordinalCellXml(rank)}${textCellXml(
    name
  )}${textCellXml(samithi)}</a:tr>`;
}

// Space available for the table between the title and the footer strip (see slide3.xml
// layout: table starts at y=2997200, footer text starts at y=6331914).
const TABLE_TOP = 2997200;
const TABLE_MAX_HEIGHT = 6331914 - TABLE_TOP - 100000; // small margin above footer
const DEFAULT_ROW_HEIGHT = 996244; // template's row height, used for <=3 rows

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// The template hardcodes "TAMILNADU, KANCHIPURAM SOUTH" and "(DLBTS - 2025)" once per
// slide (it's part of the repeated header block) — every slide we touch or keep needs
// this swapped in, not just the divider/event templates.
function applyBranding(xml, districtName, year) {
  return xml
    .replace(
      /<a:t>TAMILNADU, KANCHIPURAM SOUTH<\/a:t>/,
      `<a:t>TAMILNADU, ${escapeXml(districtName.toUpperCase())}</a:t>`
    )
    .replace(/<a:t> \(DLBTS - 2025\)<\/a:t>/, `<a:t> (DLBTS - ${escapeXml(String(year))})</a:t>`);
}

// Table grid + position identical to the template's table (slide3.xml).
// Rows use the template's own height when there are <=3 of them; beyond that
// (ties push a 4th+ row in) they're scaled down so the table never runs into the footer.
function tableGraphicFrameXml(results) {
  const n = results.length;
  const rowHeight =
    n <= 3 ? DEFAULT_ROW_HEIGHT : Math.floor(TABLE_MAX_HEIGHT / n);
  const rowsXml = results
    .map((r) => rowXml(r.rank, r.name, r.samithi, rowHeight))
    .join("");
  const height = rowHeight * n;
  return `<p:graphicFrame><p:nvGraphicFramePr><p:cNvPr id="2" name="Table 1"/><p:cNvGraphicFramePr><a:graphicFrameLocks noGrp="1"/></p:cNvGraphicFramePr><p:nvPr/></p:nvGraphicFramePr><p:xfrm><a:off x="2032000" y="${TABLE_TOP}"/><a:ext cx="8127999" cy="${height}"/></p:xfrm><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/table"><a:tbl><a:tblPr firstRow="1" bandRow="1"><a:tableStyleId>{69CF1AB2-1976-4502-BF36-3FF5EA218861}</a:tableStyleId></a:tblPr><a:tblGrid><a:gridCol w="2709333"/><a:gridCol w="2709333"/><a:gridCol w="2709333"/></a:tblGrid>${rowsXml}</a:tbl></a:graphicData></a:graphic></p:graphicFrame>`;
}

// The template sets the event-slide title at 30pt (sz="3000"), sized for a title like
// "GROUP 1 ➔ BHAJANS". Longer combinations (e.g. "GROUP EVENTS ➔ ALTAR DECORATION - GIRLS")
// wrap to a second line and collide with the table below, so scale the title down to fit.
function titleFontSize(text) {
  const len = text.length;
  if (len <= 22) return 3000;
  if (len <= 30) return 2600;
  if (len <= 38) return 2200;
  if (len <= 46) return 1900;
  return 1600;
}

/**
 * Build an event-results slide's XML from the template event slide,
 * swapping the title text and replacing the <p:graphicFrame> table wholesale.
 */
function buildEventSlideXml(templateXml, sectionLabel, eventName, results) {
  let xml = templateXml;

  const titleText = `${sectionLabel.toUpperCase()} ${ARROW} ${eventName.toUpperCase()}`;
  const fontSize = titleFontSize(titleText);

  // Title: two runs -> "{SECTION} " and "{ARROW} {EVENT}"
  xml = xml.replace(
    /<a:t>[^<]*<\/a:t><\/a:r><a:r>([^]*?)<a:t>[^<]*<\/a:t><\/a:r>/,
    (whole, midRunProps) =>
      `<a:t>${escapeXml(
        sectionLabel.toUpperCase()
      )} </a:t></a:r><a:r>${midRunProps}<a:t>${ARROW} ${escapeXml(
        eventName.toUpperCase()
      )}</a:t></a:r>`
  );

  // The template's title textbox (and only that textbox) uses sz="3000" (3 occurrences:
  // both runs + the trailing endParaRPr) — safe to retarget globally on this slide.
  xml = xml.replace(/sz="3000"/g, `sz="${fontSize}"`);

  // Table: replace the whole <p:graphicFrame>...</p:graphicFrame> (there's exactly one per slide)
  xml = xml.replace(
    /<p:graphicFrame>[\s\S]*<\/p:graphicFrame>/,
    tableGraphicFrameXml(results)
  );

  return xml;
}

function buildDividerSlideXml(templateXml, sectionTitle) {
  return templateXml.replace(
    /<a:t>GROUP 1 EVENTS<\/a:t>/,
    `<a:t>${escapeXml(sectionTitle.toUpperCase())}</a:t>`
  );
}

/**
 * @param {Buffer} templateBuffer  raw bytes of the DLBTS-2025.pptx template
 * @param {Array<{section: string, events: Array<{event: string, results: Array<{name:string, samithi:string, rank:number}>}>}>} data
 * @param {{districtName?: string, year?: string|number}} options
 * @returns {Promise<Buffer>}
 */
async function generateResultsPpt(templateBuffer, data, options = {}) {
  const districtName = options.districtName || "Kanchipuram South";
  const year = options.year || new Date().getFullYear();

  const zip = await JSZip.loadAsync(templateBuffer);

  const titleSlideXml = await zip.file("ppt/slides/slide1.xml").async("string");
  const closingSlideXml = await zip.file("ppt/slides/slide12.xml").async("string");
  const dividerTemplate = applyBranding(
    await zip.file("ppt/slides/slide2.xml").async("string"),
    districtName,
    year
  );
  const eventTemplate = applyBranding(
    await zip.file("ppt/slides/slide3.xml").async("string"),
    districtName,
    year
  );
  const sharedRels = await zip
    .file("ppt/slides/_rels/slide3.xml.rels")
    .async("string");

  // slide1 and slide12 are kept in place (not duplicated), but still carry the
  // same hardcoded district/year header, so they need the same rewrite in-place.
  zip.file("ppt/slides/slide1.xml", applyBranding(titleSlideXml, districtName, year));
  zip.file("ppt/slides/slide12.xml", applyBranding(closingSlideXml, districtName, year));

  let presentationXml = await zip.file("ppt/presentation.xml").async("string");
  let presRelsXml = await zip
    .file("ppt/_rels/presentation.xml.rels")
    .async("string");
  let contentTypesXml = await zip.file("[Content_Types].xml").async("string");

  // ---- 1. Strip the template's original result slides (slide2..slide11) ----
  // Keep slide1 (title) and slide12 (closing) as-is; everything in between is regenerated.
  const removable = [];
  for (let n = 2; n <= 11; n++) removable.push(`slide${n}.xml`);

  for (const name of removable) {
    zip.remove(`ppt/slides/${name}`);
    zip.remove(`ppt/slides/_rels/${name}.rels`);
    contentTypesXml = contentTypesXml.replace(
      new RegExp(
        `<Override PartName="/ppt/slides/${name}"[^/]*/>`,
        "g"
      ),
      ""
    );
  }

  // Find + remove the presentation.xml.rels entries + sldIdLst entries for those slides,
  // recording each freed rId's <p:sldId> so we can splice new ones in at the same spot.
  const relRe = /<Relationship\b[^>]*\/>/g;
  const keptRels = [];
  const removedRidsInOrder = []; // rIds for slide2..slide11, in slide order
  const ridForSlideNum = {};
  let m;
  while ((m = relRe.exec(presRelsXml))) {
    const rel = m[0];
    const targetMatch = rel.match(/Target="slides\/(slide(\d+)\.xml)"/);
    if (targetMatch) {
      ridForSlideNum[targetMatch[2]] = rel.match(/Id="([^"]+)"/)[1];
    }
    keptRels.push(rel);
  }
  for (let n = 2; n <= 11; n++) removedRidsInOrder.push(ridForSlideNum[n]);

  presRelsXml = presRelsXml.replace(
    /<Relationships[^>]*>([\s\S]*)<\/Relationships>/,
    (whole, inner) => {
      let out = inner;
      for (const rid of removedRidsInOrder) {
        out = out.replace(
          new RegExp(`<Relationship Id="${rid}"[^>]*/>`),
          ""
        );
      }
      return whole.replace(inner, out);
    }
  );

  // Remove the corresponding <p:sldId> entries from sldIdLst, remembering the anchor
  // (the rId of slide1, so we insert the new slides right after the title slide).
  for (const rid of removedRidsInOrder) {
    presentationXml = presentationXml.replace(
      new RegExp(`<p:sldId[^>]*r:id="${rid}"[^>]*/>`),
      ""
    );
  }

  // ---- 2. Figure out next available slide number / rId / sldId ----
  let nextSlideNum =
    Math.max(
      ...Array.from(presentationXml.matchAll(/slide(\d+)\.xml/g)).map((x) =>
        Number(x[1])
      ),
      12
    ) + 1;
  let nextRidNum =
    Math.max(
      ...Array.from(presRelsXml.matchAll(/Id="rId(\d+)"/g)).map((x) =>
        Number(x[1])
      )
    ) + 1;
  let nextSldId =
    Math.max(
      255,
      ...Array.from(presentationXml.matchAll(/<p:sldId id="(\d+)"/g)).map(
        (x) => Number(x[1])
      )
    ) + 1;

  const newSlideEntries = []; // { fileName, xml }
  const newSldIdTags = [];

  function registerSlide(xml) {
    const fileName = `slide${nextSlideNum}.xml`;
    nextSlideNum++;
    const rid = `rId${nextRidNum}`;
    nextRidNum++;
    const sldId = nextSldId;
    nextSldId++;

    newSlideEntries.push({ fileName, xml });
    zip.file(`ppt/slides/_rels/${fileName}.rels`, sharedRels);

    contentTypesXml = contentTypesXml.replace(
      "</Types>",
      `<Override PartName="/ppt/slides/${fileName}" ContentType="${SLIDE_CT}"/></Types>`
    );
    presRelsXml = presRelsXml.replace(
      "</Relationships>",
      `<Relationship Id="${rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/${fileName}"/></Relationships>`
    );
    newSldIdTags.push(`<p:sldId id="${sldId}" r:id="${rid}"/>`);
  }

  // ---- 3. Generate a divider + event slides per section ----
  for (const section of data) {
    if (!section.events || section.events.length === 0) continue;

    const dividerTitle = /events?$/i.test(section.section.trim())
      ? section.section
      : `${section.section} Events`;
    registerSlide(buildDividerSlideXml(dividerTemplate, dividerTitle));

    for (const ev of section.events) {
      if (!ev.results || ev.results.length === 0) continue;
      registerSlide(
        buildEventSlideXml(
          eventTemplate,
          section.section,
          ev.event,
          ev.results
        )
      );
    }
  }

  for (const { fileName, xml } of newSlideEntries) {
    zip.file(`ppt/slides/${fileName}`, xml);
  }

  // ---- 4. Splice the new <p:sldId> entries right after the title slide (rId2) ----
  presentationXml = presentationXml.replace(
    /(<p:sldId[^>]*r:id="rId2"[^>]*\/>)/,
    `$1${newSldIdTags.join("")}`
  );

  zip.file("ppt/presentation.xml", presentationXml);
  zip.file("ppt/_rels/presentation.xml.rels", presRelsXml);
  zip.file("[Content_Types].xml", contentTypesXml);

  return zip.generateAsync({ type: "nodebuffer" });
}

module.exports = { generateResultsPpt };