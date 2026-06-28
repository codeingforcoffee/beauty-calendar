<div align="center">

# Beauty Calendar

**A sci-fi styled, drag-to-create calendar component for Vue 3.**

Day / Week / Month views · cross-day drag-create · move & resize · right-click delete · i18n · runtime theming.

[![Vue 3](https://img.shields.io/badge/Vue-3.4%2B-42b883?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-22d3ee.svg)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-a855f7.svg)](#contributing)

![Beauty Calendar preview](./docs/preview.svg)

</div>

---

## Why

Most calendar libraries are either heavyweight and opinionated, or stop at static rendering.
Beauty Calendar focuses on the two things that are genuinely hard to get right — **panel
rendering** and **drag interaction** — while staying completely decoupled from any backend.
The data model is deliberately tiny (`startTime`, `endTime`, `title`, `creator`); everything
else is yours.

## Table of contents

- [Features](#features)
- [Requirements](#requirements)
- [Install](#install)
- [Quick start](#quick-start)
- [Run the project locally](#run-the-project-locally)
- [Integration guide](#integration-guide)
- [Interactions](#interactions)
- [API — Props](#api--props)
- [API — Events](#api--events)
- [Data model](#data-model)
- [Theming](#theming)
- [Internationalization](#internationalization)
- [Headless / advanced usage](#headless--advanced-usage)
- [Project structure](#project-structure)
- [Scripts](#scripts)
- [Contributing](#contributing)
- [License](#license)

## Features

- 🗓 **Day / Week / Month** views with an animated view switcher
- 🖱 **Drag to create** — vertically in a day, **across columns for cross-day events** (day/week), or across cells (month)
- ✅ **Confirm dialog** — a drag opens a floating card (title · time · creator) before the event is committed
- ↕ **Move & resize** existing events with grid snapping (day-shift across columns in week view)
- 🗑 **Right-click menu** to delete an event
- 🧲 Smart overlap layout — lane packing in day/week, spanning bars in month
- 🎨 **Tech / sci-fi theme**: 6 accent presets + dark / light, or your own colors — all via CSS variables
- 🌍 **i18n** built in (zh-CN / zh-TW / en / ja), fully overridable, no extra deps
- 🧩 Drop-in component **or** headless core helpers (`createGeometry`, `layoutDay`, `layoutMonthWeek`, …)
- 📦 Zero business coupling. Peer deps: `vue`, `dayjs`, `@vueuse/core`. ESM + UMD + types.

## Requirements

- **Node** ≥ 18
- **Vue** ≥ 3.4 (uses `defineModel`)
- A bundler that handles `.vue` SFCs and CSS imports (Vite, Vue CLI, Nuxt, etc.)

## Install

```bash
pnpm add beauty-calendar
# or
npm i beauty-calendar
# or
yarn add beauty-calendar
```

`dayjs` and `@vueuse/core` are runtime deps; `vue` is a peer dep you already have.

## Quick start

```vue
<script setup lang="ts">
import { ref } from "vue";
import { BeautyCalendar, type CalendarEvent } from "beauty-calendar";
import "beauty-calendar/style.css";

const events = ref<CalendarEvent[]>([
  {
    id: "1",
    title: "Design Review",
    startTime: Date.now(),
    endTime: Date.now() + 60 * 60 * 1000,
    creator: "Alice",
  },
]);
</script>

<template>
  <div style="height: 100vh">
    <BeautyCalendar v-model:events="events" theme="aurora" scheme="dark" current-user="You" />
  </div>
</template>
```

> The component fills its parent — give the wrapper a height.

That's the whole setup. Drag on empty grid space to create, drag an event to move/resize,
right-click to delete. Created/updated/deleted events are written back to the bound
`events` model **and** emitted as events, so it works drop-in yet stays fully controllable.

## Run the project locally

Clone and run the bundled **playground** (Vite + Pinia) — the fastest way to explore every
prop and interaction:

```bash
git clone https://github.com/your-org/beauty-calendar.git
cd beauty-calendar
pnpm install
pnpm play          # → http://localhost:5180
```

The playground keeps demo events in a **Pinia store** and gives you live controls for theme,
scheme, locale, week-start, hour height, and the editable / creatable flags, plus an activity
log of every emitted event.

Build the library or the playground:

```bash
pnpm build         # library → dist/  (ESM + UMD + .d.ts + css)
pnpm build:play    # static playground → dist-play/
pnpm type-check    # vue-tsc, no emit
pnpm test          # vitest
```

## Integration guide

### 1. Local component (recommended)

```ts
import { BeautyCalendar } from "beauty-calendar";
import "beauty-calendar/style.css";
```

### 2. Global plugin

```ts
import { createApp } from "vue";
import { BeautyCalendarPlugin } from "beauty-calendar";
import "beauty-calendar/style.css";

createApp(App).use(BeautyCalendarPlugin).mount("#app");
// now <BeautyCalendar /> is available everywhere
```

### 3. Controlled vs. uncontrolled

Every piece of state is a `v-model` — bind what you want to control, omit the rest:

```vue
<BeautyCalendar
  v-model:events="events"
  v-model:view="view"        <!-- 'day' | 'week' | 'month' -->
  v-model:date="anchorDate"  <!-- visible range anchor -->
  v-model:locale="locale"
/>
```

### 4. Wire it to a backend

The component mutates the local `events` model for instant feedback and emits the same change
so you can persist it. Treat the emit as your sync point:

```vue
<script setup lang="ts">
import { ref } from "vue";
import { BeautyCalendar, type CalendarEvent, type TimeRange } from "beauty-calendar";
import { api } from "./api";

const events = ref<CalendarEvent[]>(await api.list());

const onCreate = (ev: CalendarEvent) => api.create(ev);
const onUpdate = (p: { id: string } & TimeRange) => api.patch(p.id, p);
const onDelete = (ev: CalendarEvent) => api.remove(ev.id);
</script>

<template>
  <BeautyCalendar
    v-model:events="events"
    @event-create="onCreate"
    @event-update="onUpdate"
    @event-delete="onDelete"
  />
</template>
```

Prefer a custom create flow (e.g. open your own form)? Set `:confirm-create="false"` and handle
`@event-create`, or keep the built-in confirm dialog and read the title there.

## Interactions

| Gesture                              | Result                                                            |
| ------------------------------------ | ---------------------------------------------------------------- |
| Drag on empty grid (day/week)        | Create — vertically for one day, **across columns for cross-day**|
| Click empty grid (day/week)          | Create a `defaultCreateMinutes` event at that time               |
| Drag across cells (month)            | Create spanning those days (start = nearest step time)           |
| Drag an event body                   | Move (week view also shifts the day)                             |
| Drag an event's top / bottom edge    | Resize (single-day events)                                       |
| Right-click an event                 | Open the menu → **delete**                                       |
| Click a day number / header          | Jump to that day's Day view                                      |

Drag-create opens a **confirm dialog** by default; press <kbd>Enter</kbd> to confirm or
<kbd>Esc</kbd> / click-outside to cancel.

## API — Props

| Prop                   | Type                                       | Default    | Description                                  |
| ---------------------- | ------------------------------------------ | ---------- | -------------------------------------------- |
| `v-model:events`       | `CalendarEvent[]`                          | `[]`       | Events to render (two-way).                  |
| `v-model:view`         | `'day' \| 'week' \| 'month'`               | `'week'`   | Active view.                                 |
| `v-model:date`         | `number \| string \| Date`                 | `now`      | Anchor date for the visible range.           |
| `v-model:locale`       | `string`                                   | `'zh-CN'`  | Locale key.                                  |
| `theme`                | `string \| { accent, accent2 }`            | `'aurora'` | Accent preset key or explicit color pair.    |
| `scheme`               | `'dark' \| 'light'`                        | `'dark'`   | Color scheme.                                |
| `weekStart`            | `0 \| 1`                                    | `1`        | Week starts Sunday (0) or Monday (1).        |
| `hourHeight`           | `number`                                    | `56`       | Pixel height of one hour row.                |
| `snapMinutes`          | `number`                                    | `15`       | Drag snap granularity.                       |
| `minEventMinutes`      | `number`                                    | `15`       | Minimum rendered duration.                   |
| `defaultCreateMinutes` | `number`                                    | `30`       | Duration of a click-create with no drag.     |
| `editable`             | `boolean`                                   | `true`     | Allow move / resize.                         |
| `creatable`            | `boolean`                                   | `true`     | Allow drag-to-create.                        |
| `deletable`            | `boolean`                                   | `true`     | Allow right-click delete.                    |
| `confirmCreate`        | `boolean`                                   | `true`     | Show a confirm dialog after a drag-create.   |
| `currentUser`          | `string`                                    | —          | Creator stamped onto created events.         |
| `messages`             | `Record<string, Partial<LocaleMessages>>`   | —          | Per-locale message overrides.                |
| `nowInterval`          | `number`                                    | `30000`    | How often (ms) the now-indicator ticks.      |

## API — Events

| Event          | Payload                       | When                                  |
| -------------- | ----------------------------- | ------------------------------------- |
| `event-create` | `CalendarEvent`               | A drag/click-create was confirmed.    |
| `event-update` | `{ id, startTime, endTime }`  | A move / resize finished.             |
| `event-delete` | `CalendarEvent`               | An event was deleted from the menu.   |
| `event-click`  | `CalendarEvent`               | An event was clicked (no drag).       |
| `date-click`   | `Dayjs`                       | A day number / header was picked.     |

## Data model

```ts
interface CalendarEvent {
  id: string;        // stable id, used for keying & update/delete
  title: string;
  startTime: number; // epoch ms
  endTime: number;   // epoch ms
  creator?: string;  // optional label; also seeds the auto color
  color?: string;    // optional explicit color; otherwise derived from creator
  [key: string]: unknown; // carry your own fields freely
}
```

## Theming

A theme is just two accent colors; the neutral palette comes from the scheme. Use a preset
key or your own pair:

```vue
<BeautyCalendar theme="neon" scheme="dark" />
<BeautyCalendar :theme="{ accent: '#22d3ee', accent2: '#6366f1' }" scheme="light" />
```

Presets: `aurora` · `neon` · `matrix` · `sunset` · `ice` · `gold`.

Every visual value is a CSS custom property scoped to `.beauty-calendar`, so you can override
anything in your own stylesheet:

```css
.beauty-calendar {
  --bc-hour-height: 64px;
  --bc-radius-md: 14px;
  --bc-now: #ff3366;
}
```

## Internationalization

Built-in locales: `zh-CN`, `zh-TW`, `en`, `ja`. Override strings per locale, or add your own:

```vue
<BeautyCalendar
  locale="en"
  :messages="{ en: { createNew: 'Add', views: { week: 'Wk' } } }"
/>
```

Date formatting is driven by the locale's `monthsLong` / `weekdaysLong` arrays (no dayjs locale
bundles required), so overriding messages also localizes the header. To register a brand-new
locale, pass its full `LocaleMessages` under a new key in `messages` and set `locale` to it.

## Headless / advanced usage

The geometry and layout math are exported for custom renderers:

```ts
import {
  createGeometry, // px ↔ time conversion + snapping
  layoutDay,      // overlap lanes for a day column
  layoutMonthWeek,// spanning bars for a month week-row
  viewDays,       // day/week/month grid generation
  nearestStepMinutes,
} from "beauty-calendar";

const geo = createGeometry(56, 15);
const positioned = layoutDay(Date.now(), events, geo); // → { top, height, lane, lanes, … }[]
```

You can also `useCalendar()` inside a child component to read the live context (view, geometry,
messages, actions) when composing your own pieces.

## Project structure

```
src/
  core/         # pure, testable logic (no Vue): time, layout, month-layout, grid, format
  composables/  # use-context (provide/inject), use-drag-create, use-drag-move
  components/   # BeautyCalendar, header, views (DayWeek/Month), event blocks, dialogs, menu
  i18n/         # locale registry + zh-CN / zh-TW / en / ja
  theme/        # accent presets + auto color palette
  styles/       # design tokens (CSS variables) + base styles
  index.ts      # public entry
playground/     # Vite + Pinia demo app
```

## Scripts

| Script             | Description                              |
| ------------------ | ---------------------------------------- |
| `pnpm play`        | Start the playground dev server          |
| `pnpm dev`         | Alias of `pnpm play`                     |
| `pnpm build`       | Build the library to `dist/`             |
| `pnpm build:play`  | Build the static playground              |
| `pnpm type-check`  | Type-check with `vue-tsc`                |
| `pnpm test`        | Run unit tests with Vitest               |

## Contributing

Issues and PRs are welcome. To get going:

```bash
pnpm install
pnpm play          # develop against the playground
pnpm type-check    # keep types green
```

Conventions: TypeScript everywhere, keep `src/core/**` free of Vue/DOM so it stays unit-testable,
and match the existing component style. Please run `pnpm type-check` before opening a PR.

## License

[MIT](./LICENSE) © coffeefish
