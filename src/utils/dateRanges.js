export const RANGE_PRESETS = {
  LAST_30_DAYS: 'last30',
  THIS_YEAR: 'thisYear',
  CUSTOM: 'custom',
};

export const RANGE_PRESET_OPTIONS = [
  { value: RANGE_PRESETS.LAST_30_DAYS, label: 'Last 30 days' },
  { value: RANGE_PRESETS.THIS_YEAR, label: 'This year' },
  { value: RANGE_PRESETS.CUSTOM, label: 'Custom range' },
];

function toIso(date) {
  return date.toISOString().slice(0, 10);
}

export function resolveDateRange(preset, custom) {
  const today = new Date();
  const todayIso = toIso(today);

  if (preset === RANGE_PRESETS.LAST_30_DAYS) {
    const start = new Date(today);
    start.setDate(start.getDate() - 29);
    return { start: toIso(start), end: todayIso };
  }

  if (preset === RANGE_PRESETS.THIS_YEAR) {
    return { start: `${today.getFullYear()}-01-01`, end: todayIso };
  }

  return { start: custom?.start || null, end: custom?.end || todayIso };
}
