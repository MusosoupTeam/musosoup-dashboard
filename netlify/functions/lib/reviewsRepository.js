import { getSheetsClient } from './sheetsClient.js';
import { REVIEW_COLUMNS, SHEET_COLUMN_RANGE, LAST_COLUMN_LETTER, columnLetter } from './reviewFields.js';
import { toIsoDate } from './parseDate.js';
import { RowConflictError } from './errors.js';

const DEFAULT_SHEET_ID = '15NvtTse6-GJ52_EJ4aVNv2HX4Uu4jKdJTNxNZfNaQM8';
const SHEET_ID = process.env.GOOGLE_SHEET_ID || DEFAULT_SHEET_ID;
const SHEET_TAB = process.env.SHEET_TAB_NAME || 'Reviews';

const TRUTHY_NEEDS_ACTION = new Set(['yes', 'y', 'true', '1']);

// Fields a client is allowed to write. Order doesn't matter here - each is
// written to its own cell by column key.
export const EDITABLE_REVIEW_FIELDS = ['status', 'notes', 'assignedTo', 'outcome', 'suggestedReply'];

export function rowToReview(row, rowNumber) {
  const review = { rowNumber };
  REVIEW_COLUMNS.forEach((column, index) => {
    review[column.key] = (row[index] ?? '').toString().trim();
  });

  const rating = Number.parseFloat(review.starRating);
  review.starRating = Number.isFinite(rating) ? rating : null;
  review.needsAction = TRUTHY_NEEDS_ACTION.has(review.needsAction.toLowerCase());
  review.datePostedIso = toIsoDate(review.datePosted);
  review.dateContactedIso = toIsoDate(review.dateContacted);

  return review;
}

/**
 * Reads every row of the Reviews tab and returns normalized review objects.
 * This is the only place that talks to the Sheets API - handlers and any
 * future write operations should go through repository functions like this
 * one rather than calling the Sheets client directly.
 */
export async function listReviews() {
  const sheets = await getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_TAB}!${SHEET_COLUMN_RANGE}`,
  });

  const [, ...rows] = response.data.values || [];
  return rows
    .filter((row) => row.some((cell) => String(cell ?? '').trim() !== ''))
    .map((row, index) => rowToReview(row, index + 2));
}

/**
 * Updates one review row in place. Writes go through the same service
 * account as reads (bumped from Viewer to Editor). Verifies the row at
 * rowNumber still holds the expected Review ID before writing, so a sheet
 * reordered elsewhere doesn't silently overwrite the wrong row. Status ->
 * "Contacted" auto-stamps Date Contacted with today's date; it is never
 * accepted as a direct field. Always stamps Edited By / Last Updated At.
 */
export async function updateReview({ rowNumber, reviewId, patch, editedBy }) {
  const sheets = await getSheetsClient();

  const idCheck = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_TAB}!${columnLetter('reviewId')}${rowNumber}`,
  });
  const actualId = (idCheck.data.values?.[0]?.[0] ?? '').toString().trim();
  if (reviewId && actualId !== reviewId) {
    throw new RowConflictError(
      `Row ${rowNumber} no longer matches review ${reviewId} - the sheet may have changed. Refresh and try again.`,
    );
  }

  const now = new Date();
  const data = [];
  const setCell = (key, value) => data.push({ range: `${SHEET_TAB}!${columnLetter(key)}${rowNumber}`, values: [[value ?? '']] });

  for (const field of EDITABLE_REVIEW_FIELDS) {
    if (field in patch) setCell(field, patch[field]);
  }
  if (typeof patch.status === 'string' && patch.status.trim().toLowerCase() === 'contacted') {
    setCell('dateContacted', now.toISOString().slice(0, 10));
  }
  setCell('editedBy', editedBy);
  setCell('lastUpdatedAt', now.toISOString());

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { valueInputOption: 'RAW', data },
  });

  const refreshed = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_TAB}!A${rowNumber}:${LAST_COLUMN_LETTER}${rowNumber}`,
  });
  return rowToReview(refreshed.data.values?.[0] ?? [], rowNumber);
}
