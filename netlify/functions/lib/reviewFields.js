// Column order in the "Reviews" sheet tab. Keep this in sync with the sheet -
// it is the single source of truth for mapping spreadsheet columns to review fields.
// Edited By / Last Updated At are written by the edit endpoints (reviews.js
// PATCH) and must exist as the last two columns on the sheet for writes to
// land in the right place.
export const REVIEW_COLUMNS = [
  { key: 'datePosted', header: 'Date Posted' },
  { key: 'reviewerName', header: 'Reviewer Name' },
  { key: 'starRating', header: 'Star Rating' },
  { key: 'reviewText', header: 'Review Text' },
  { key: 'reviewUrl', header: 'Review URL' },
  { key: 'reviewId', header: 'Review ID' },
  { key: 'needsAction', header: 'Needs Action' },
  { key: 'status', header: 'Status' },
  { key: 'assignedTo', header: 'Assigned To' },
  { key: 'dateContacted', header: 'Date Contacted' },
  { key: 'notes', header: 'Notes' },
  { key: 'outcome', header: 'Outcome' },
  { key: 'suggestedReply', header: 'Suggested Reply' },
  { key: 'editedBy', header: 'Edited By' },
  { key: 'lastUpdatedAt', header: 'Last Updated At' },
];

export const LAST_COLUMN_LETTER = String.fromCharCode(64 + REVIEW_COLUMNS.length);
export const SHEET_COLUMN_RANGE = `A:${LAST_COLUMN_LETTER}`;

export function columnLetter(key) {
  const index = REVIEW_COLUMNS.findIndex((column) => column.key === key);
  if (index === -1) throw new Error(`Unknown review column: ${key}`);
  return String.fromCharCode(65 + index);
}
