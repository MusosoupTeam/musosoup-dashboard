import { getSheetsClient } from './sheetsClient.js';
import { REVIEW_COLUMNS, SHEET_COLUMN_RANGE } from './reviewFields.js';
import { toIsoDate } from './parseDate.js';

const DEFAULT_SHEET_ID = '15NvtTse6-GJ52_EJ4aVNv2HX4Uu4jKdJTNxNZfNaQM8';
const SHEET_ID = process.env.GOOGLE_SHEET_ID || DEFAULT_SHEET_ID;
const SHEET_TAB = process.env.SHEET_TAB_NAME || 'Reviews';

const TRUTHY_NEEDS_ACTION = new Set(['yes', 'y', 'true', '1']);

function rowToReview(row, rowNumber) {
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
