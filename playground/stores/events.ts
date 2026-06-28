import { defineStore } from "pinia";
import { ref } from "vue";
import dayjs from "dayjs";
import type { CalendarEvent, TimeRange } from "beauty-calendar";

import { genId } from "@/core/id";

/** Build a timestamp `dayOffset` days from today at a given wall-clock time. */
function at(dayOffset: number, hour: number, minute = 0): number {
  return dayjs().add(dayOffset, "day").hour(hour).minute(minute).second(0).millisecond(0).valueOf();
}

function seed(): CalendarEvent[] {
  return [
    { id: genId(), title: "每日站会 · Daily Standup", startTime: at(0, 9, 30), endTime: at(0, 10, 0), creator: "Alice" },
    { id: genId(), title: "设计评审 · Design Review", startTime: at(0, 14, 0), endTime: at(0, 15, 30), creator: "Bob" },
    { id: genId(), title: "1:1 with Sam", startTime: at(0, 14, 30), endTime: at(0, 15, 0), creator: "Sam" },
    { id: genId(), title: "产品同步 · Product Sync", startTime: at(1, 11, 0), endTime: at(1, 12, 0), creator: "Carol" },
    { id: genId(), title: "候选人面试 · Interview", startTime: at(2, 13, 0), endTime: at(2, 14, 0), creator: "Dave" },
    { id: genId(), title: "迭代规划 · Sprint Planning", startTime: at(-1, 10, 0), endTime: at(-1, 11, 30), creator: "Alice" },
    { id: genId(), title: "晨间专注 · Focus", startTime: at(1, 9, 0), endTime: at(1, 9, 45), creator: "You" },
    { id: genId(), title: "晚间健身 · Gym", startTime: at(0, 19, 0), endTime: at(0, 20, 0), creator: "You" },
    { id: genId(), title: "出差 · Conference Trip", startTime: at(3, 8, 0), endTime: at(4, 18, 0), creator: "Bob" },
  ];
}

export const useEventsStore = defineStore("events", () => {
  const events = ref<CalendarEvent[]>(seed());

  function add(event: CalendarEvent) {
    events.value = [...events.value, event];
  }
  function update(id: string, range: TimeRange) {
    events.value = events.value.map((e) =>
      e.id === id ? { ...e, startTime: range.startTime, endTime: range.endTime } : e,
    );
  }
  function rename(id: string, title: string) {
    events.value = events.value.map((e) => (e.id === id ? { ...e, title } : e));
  }
  function remove(id: string) {
    events.value = events.value.filter((e) => e.id !== id);
  }
  function reset() {
    events.value = seed();
  }
  function clear() {
    events.value = [];
  }

  return { events, add, update, rename, remove, reset, clear };
});
