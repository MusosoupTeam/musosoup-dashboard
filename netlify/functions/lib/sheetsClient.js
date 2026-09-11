import { google } from 'googleapis';

// Full read/write scope - the client from getSheetsClient() is shared by
// every repository (reads and writes alike), so this one scope has to cover
// both. Read-only here would 403 the write endpoints even with Editor
// access on the sheet itself, since OAuth scope and sheet-level permission
// are checked independently.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Netlify keeps a warm Lambda around between invocations, so cache the
// authenticated client at module scope rather than re-authenticating per request.
let clientPromise = null;

function loadCredentials() {
  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (json) {
    return JSON.parse(json);
  }

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY;
  if (email && key) {
    return { client_email: email, private_key: key.replace(/\\n/g, '\n') };
  }

  throw new Error(
    'Missing Google service account credentials. Set GOOGLE_SERVICE_ACCOUNT_JSON, or ' +
      'GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY, as Netlify environment variables.',
  );
}

export function getSheetsClient() {
  if (!clientPromise) {
    clientPromise = (async () => {
      const auth = new google.auth.GoogleAuth({ credentials: loadCredentials(), scopes: SCOPES });
      const authClient = await auth.getClient();
      return google.sheets({ version: 'v4', auth: authClient });
    })().catch((error) => {
      clientPromise = null; // allow retry on next request instead of caching a rejected promise
      throw error;
    });
  }
  return clientPromise;
}
