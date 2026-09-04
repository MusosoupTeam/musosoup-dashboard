// Thrown by the repository write functions when the row at the given
// rowNumber no longer matches the id the client last read - i.e. the sheet
// was reordered/edited elsewhere between load and save. Handlers turn this
// into a 409 rather than silently overwriting the wrong row.
export class RowConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RowConflictError';
  }
}
