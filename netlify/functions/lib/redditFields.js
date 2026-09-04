// Column order in the "Reddit Mentions" sheet tab. Keep this in sync with the
// sheet - it is the single source of truth for mapping spreadsheet columns to
// mention fields. Edited By / Last Updated At are written by the edit
// endpoints (reddit.js PATCH) and must exist as the last two columns on the
// sheet for writes to land in the right place.
export const REDDIT_COLUMNS = [
  { key: 'datePosted', header: 'Date Posted' },
  { key: 'author', header: 'Author' },
  { key: 'title', header: 'Title' },
  { key: 'excerpt', header: 'Excerpt' },
  { key: 'postUrl', header: 'Post URL' },
  { key: 'postId', header: 'Post ID' },
  { key: 'needsAction', header: 'Needs Action' },
  { key: 'status', header: 'Status' },
  { key: 'notes', header: 'Notes' },
  { key: 'editedBy', header: 'Edited By' },
  { key: 'lastUpdatedAt', header: 'Last Updated At' },
];

export const REDDIT_LAST_COLUMN_LETTER = String.fromCharCode(64 + REDDIT_COLUMNS.length);
export const REDDIT_SHEET_COLUMN_RANGE = `A:${REDDIT_LAST_COLUMN_LETTER}`;

export function redditColumnLetter(key) {
  const index = REDDIT_COLUMNS.findIndex((column) => column.key === key);
  if (index === -1) throw new Error(`Unknown Reddit mention column: ${key}`);
  return String.fromCharCode(65 + index);
}
