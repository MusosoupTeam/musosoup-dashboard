import { getSheetsClient } from './sheetsClient.js';
import { REDDIT_COLUMNS, REDDIT_SHEET_COLUMN_RANGE } from './redditFields.js';
import { toIsoDate } from './parseDate.js';

const DEFAULT_SHEET_ID = '15NvtTse6-GJ52_EJ4aVNv2HX4Uu4jKdJTNxNZfNaQM8';
const SHEET_ID = process.env.GOOGLE_SHEET_ID || DEFAULT_SHEET_ID;
const SHEET_TAB = process.env.REDDIT_SHEET_TAB_NAME || 'Reddit Mentions';

const TRUTHY_NEEDS_ACTION = new Set(['yes', 'y', 'true', '1']);

function rowToMention(row, rowNumber) {
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
