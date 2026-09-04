import { getSheetsClient } from './sheetsClient.js';
import {
  REDDIT_COLUMNS,
  REDDIT_SHEET_COLUMN_RANGE,
  REDDIT_LAST_COLUMN_LETTER,
  redditColumnLetter,
} from './redditFields.js';
import { toIsoDate } from './parseDate.js';
import { RowConflictError } from './errors.js';

const DEFAULT_SHEET_ID = '15NvtTse6-GJ52_EJ4aVNv2HX4Uu4jKdJTNxNZfNaQM8';
const SHEET_ID = process.env.GOOGLE_SHEET_ID || DEFAULT_SHEET_ID;
const SHEET_TAB = process.env.REDDIT_SHEET_TAB_NAME || 'Reddit Mentions';

const TRUTHY_NEEDS_ACTION = new Set(['yes', 'y', 'true', '1']);

export const EDITABLE_REDDIT_FIELDS = ['status', 'notes'];

export function rowToMention(row, rowNumber) {
  const mention = { rowNumber };
  REDDIT_COLUMNS.forEach((column, index) => {
    mention[column.key] = (row[index] ?? '').toString().trim();
  });

  mention.needsAction = TRUTHY_NEEDS_ACTION.has(mention.needsAction.toLowerCase());
  mention.datePostedIso = toIsoDate(mention.datePosted);

  return mention;
}

/**
 * Reads every row of the Reddit Mentions tab and returns normalized mention
 * objects. Mirrors reviewsRepository.js: the only place that talks to the
 * Sheets API for this source, kept separate from the Reviews repository so
 * the two feedback sources stay independent read paths.
 */
export async function listRedditMentions() {
  const sheets = await getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_TAB}!${REDDIT_SHEET_COLUMN_RANGE}`,
  });

  const [, ...rows] = response.data.values || [];
  return rows
    .filter((row) => row.some((cell) => String(cell ?? '').trim() !== ''))
    .map((row, index) => rowToMention(row, index + 2));
}

/**
 * Updates one Reddit mention row in place. Mirrors updateReview() - verifies
 * the row at rowNumber still holds the expected Post ID before writing, and
 * always stamps Edited By / Last Updated At.
 */
export async function updateRedditMention({ rowNumber, postId, patch, editedBy }) {
  const sheets = await getSheetsClient();

  const idCheck = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_TAB}!${redditColumnLetter('postId')}${rowNumber}`,
  });
  const actualId = (idCheck.data.values?.[0]?.[0] ?? '').toString().trim();
  if (postId && actualId !== postId) {
    throw new RowConflictError(
      `Row ${rowNumber} no longer matches post ${postId} - the sheet may have changed. Refresh and try again.`,
    );
  }

  const now = new Date();
  const data = [];
  const setCell = (key, value) =>
    data.push({ range: `${SHEET_TAB}!${redditColumnLetter(key)}${rowNumber}`, values: [[value ?? '']] });

  for (const field of EDITABLE_REDDIT_FIELDS) {
    if (field in patch) setCell(field, patch[field]);
  }
  setCell('editedBy', editedBy);
  setCell('lastUpdatedAt', now.toISOString());

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { valueInputOption: 'RAW', data },
  });

  const refreshed = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_TAB}!A${rowNumber}:${REDDIT_LAST_COLUMN_LETTER}${rowNumber}`,
  });
  return rowToMention(refreshed.data.values?.[0] ?? [], rowNumber);
}
