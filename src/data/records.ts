import type { DocType } from "../components/FilterSidebar/FilterSidebar";
import type { RecordStatus } from "../components/RecordCard/RecordCard";

export type DocumentField = {
  label: string;
  value: string;
  annotationId?: number;
};

export type NoteAuthor = {
  initials: string;
  name: string;
};

export type Annotation = {
  id: number;
  fieldLabel: string;
  fieldValue: string;
  author: NoteAuthor;
  time: string;
  body: string;
};

export type Comment = {
  id: string;
  author: NoteAuthor;
  time: string;
  body: string;
};

export type RecordDocument = {
  id: string;
  type: DocType;
  title: string;
  status: RecordStatus;
  pages: number;
  box: string;
  completionLabel: string;
  fields: DocumentField[];
  annotations: Annotation[];
  comments: Comment[];
  language?: string;
  confidence?: string;
  sourcePreviewUrl?: string;
};

const DANA: NoteAuthor = { initials: "DR", name: "Dana Reyes" };
const THEO: NoteAuthor = { initials: "TM", name: "Theo Marsh" };
const MAYA: NoteAuthor = { initials: "ML", name: "Maya Lin" };

export const RECORDS: RecordDocument[] = [
  {
    id: "PT-0412",
    type: "Contract",
    title: "Hartwell Lease Agreement",
    status: "Digitized",
    pages: 14,
    box: "07",
    completionLabel: "Completed",
    fields: [
      { label: "Parties", value: "Hartwell LLC & Brightside Ltd." },
      { label: "Effective date", value: "01 / 02 / 2021" },
      { label: "Term", value: "60 months" },
      { label: "Signature", value: "J. Hartwell", annotationId: 4 },
    ],
    annotations: [
      {
        id: 4,
        fieldLabel: "Signature",
        fieldValue: "J. Hartwell",
        author: DANA,
        time: "3h ago",
        body: "Signature line is blank on the paper copy too \u2014 chase the client.",
      },
    ],
    comments: [
      {
        id: "c1",
        author: DANA,
        time: "2d ago",
        body: "Scan of page 3 is a little faint \u2014 worth a re-check?",
      },
      {
        id: "c2",
        author: THEO,
        time: "Yesterday",
        body: "Confirmed against the original in the box.",
      },
    ],
  },
  {
    id: "PT-0411",
    type: "Invoice",
    title: "Q3 Vendor Invoices",
    status: "Processing",
    pages: 38,
    box: "07",
    completionLabel: "In progress",
    fields: [
      { label: "Vendor", value: "Northline Supply Co." },
      { label: "Invoice total", value: "$48,220.00" },
      { label: "Period", value: "Jul \u2013 Sep 2024", annotationId: 2 },
      { label: "Due date", value: "10 / 15 / 2024" },
    ],
    annotations: [
      {
        id: 2,
        fieldLabel: "Period",
        fieldValue: "Jul \u2013 Sep 2024",
        author: MAYA,
        time: "1h ago",
        body: "Page 12 still OCR-ing \u2014 period may shift once the batch finishes.",
      },
    ],
    comments: [
      {
        id: "c1",
        author: THEO,
        time: "4h ago",
        body: "Vendor remittance address differs from last quarter \u2014 flag for AP.",
      },
      {
        id: "c2",
        author: DANA,
        time: "Yesterday",
        body: "Box 07 also has the packing slips; keep them with this record.",
      },
    ],
  },
  {
    id: "PT-0409",
    type: "Tax",
    title: "Form 1120 \u2014 FY2019",
    status: "Digitized",
    pages: 22,
    box: "06",
    completionLabel: "Completed",
    fields: [
      { label: "Entity", value: "Brightside Holdings Inc." },
      { label: "Tax year", value: "FY 2019" },
      { label: "Taxable income", value: "$1,284,500" },
      { label: "Preparer", value: "Keller & Associates", annotationId: 1 },
    ],
    annotations: [
      {
        id: 1,
        fieldLabel: "Preparer",
        fieldValue: "Keller & Associates",
        author: THEO,
        time: "5h ago",
        body: "Preparer stamp is smudged on page 1; confirmed via cover letter.",
      },
    ],
    comments: [
      {
        id: "c1",
        author: MAYA,
        time: "1d ago",
        body: "Schedule L totals match the ledger export from Box 06.",
      },
      {
        id: "c2",
        author: DANA,
        time: "3d ago",
        body: "Keep the 1120-W estimate worksheet attached.",
      },
    ],
  },
  {
    id: "PT-0405",
    type: "Medical",
    title: "Patient Intake, Ward C",
    status: "Digitized",
    pages: 61,
    box: "05",
    completionLabel: "Completed",
    fields: [
      { label: "Patient", value: "E. Morales" },
      { label: "Date of birth", value: "03 / 14 / 1978" },
      { label: "Ward", value: "Ward C \u2014 Bed 12" },
      { label: "Physician", value: "Dr. A. Okonkwo", annotationId: 3 },
    ],
    annotations: [
      {
        id: 3,
        fieldLabel: "Physician",
        fieldValue: "Dr. A. Okonkwo",
        author: DANA,
        time: "6h ago",
        body: "Attending noted on page 2; verify against the order sheet.",
      },
    ],
    comments: [
      {
        id: "c1",
        author: MAYA,
        time: "Yesterday",
        body: "Consent form is page 4 \u2014 already digitized cleanly.",
      },
      {
        id: "c2",
        author: THEO,
        time: "2d ago",
        body: "Redact SSN before sharing outside clinical ops.",
      },
    ],
  },
  {
    id: "PT-0402",
    type: "Letter",
    title: "Board Correspondence 1998",
    status: "Queued",
    pages: 9,
    box: "05",
    completionLabel: "Queued",
    fields: [
      { label: "From", value: "Board Secretary" },
      { label: "To", value: "Executive Committee" },
      { label: "Date", value: "11 / 08 / 1998" },
      { label: "Subject", value: "Q4 agenda & proxies", annotationId: 1 },
    ],
    annotations: [
      {
        id: 1,
        fieldLabel: "Subject",
        fieldValue: "Q4 agenda & proxies",
        author: THEO,
        time: "12m ago",
        body: "Queued behind Ward C batch \u2014 subject line may refine after OCR.",
      },
    ],
    comments: [
      {
        id: "c1",
        author: DANA,
        time: "1d ago",
        body: "Ribbon binding is fragile; scan one sheet at a time.",
      },
    ],
  },
  {
    id: "PT-0398",
    type: "Contract",
    title: "Supplier Master Contract",
    status: "Digitized",
    pages: 31,
    box: "04",
    completionLabel: "Completed",
    fields: [
      { label: "Parties", value: "Brightside Ltd. & Helix Parts" },
      { label: "Effective date", value: "06 / 01 / 2018" },
      { label: "Renewal", value: "Auto, 24 months" },
      { label: "Signatory", value: "R. Chen", annotationId: 2 },
    ],
    annotations: [
      {
        id: 2,
        fieldLabel: "Signatory",
        fieldValue: "R. Chen",
        author: MAYA,
        time: "8h ago",
        body: "Amendment A changes indemnity \u2014 linked under page 18.",
      },
    ],
    comments: [
      {
        id: "c1",
        author: THEO,
        time: "2d ago",
        body: "Pricing schedule matches the 2022 rider in Box 04.",
      },
      {
        id: "c2",
        author: DANA,
        time: "4d ago",
        body: "Legal already approved the extracted parties string.",
      },
    ],
  },
  {
    id: "PT-0391",
    type: "Tax",
    title: "Payroll Ledger 2004",
    status: "Digitized",
    pages: 47,
    box: "03",
    completionLabel: "Completed",
    fields: [
      { label: "Employer", value: "Hartwell LLC" },
      { label: "Period", value: "CY 2004" },
      { label: "Gross wages", value: "$2,104,880" },
      { label: "Prepared by", value: "In-house payroll", annotationId: 5 },
    ],
    annotations: [
      {
        id: 5,
        fieldLabel: "Prepared by",
        fieldValue: "In-house payroll",
        author: DANA,
        time: "Yesterday",
        body: "Handwritten corrections on Dec pages \u2014 mark as authoritative.",
      },
    ],
    comments: [
      {
        id: "c1",
        author: MAYA,
        time: "3d ago",
        body: "YTD columns reconcile to the W-2 summary packet.",
      },
      {
        id: "c2",
        author: THEO,
        time: "5d ago",
        body: "Box 03 also holds the state withholding worksheets.",
      },
    ],
  },
  {
    id: "PT-0388",
    type: "Invoice",
    title: "Freight Invoices, Mar",
    status: "Queued",
    pages: 12,
    box: "03",
    completionLabel: "Queued",
    fields: [
      { label: "Carrier", value: "Pacific Freight Lines" },
      { label: "Amount", value: "$6,940.25" },
      { label: "Ship date", value: "03 / 22 / 2023" },
      { label: "Reference", value: "BOL-44821", annotationId: 1 },
    ],
    annotations: [
      {
        id: 1,
        fieldLabel: "Reference",
        fieldValue: "BOL-44821",
        author: MAYA,
        time: "20m ago",
        body: "BOL number guessed from stamp; confirm once scan clears queue.",
      },
    ],
    comments: [
      {
        id: "c1",
        author: THEO,
        time: "2d ago",
        body: "Fuel surcharge pages are carbon copies \u2014 expect light OCR.",
      },
    ],
  },
  {
    id: "PT-0380",
    type: "Letter",
    title: "Founder Letters",
    status: "Digitized",
    pages: 18,
    box: "01",
    completionLabel: "Completed",
    fields: [
      { label: "Author", value: "Eleanor Hartwell" },
      { label: "Recipient", value: "Early investors" },
      { label: "Date", value: "09 / 30 / 1987" },
      { label: "Topic", value: "Series seed update", annotationId: 2 },
    ],
    annotations: [
      {
        id: 2,
        fieldLabel: "Topic",
        fieldValue: "Series seed update",
        author: THEO,
        time: "9h ago",
        body: "Letterhead watermark is archival \u2014 keep color scan.",
      },
    ],
    comments: [
      {
        id: "c1",
        author: DANA,
        time: "1d ago",
        body: "Envelope included as page 18; do not separate.",
      },
      {
        id: "c2",
        author: MAYA,
        time: "6d ago",
        body: "These go to the permanent founders archive after review.",
      },
    ],
  },
];

export function getRecordById(id: string): RecordDocument | undefined {
  return RECORDS.find((record) => record.id === id);
}

export function noteCount(record: RecordDocument): number {
  return record.annotations.length + record.comments.length;
}
