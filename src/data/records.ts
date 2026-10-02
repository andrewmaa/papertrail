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
  sourcePreviewUrls?: string[];
};
