<template>
  <div class="pg">
    <aside class="pg-side">
      <div class="pg-brand">
        <span class="pg-brand__mark" />
        <div>
          <h1>Beauty Calendar</h1>
          <p>drag-to-create · day / week / month</p>
        </div>
      </div>

      <section class="pg-group">
        <label class="pg-label">主题色 · Accent</label>
        <div class="pg-swatches">
          <button
            v-for="t in themePresets"
            :key="t.key"
            class="pg-swatch"
            :class="{ active: theme === t.key }"
            :style="{ background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})` }"
            :title="t.name"
            @click="theme = t.key"
          />
        </div>
      </section>

      <section class="pg-group">
        <label class="pg-label">外观 · Scheme</label>
        <div class="pg-seg">
          <button :class="{ active: scheme === 'dark' }" @click="scheme = 'dark'">Dark</button>
          <button :class="{ active: scheme === 'light' }" @click="scheme = 'light'">Light</button>
        </div>
      </section>

      <section class="pg-group">
        <label class="pg-label">语言 · Locale</label>
        <select v-model="locale" class="pg-select">
          <option v-for="(msg, key) in builtinLocales" :key="key" :value="key">
            {{ msg.name }}
          </option>
        </select>
      </section>

      <section class="pg-group">
        <label class="pg-label">每周起始 · Week start</label>
        <div class="pg-seg">
          <button :class="{ active: weekStart === 1 }" @click="weekStart = 1">Mon</button>
          <button :class="{ active: weekStart === 0 }" @click="weekStart = 0">Sun</button>
        </div>
      </section>

      <section class="pg-group">
        <label class="pg-label">行高 · Hour height · {{ hourHeight }}px</label>
        <input v-model.number="hourHeight" type="range" min="40" max="88" step="4" class="pg-range" />
      </section>

      <section class="pg-group pg-toggles">
        <label class="pg-toggle">
          <input v-model="creatable" type="checkbox" />
          <span>拖拽新建 · Drag to create</span>
        </label>
        <label class="pg-toggle">
          <input v-model="editable" type="checkbox" />
          <span>拖拽移动/缩放 · Move &amp; resize</span>
        </label>
      </section>

      <section class="pg-group">
        <div class="pg-meta">
          <span>事件数 · {{ store.events.length }}</span>
          <div class="pg-actions">
            <button class="pg-btn" @click="store.reset()">Reset</button>
            <button class="pg-btn ghost" @click="store.clear()">Clear</button>
          </div>
        </div>
      </section>

      <section class="pg-group pg-log-wrap">
        <label class="pg-label">活动 · Activity</label>
        <ul class="pg-log">
          <li v-for="(line, i) in log" :key="i">{{ line }}</li>
          <li v-if="!log.length" class="pg-log__empty">拖动面板空白处新建日程…</li>
        </ul>
      </section>
    </aside>

    <main class="pg-main">
      <BeautyCalendar
        v-model:events="store.events"
        v-model:view="view"
        v-model:date="date"
        v-model:locale="locale"
        :theme="theme"
        :scheme="scheme"
        :week-start="weekStart"
        :hour-height="hourHeight"
        :editable="editable"
        :creatable="creatable"
        current-user="You"
        @event-create="onCreate"
        @event-update="onUpdate"
        @event-delete="onDelete"
        @event-click="onEventClick"
        @date-click="onDateClick"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import dayjs from "dayjs";
import {
  BeautyCalendar,
  builtinLocales,
  themePresets,
  type CalendarEvent,
  type CalendarView,
  type ColorScheme,
  type TimeRange,
  type WeekStart,
} from "beauty-calendar";

import { useEventsStore } from "./stores/events";

const store = useEventsStore();

const view = ref<CalendarView>("week");
const date = ref<number>(Date.now());
const locale = ref("zh-CN");
const theme = ref("aurora");
const scheme = ref<ColorScheme>("dark");
const weekStart = ref<WeekStart>(1);
const hourHeight = ref(56);
const editable = ref(true);
const creatable = ref(true);

const log = ref<string[]>([]);
function push(line: string) {
  log.value = [`${dayjs().format("HH:mm:ss")}  ${line}`, ...log.value].slice(0, 40);
}

function onCreate(ev: CalendarEvent) {
  push(`＋ 新建 "${ev.title}"  ${dayjs(ev.startTime).format("MM-DD HH:mm")}`);
}
function onUpdate(payload: { id: string } & TimeRange) {
  push(`↕ 移动 ${dayjs(payload.startTime).format("MM-DD HH:mm")} – ${dayjs(payload.endTime).format("HH:mm")}`);
}
function onDelete(ev: CalendarEvent) {
  push(`✕ 删除 "${ev.title}"`);
}
function onEventClick(ev: CalendarEvent) {
  push(`• 点击 "${ev.title}"`);
}
function onDateClick(d: ReturnType<typeof dayjs>) {
  push(`▤ 选中 ${d.format("YYYY-MM-DD")}`);
}
</script>

<style scoped>
.pg {
  display: flex;
  height: 100%;
  padding: 18px;
  gap: 18px;
}

.pg-side {
  flex: 0 0 290px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 20px;
  overflow-y: auto;
  background: var(--pg-panel);
  border: 1px solid var(--pg-border);
  border-radius: 18px;
}

.pg-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}
.pg-brand__mark {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  background: linear-gradient(135deg, #22d3ee, #6366f1);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}
.pg-brand h1 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.3px;
}
.pg-brand p {
  margin: 2px 0 0;
  font-size: 11px;
  color: var(--pg-text-dim);
}

.pg-group {
  display: flex;
  flex-direction: column;
  gap: 9px;
}
.pg-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--pg-text-dim);
}

.pg-swatches {
  display: flex;
  gap: 9px;
  flex-wrap: wrap;
}
.pg-swatch {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.15s, border-color 0.15s;
}
.pg-swatch:hover {
  transform: translateY(-2px);
}
.pg-swatch.active {
  border-color: #fff;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.12);
}

.pg-seg {
  display: flex;
  padding: 3px;
  background: rgba(148, 163, 184, 0.08);
  border: 1px solid var(--pg-border);
  border-radius: 10px;
}
.pg-seg button {
  flex: 1;
  height: 28px;
  font-size: 12px;
  font-weight: 500;
  color: var(--pg-text-dim);
  background: transparent;
  border: none;
  border-radius: 7px;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
}
.pg-seg button.active {
  color: #fff;
  background: linear-gradient(135deg, #22d3ee, #6366f1);
}

.pg-select {
  height: 34px;
  padding: 0 10px;
  font-size: 13px;
  color: var(--pg-text);
  background: rgba(148, 163, 184, 0.08);
  border: 1px solid var(--pg-border);
  border-radius: 10px;
  cursor: pointer;
}

.pg-range {
  width: 100%;
  accent-color: #22d3ee;
}

.pg-toggles {
  gap: 11px;
}
.pg-toggle {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 13px;
  color: var(--pg-text);
  cursor: pointer;
}
.pg-toggle input {
  width: 16px;
  height: 16px;
  accent-color: #6366f1;
}

.pg-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--pg-text-dim);
}
.pg-actions {
  display: flex;
  gap: 8px;
}
.pg-btn {
  height: 28px;
  padding: 0 12px;
  font-size: 12px;
  color: var(--pg-text);
  background: rgba(148, 163, 184, 0.1);
  border: 1px solid var(--pg-border);
  border-radius: 8px;
  cursor: pointer;
}
.pg-btn:hover {
  border-color: #6366f1;
}
.pg-btn.ghost {
  background: transparent;
}

.pg-log-wrap {
  flex: 1;
  min-height: 0;
}
.pg-log {
  flex: 1;
  margin: 0;
  padding: 10px;
  list-style: none;
  overflow-y: auto;
  font-size: 11.5px;
  line-height: 1.7;
  color: var(--pg-text-dim);
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--pg-border);
  border-radius: 10px;
  font-variant-numeric: tabular-nums;
}
.pg-log__empty {
  color: rgba(147, 161, 189, 0.5);
}

.pg-main {
  flex: 1;
  min-width: 0;
  height: 100%;
}
</style>
