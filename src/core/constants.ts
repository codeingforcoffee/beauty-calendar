/** Default pixel height of one hour row in day / week views. */
export const DEFAULT_HOUR_HEIGHT = 56;

export const HOURS_PER_DAY = 24;
export const MINUTES_PER_HOUR = 60;
export const MINUTES_PER_DAY = HOURS_PER_DAY * MINUTES_PER_HOUR;

/** Snap granularity (minutes) for drag-create / move / resize. */
export const DEFAULT_SNAP_MINUTES = 15;

/** Minimum rendered duration (minutes) so tiny events stay clickable. */
export const MIN_EVENT_MINUTES = 15;

/** Default duration (minutes) for a single-click create with no drag distance. */
export const DEFAULT_CREATE_MINUTES = 30;

/** Pixels the pointer must travel before a click is treated as a drag. */
export const DRAG_THRESHOLD_PX = 4;

export const VIEW_ORDER = ["day", "week", "month"] as const;
