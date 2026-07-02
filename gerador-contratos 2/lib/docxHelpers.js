const {
  Document, Paragraph, TextRun, AlignmentType, Packer
} = require("docx");

const BRAND_GREY = "555555";

function runs(text, opts = {}) {
  return [new TextRun({ text, bold: opts.bold || false, italics: opts.italics || false, size: opts.size || 21, color: opts.color })];
}

function docTitle(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 300 },
    children: [new TextRun({ text, bold: true, size: 28 })]
  });
}

function subTitle(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 300 },
    children: [new TextRun({ text, italics: true, size: 20, color: BRAND_GREY })]
  });
}

function plainParagraph(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    alignment: AlignmentType.JUSTIFIED,
    children: runs(text, opts)
  });
}

function bullet(text) {
  return new Paragraph({
    spacing: { after: 60 },
    alignment: AlignmentType.JUSTIFIED,
    indent: { left: 360 },
    children: runs(text, { size: 21 })
  });
}

const ROMAN_LOWER = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x"];

// Takes an array of item texts (WITHOUT the "(i)" prefix) and returns numbered
// bullet Paragraphs with sequential roman numerals — so removing an item never
// leaves a gap like (i)...(iii).
function numberedBullets(items) {
  return items.map((text, idx) => bullet(`(${ROMAN_LOWER[idx] || (idx + 1)}) ${text}`));
}

// Auto-numbers clauses as they are added — removing a clause never breaks numbering downstream.
class ClauseBuilder {
  constructor() {
    this.counter = 0;
    this.paragraphs = [];
  }
  // title: string. bodies: string | Paragraph | Array<string|Paragraph>
  add(title, bodies) {
    this.counter++;
    this.paragraphs.push(new Paragraph({
      spacing: { before: 260, after: 100 },
      children: [new TextRun({ text: `${this.counter}. ${title}`, bold: true, size: 22 })]
    }));
    const list = Array.isArray(bodies) ? bodies : [bodies];
    for (const b of list) {
      if (typeof b === "string") this.paragraphs.push(plainParagraph(b));
      else this.paragraphs.push(b);
    }
    return this;
  }
  raw(paragraph) {
    this.paragraphs.push(paragraph);
    return this;
  }
  get() { return this.paragraphs; }
}

function signatureBlock(cityDateLabel, party1Name, party1Label, party2Name, party2Label, party2SubLabel) {
  const p = [
    new Paragraph({ spacing: { before: 500, after: 500 }, children: runs(cityDateLabel, { size: 21 }) }),
    new Paragraph({ spacing: { before: 400 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "_________________________________________", size: 21 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: party1Name, size: 21, bold: true })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 }, children: [new TextRun({ text: party1Label, size: 20 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "_________________________________________", size: 21 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: party2Name, size: 21, bold: true })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: party2Label, size: 20 })] }),
  ];
  if (party2SubLabel) {
    p.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: party2SubLabel, size: 18, color: "777777" })] }));
  }
  return p;
}

const baseDoc = (children) => new Document({
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 }, // A4
        margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 }
      }
    },
    children
  }]
});

module.exports = { Paragraph, TextRun, AlignmentType, Packer, runs, docTitle, subTitle, plainParagraph, bullet, numberedBullets, ClauseBuilder, signatureBlock, baseDoc };
