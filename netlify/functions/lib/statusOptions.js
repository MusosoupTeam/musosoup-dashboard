// Status is a fixed, Sheets-enforced dropdown on both the Reviews and Reddit
// Mentions tabs (see Code.gs's applyStatusValidation_, which applies this
// same list of values to both). Both write endpoints (reviews.js, reddit.js)
// validate against it here so a value the sheet itself wouldn't accept never
// gets attempted in a batchUpdate call.
export const STATUS_OPTIONS = ['New', 'Contacted', 'Resolved', 'Declined to engage', 'No response from reviewer'];
