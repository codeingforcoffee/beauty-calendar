<div align="center">

# Beauty Calendar

**一個科技風、可拖曳建立日程的 Vue 3 日曆元件。**

日 / 週 / 月檢視 · 跨天拖曳建立 · 移動與縮放 · 滑鼠右鍵刪除 · 國際化 · 執行時換膚。

[![Vue 3](https://img.shields.io/badge/Vue-3.4%2B-42b883?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-22d3ee.svg)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-a855f7.svg)](#參與貢獻)

[English](./README.md) · [简体中文](./README.zh-CN.md) · **繁體中文** · [日本語](./README.ja.md)

![Beauty Calendar preview](./docs/preview.svg)

</div>

---

## 為什麼

大多數日曆函式庫不是笨重且與業務高度耦合,就是只停留在靜態渲染。Beauty Calendar 專注於兩件真正難做好的事——**面板渲染**與**拖曳互動**——並且與任何後端完全解耦。資料模型刻意做得極小(`startTime`、`endTime`、`title`、`creator`),其餘欄位都交給你自由擴充。

## 目錄

- [特性](#特性)
- [環境需求](#環境需求)
- [安裝](#安裝)
- [快速開始](#快速開始)
- [本機執行](#本機執行)
- [整合指南](#整合指南)
- [互動說明](#互動說明)
- [API 屬性](#api-屬性)
- [API 事件](#api-事件)
- [資料模型](#資料模型)
- [主題客製化](#主題客製化)
- [國際化](#國際化)
- [無頭與進階用法](#無頭與進階用法)
- [專案結構](#專案結構)
- [指令腳本](#指令腳本)
- [參與貢獻](#參與貢獻)
- [授權](#授權)

## 特性

- 🗓 **日 / 週 / 月**檢視,附動畫切換器
- 🖱 **拖曳建立**——日內縱向拖曳、**跨欄拖曳產生跨天日程**(日 / 週檢視),或在月檢視跨格拖曳
- ✅ **二次確認彈窗**——拖曳後彈出浮層卡片(標題 · 時間 · 建立人),確認後才真正寫入
- ↕ **移動與縮放**既有日程,附格線吸附(週檢視還支援橫向換天)
- 🗑 **滑鼠右鍵選單**刪除日程
- 🧲 智慧重疊版面——日 / 週檢視依車道排列,月檢視為跨天長條
- 🎨 **科技 / 賽博風主題**:6 套強調色預設 + 暗 / 亮配色,或自訂顏色——全部基於 CSS 變數
- 🌍 內建**國際化**(zh-CN / zh-TW / en / ja),可完全覆寫,零額外相依套件
- 🧩 既可直接當元件用,也可使用無頭核心函式(`createGeometry`、`layoutDay`、`layoutMonthWeek` 等)
- 📦 零業務耦合。Peer 相依僅 `vue`、`dayjs`、`@vueuse/core`。產物含 ESM + UMD + 型別宣告。

## 環境需求

- **Node** ≥ 18
- **Vue** ≥ 3.4(使用了 `defineModel`)
- 支援 `.vue` 單一檔案元件與 CSS 匯入的建置工具(Vite、Vue CLI、Nuxt 等)

## 安裝

```bash
pnpm add beauty-calendar
# 或
npm i beauty-calendar
# 或
yarn add beauty-calendar
```

`dayjs` 與 `@vueuse/core` 是執行時相依套件;`vue` 是你已具備的 peer 相依。

## 快速開始

```vue
<script setup lang="ts">
import { ref } from "vue";
import { BeautyCalendar, type CalendarEvent } from "beauty-calendar";
import "beauty-calendar/style.css";

const events = ref<CalendarEvent[]>([
  {
    id: "1",
    title: "设计评审",
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

> 元件會撐滿父容器——記得給外層容器一個高度。

這就是全部設定。在空白格線上拖曳即可建立,拖曳日程可移動 / 縮放,滑鼠右鍵可刪除。建立 / 更新 / 刪除會同時寫回繫結的 `events` 模型**並**對外發出事件,因此開箱即用,又始終可控。

## 本機執行

複製儲存庫並啟動內建的 **playground**(Vite + Pinia)——探索每個屬性與互動的最快方式:

```bash
git clone https://github.com/codeingforcoffee/beauty-calendar.git
cd beauty-calendar
pnpm install
pnpm play          # → http://localhost:5180
```

playground 使用 **Pinia store** 儲存示範資料,並提供主題、配色、語言、每週起始、列高、可編輯 / 可建立等開關,以及一份記錄所有事件的活動紀錄。

建置函式庫或 playground:

```bash
pnpm build         # 库 → dist/(ESM + UMD + .d.ts + css)
pnpm build:play    # 静态 playground → dist-play/
pnpm type-check    # vue-tsc 类型检查,不产出
pnpm test          # vitest 单元测试
```

## 整合指南

### 1. 區域元件(推薦)

```ts
import { BeautyCalendar } from "beauty-calendar";
import "beauty-calendar/style.css";
```

### 2. 全域外掛

```ts
import { createApp } from "vue";
import { BeautyCalendarPlugin } from "beauty-calendar";
import "beauty-calendar/style.css";

createApp(App).use(BeautyCalendarPlugin).mount("#app");
// 此后任意位置都可使用 <BeautyCalendar />
```

### 3. 受控與非受控

所有狀態都是 `v-model`——需要控制的就繫結,不需要的就省略:

```vue
<BeautyCalendar
  v-model:events="events"
  v-model:view="view"        <!-- 'day' | 'week' | 'month' -->
  v-model:date="anchorDate"  <!-- 可视范围锚点 -->
  v-model:locale="locale"
/>
```

### 4. 串接後端

元件會即時修改本機 `events` 模型以取得流暢回饋,同時發出相同的變更供你持久化。把事件當作同步點即可:

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

想要自訂建立流程(例如彈出你自己的表單)?設定 `:confirm-create="false"` 並監聽 `@event-create`,或保留內建確認彈窗、在那裡讀取標題。

## 互動說明

| 手勢                         | 結果                                                |
| ---------------------------- | --------------------------------------------------- |
| 在空白格線拖曳(日 / 週)    | 建立——單天縱向拖曳,**跨欄拖曳產生跨天日程**        |
| 點擊空白格線(日 / 週)      | 在該時刻建立一個 `defaultCreateMinutes` 時長的日程  |
| 在月檢視跨格拖曳             | 建立跨這些天的日程(開始 = 最近的步進時間)         |
| 拖曳日程主體                 | 移動(週檢視同時換天)                              |
| 拖曳日程上 / 下邊緣          | 縮放(僅單天日程)                                  |
| 滑鼠右鍵日程                 | 開啟選單 → **刪除**                                 |
| 點擊日期數字 / 表頭          | 跳至該天的「日」檢視                                |

拖曳建立預設彈出**確認彈窗**;按 <kbd>Enter</kbd> 確認,<kbd>Esc</kbd> 或點擊外部取消。

## API 屬性

| 屬性                   | 型別                                       | 預設值     | 說明                                |
| ---------------------- | ------------------------------------------ | ---------- | ----------------------------------- |
| `v-model:events`       | `CalendarEvent[]`                          | `[]`       | 要渲染的日程(雙向)。              |
| `v-model:view`         | `'day' \| 'week' \| 'month'`               | `'week'`   | 目前檢視。                          |
| `v-model:date`         | `number \| string \| Date`                 | 目前時間   | 可視範圍的錨點日期。                |
| `v-model:locale`       | `string`                                   | `'zh-CN'`  | 語言 key。                          |
| `theme`                | `string \| { accent, accent2 }`            | `'aurora'` | 強調色預設 key 或明確指定的顏色對。 |
| `scheme`               | `'dark' \| 'light'`                        | `'dark'`   | 配色方案。                          |
| `weekStart`            | `0 \| 1`                                    | `1`        | 每週起始為週日(0)或週一(1)。   |
| `hourHeight`           | `number`                                    | `56`       | 每小時列高(像素)。               |
| `snapMinutes`          | `number`                                    | `15`       | 拖曳吸附粒度(分鐘)。             |
| `minEventMinutes`      | `number`                                    | `15`       | 渲染的最小時長。                    |
| `defaultCreateMinutes` | `number`                                    | `30`       | 未拖動直接點擊建立時的時長。        |
| `editable`             | `boolean`                                   | `true`     | 允許移動 / 縮放。                   |
| `creatable`            | `boolean`                                   | `true`     | 允許拖曳建立。                      |
| `deletable`            | `boolean`                                   | `true`     | 允許滑鼠右鍵刪除。                  |
| `confirmCreate`        | `boolean`                                   | `true`     | 拖曳建立後是否彈出確認彈窗。        |
| `currentUser`          | `string`                                    | —          | 寫入新建日程的建立人識別。          |
| `messages`             | `Record<string, Partial<LocaleMessages>>`   | —          | 依語言覆寫文案。                    |
| `nowInterval`          | `number`                                    | `30000`    | 目前時間指示線的重新整理間隔(毫秒)。 |

## API 事件

| 事件           | 載荷                          | 觸發時機                            |
| -------------- | ----------------------------- | ----------------------------------- |
| `event-create` | `CalendarEvent`               | 拖曳 / 點擊建立被確認後。           |
| `event-update` | `{ id, startTime, endTime }`  | 移動 / 縮放結束後。                 |
| `event-delete` | `CalendarEvent`               | 從選單刪除日程後。                  |
| `event-click`  | `CalendarEvent`               | 點擊(非拖曳)日程時。              |
| `date-click`   | `Dayjs`                       | 點擊日期數字 / 表頭時。            |

## 資料模型

```ts
interface CalendarEvent {
  id: string;        // 稳定 id,用于 key 及更新 / 删除
  title: string;
  startTime: number; // epoch 毫秒
  endTime: number;   // epoch 毫秒
  creator?: string;  // 可选标识;同时作为自动配色的种子
  color?: string;    // 可选显式颜色;否则按 creator 推导
  [key: string]: unknown; // 自由携带你自己的字段
}
```

## 主題客製化

一套主題就是兩個強調色;中性色板來自配色方案。可用預設 key 或自訂顏色對:

```vue
<BeautyCalendar theme="neon" scheme="dark" />
<BeautyCalendar :theme="{ accent: '#22d3ee', accent2: '#6366f1' }" scheme="light" />
```

預設:`aurora` · `neon` · `matrix` · `sunset` · `ice` · `gold`。

每個視覺值都是作用於 `.beauty-calendar` 的 CSS 變數,你可以在自己的樣式裡覆寫任意一項:

```css
.beauty-calendar {
  --bc-hour-height: 64px;
  --bc-radius-md: 14px;
  --bc-now: #ff3366;
}
```

## 國際化

內建語言:`zh-CN`、`zh-TW`、`en`、`ja`。可依語言覆寫文案,或新增你自己的語言:

```vue
<BeautyCalendar
  locale="en"
  :messages="{ en: { createNew: 'Add', views: { week: 'Wk' } } }"
/>
```

日期格式由語言包中的 `monthsLong` / `weekdaysLong` 陣列驅動(無需 dayjs 的 locale 套件),因此覆寫文案也會同步在地化表頭。要註冊一種全新語言,在 `messages` 中以新 key 傳入完整的 `LocaleMessages`,再把 `locale` 指向它即可。

## 無頭與進階用法

幾何與版面計算都已匯出,可用於自訂渲染器:

```ts
import {
  createGeometry, // 像素 ↔ 时间换算与吸附
  layoutDay,      // 单天列的重叠车道
  layoutMonthWeek,// 月视图某周行的跨天长条
  viewDays,       // 日 / 周 / 月网格生成
  nearestStepMinutes,
} from "beauty-calendar";

const geo = createGeometry(56, 15);
const positioned = layoutDay(Date.now(), events, geo); // → { top, height, lane, lanes, … }[]
```

也可以在子元件中 `useCalendar()` 讀取即時上下文(檢視、幾何、文案、動作),組裝你自己的部件。

## 專案結構

```
src/
  core/         # 纯逻辑(无 Vue):time、layout、month-layout、grid、format
  composables/  # use-context(provide/inject)、use-drag-create、use-drag-move
  components/   # BeautyCalendar、表头、视图(日周 / 月)、日程块、弹窗、菜单
  i18n/         # 语言注册表 + zh-CN / zh-TW / en / ja
  theme/        # 强调色预设 + 自动配色板
  styles/       # 设计令牌(CSS 变量)+ 基础样式
  index.ts      # 对外入口
playground/     # Vite + Pinia 演示应用
```

## 指令腳本

| 指令               | 說明                       |
| ------------------ | -------------------------- |
| `pnpm play`        | 啟動 playground 開發伺服器 |
| `pnpm dev`         | `pnpm play` 的別名         |
| `pnpm build`       | 將函式庫建置到 `dist/`     |
| `pnpm build:play`  | 建置靜態 playground        |
| `pnpm type-check`  | 用 `vue-tsc` 做型別檢查    |
| `pnpm test`        | 用 Vitest 執行單元測試     |

## 參與貢獻

歡迎 issue 與 PR。開始開發:

```bash
pnpm install
pnpm play          # 基于 playground 开发
pnpm type-check    # 保持类型干净
```

慣例:全程 TypeScript;保持 `src/core/**` 不相依 Vue / DOM 以便單元測試;遵循既有元件風格。提交 PR 前請先跑 `pnpm type-check`。

## 授權

[MIT](./LICENSE) © coffeefish
