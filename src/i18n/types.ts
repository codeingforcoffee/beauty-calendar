/** All user-facing strings the calendar renders. Fully overridable per instance. */
export interface LocaleMessages {
  /** Human label for the locale itself, e.g. "简体中文". */
  name: string;
  /** Use a 12-hour clock with AM/PM (true) or 24-hour (false). */
  hour12: boolean;
  views: {
    day: string;
    week: string;
    month: string;
  };
  today: string;
  createNew: string;
  untitled: string;
  confirm: string;
  cancel: string;
  titlePlaceholder: string;
  delete: string;
  /** Prefix before the creator name in an event block. */
  by: string;
  /** Overflow label in month cells; `{n}` is replaced with the hidden count. */
  more: string;
  /** Full month names, index 0 = January. */
  monthsLong: string[];
  /** Short weekday names, index 0 = Sunday. */
  weekdaysShort: string[];
  /** Full weekday names, index 0 = Sunday. */
  weekdaysLong: string[];
  /** Header title format token (dayjs) for each view. */
  titleFormat: {
    day: string;
    week: string;
    month: string;
  };
}

export type LocaleKey = string;
