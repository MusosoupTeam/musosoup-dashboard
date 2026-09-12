// Status is a fixed, Sheets-enforced dropdown on both the Reviews and Reddit
// Mentions tabs (Code.gs's applyStatusValidation_ applies this same list to
// both). Shared by both tables' edit dropdowns so they can't offer a value
// the server (and the sheet itself) would reject.
export const STATUS_OPTIONS = ['New', 'Contacted', 'Resolved', 'Declined to engage', 'No response from reviewer'];
