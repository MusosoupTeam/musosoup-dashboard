// Column order in the "Reddit Mentions" sheet tab. Keep this in sync with the
// sheet - it is the single source of truth for mapping spreadsheet columns to
// mention fields.
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
];

export const REDDIT_SHEET_COLUMN_RANGE = `A:${String.fromCharCode(64 + REDDIT_COLUMNS.length)}`;
