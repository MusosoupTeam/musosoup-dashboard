// Column order in the "Reviews" sheet tab. Keep this in sync with the sheet -
// it is the single source of truth for mapping spreadsheet columns to review fields.
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
];

export const SHEET_COLUMN_RANGE = `A:${String.fromCharCode(64 + REVIEW_COLUMNS.length)}`;
