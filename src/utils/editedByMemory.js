// Remembers the last name/initials typed into an "Edited by" field for this
// browser tab session, purely to prefill the next save - not an identity or
// login system. The field stays editable every time.
const KEY = 'dashboard_last_editor_name';

export function getLastEditorName() {
  try {
    return sessionStorage.getItem(KEY) || '';
  } catch {
    return '';
  }
}

export function setLastEditorName(name) {
  try {
    sessionStorage.setItem(KEY, name);
  } catch {
    // ignore - just won't be remembered for next save
  }
}
