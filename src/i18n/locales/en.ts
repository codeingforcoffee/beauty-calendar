import type { LocaleMessages } from "../types";

export const en: LocaleMessages = {
  name: "English",
  hour12: true,
  views: { day: "Day", week: "Week", month: "Month" },
  today: "Today",
  createNew: "New event",
  untitled: "Untitled event",
  confirm: "Confirm",
  cancel: "Cancel",
  titlePlaceholder: "Add title",
  delete: "Delete event",
  by: "by",
  more: "+{n} more",
  monthsLong: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ],
  weekdaysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  weekdaysLong: [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
  ],
  titleFormat: {
    day: "dddd, MMMM D, YYYY",
    week: "MMMM YYYY",
    month: "MMMM YYYY",
  },
};
