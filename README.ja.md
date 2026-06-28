<div align="center">

# Beauty Calendar

**SF風で、ドラッグして日程を作成できる Vue 3 カレンダーコンポーネント。**

日 / 週 / 月ビュー · 日をまたぐドラッグ作成 · 移動とリサイズ · 右クリックで削除 · 国際化(i18n) · 実行時のテーマ切り替え。

[![Vue 3](https://img.shields.io/badge/Vue-3.4%2B-42b883?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-22d3ee.svg)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-a855f7.svg)](#コントリビュート)

[English](./README.md) · [简体中文](./README.zh-CN.md) · [繁體中文](./README.zh-TW.md) · **日本語**

![Beauty Calendar preview](./docs/preview.svg)

</div>

---

## なぜ

多くのカレンダーライブラリは、重厚でビジネスロジックと密結合しているか、静的なレンダリングにとどまっています。Beauty Calendar は、本当にうまく作り込むのが難しい2つのこと——**パネルのレンダリング**と**ドラッグ操作**——に専念し、どのバックエンドとも完全に分離しています。データモデルは意図的に極小に保たれており(`startTime`、`endTime`、`title`、`creator`)、それ以外のフィールドはすべて自由に拡張できます。

## 目次

- [特長](#特長)
- [動作環境](#動作環境)
- [インストール](#インストール)
- [クイックスタート](#クイックスタート)
- [ローカルでの実行](#ローカルでの実行)
- [導入ガイド](#導入ガイド)
- [インタラクション](#インタラクション)
- [API プロパティ](#api-プロパティ)
- [API イベント](#api-イベント)
- [データモデル](#データモデル)
- [テーマのカスタマイズ](#テーマのカスタマイズ)
- [国際化](#国際化)
- [ヘッドレスと高度な使い方](#ヘッドレスと高度な使い方)
- [プロジェクト構成](#プロジェクト構成)
- [スクリプト](#スクリプト)
- [コントリビュート](#コントリビュート)
- [ライセンス](#ライセンス)

## 特長

- 🗓 **日 / 週 / 月**ビュー、アニメーション付きのビュー切り替え機能
- 🖱 **ドラッグで作成**——日内では縦方向に、**列をまたいで日をまたぐ日程を作成**(日 / 週ビュー)、または月ビューではセルをまたいで
- ✅ **確認ダイアログ**——ドラッグするとフローティングカード(タイトル · 時刻 · 作成者)が表示され、確定して初めて日程が登録されます
- ↕ 既存の日程の**移動とリサイズ**(グリッドスナップ付き。週ビューでは列をまたいで日付の変更も可能)
- 🗑 **右クリックメニュー**で日程を削除
- 🧲 スマートな重なりレイアウト——日 / 週ビューではレーン配置、月ビューでは日をまたぐバー
- 🎨 **テック / SF 風テーマ**:6種類のアクセントカラープリセット + ダーク / ライト、または独自のカラー——すべて CSS 変数ベース
- 🌍 **国際化(i18n)**を内蔵(zh-CN / zh-TW / en / ja)。完全に上書き可能で、追加の依存関係は不要
- 🧩 そのまま使えるコンポーネントとして、またはヘッドレスのコア関数(`createGeometry`、`layoutDay`、`layoutMonthWeek` など)としても利用可能
- 📦 ビジネスロジックとの結合ゼロ。Peer 依存は `vue`、`dayjs`、`@vueuse/core` のみ。成果物は ESM + UMD + 型定義を含みます。

## 動作環境

- **Node** ≥ 18
- **Vue** ≥ 3.4(`defineModel` を使用)
- `.vue` 単一ファイルコンポーネントと CSS のインポートに対応するビルドツール(Vite、Vue CLI、Nuxt など)

## インストール

```bash
pnpm add beauty-calendar
# 或
npm i beauty-calendar
# 或
yarn add beauty-calendar
```

`dayjs` と `@vueuse/core` はランタイム依存です。`vue` はすでに導入済みの peer 依存です。

## クイックスタート

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

> コンポーネントは親コンテナいっぱいに広がります——外側のコンテナに高さを指定してください。

これで設定は完了です。空のグリッド上をドラッグすると作成、日程をドラッグすると移動 / リサイズ、右クリックで削除できます。作成 / 更新 / 削除は、バインドされた `events` モデルに書き戻されると同時にイベントとして発行されるため、そのまま使えるうえに常に制御可能です。

## ローカルでの実行

リポジトリをクローンして、付属の **playground**(Vite + Pinia)を起動しましょう——すべてのプロパティとインタラクションを試す最速の方法です:

```bash
git clone https://github.com/codeingforcoffee/beauty-calendar.git
cd beauty-calendar
pnpm install
pnpm play          # → http://localhost:5180
```

playground はデモ用の日程を **Pinia ストア**に保持し、テーマ、配色、言語、週の開始曜日、行の高さ、編集可能 / 作成可能などの切り替えに加え、発行されたすべてのイベントを記録するアクティビティログを提供します。

ライブラリまたは playground をビルドするには:

```bash
pnpm build         # 库 → dist/(ESM + UMD + .d.ts + css)
pnpm build:play    # 静态 playground → dist-play/
pnpm type-check    # vue-tsc 类型检查,不产出
pnpm test          # vitest 单元测试
```

## 導入ガイド

### 1. ローカルコンポーネント(推奨)

```ts
import { BeautyCalendar } from "beauty-calendar";
import "beauty-calendar/style.css";
```

### 2. グローバルプラグイン

```ts
import { createApp } from "vue";
import { BeautyCalendarPlugin } from "beauty-calendar";
import "beauty-calendar/style.css";

createApp(App).use(BeautyCalendarPlugin).mount("#app");
// 此后任意位置都可使用 <BeautyCalendar />
```

### 3. 制御あり / 制御なし

すべての状態は `v-model` です——制御したいものはバインドし、不要なものは省略します:

```vue
<BeautyCalendar
  v-model:events="events"
  v-model:view="view"        <!-- 'day' | 'week' | 'month' -->
  v-model:date="anchorDate"  <!-- 可视范围锚点 -->
  v-model:locale="locale"
/>
```

### 4. バックエンドとの連携

コンポーネントは即時のフィードバックのためにローカルの `events` モデルを直接更新し、同じ変更を発行するので、それを永続化できます。発行されるイベントを同期ポイントとして扱ってください:

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

独自の作成フロー(たとえば自前のフォームを開く)を使いたい場合は、`:confirm-create="false"` を設定して `@event-create` を処理するか、組み込みの確認ダイアログをそのまま使ってそこでタイトルを読み取ります。

## インタラクション

| ジェスチャー                 | 結果                                                |
| ---------------------------- | --------------------------------------------------- |
| 空のグリッドをドラッグ(日 / 週) | 作成——単日は縦方向に、**列をまたぐと日をまたぐ日程を作成** |
| 空のグリッドをクリック(日 / 週) | その時刻に `defaultCreateMinutes` の長さの日程を作成 |
| 月ビューでセルをまたいでドラッグ | それらの日にまたがる日程を作成(開始 = 最も近いステップ時刻) |
| 日程本体をドラッグ           | 移動(週ビューでは日付も変更)                      |
| 日程の上 / 下端をドラッグ    | リサイズ(単日の日程のみ)                          |
| 日程を右クリック             | メニューを開く → **削除**                           |
| 日付の数字 / ヘッダーをクリック | その日の「日」ビューへ移動                          |

ドラッグでの作成では、既定で**確認ダイアログ**が表示されます。<kbd>Enter</kbd> で確定、<kbd>Esc</kbd> または外側をクリックでキャンセルします。

## API プロパティ

| プロパティ             | 型                                         | 既定値     | 説明                                |
| ---------------------- | ------------------------------------------ | ---------- | ----------------------------------- |
| `v-model:events`       | `CalendarEvent[]`                          | `[]`       | レンダリングする日程(双方向)。    |
| `v-model:view`         | `'day' \| 'week' \| 'month'`               | `'week'`   | 現在のビュー。                      |
| `v-model:date`         | `number \| string \| Date`                 | 現在時刻   | 表示範囲のアンカー日付。            |
| `v-model:locale`       | `string`                                   | `'zh-CN'`  | 言語キー。                          |
| `theme`                | `string \| { accent, accent2 }`            | `'aurora'` | アクセントカラーのプリセットキー、または明示的なカラーペア。 |
| `scheme`               | `'dark' \| 'light'`                        | `'dark'`   | 配色スキーム。                      |
| `weekStart`            | `0 \| 1`                                    | `1`        | 週の開始が日曜(0)か月曜(1)か。 |
| `hourHeight`           | `number`                                    | `56`       | 1時間あたりの行の高さ(ピクセル)。 |
| `snapMinutes`          | `number`                                    | `15`       | ドラッグ時のスナップ単位(分)。   |
| `minEventMinutes`      | `number`                                    | `15`       | レンダリングされる最小の長さ。      |
| `defaultCreateMinutes` | `number`                                    | `30`       | ドラッグせずクリックで作成したときの長さ。 |
| `editable`             | `boolean`                                   | `true`     | 移動 / リサイズを許可。             |
| `creatable`            | `boolean`                                   | `true`     | ドラッグでの作成を許可。            |
| `deletable`            | `boolean`                                   | `true`     | 右クリックでの削除を許可。          |
| `confirmCreate`        | `boolean`                                   | `true`     | ドラッグ作成後に確認ダイアログを表示するか。 |
| `currentUser`          | `string`                                    | —          | 新規作成する日程に書き込む作成者の識別子。 |
| `messages`             | `Record<string, Partial<LocaleMessages>>`   | —          | 言語ごとの文言の上書き。            |
| `nowInterval`          | `number`                                    | `30000`    | 現在時刻インジケーターの更新間隔(ミリ秒)。 |

## API イベント

| イベント       | ペイロード                    | タイミング                          |
| -------------- | ----------------------------- | ----------------------------------- |
| `event-create` | `CalendarEvent`               | ドラッグ / クリックでの作成が確定したとき。 |
| `event-update` | `{ id, startTime, endTime }`  | 移動 / リサイズが完了したとき。     |
| `event-delete` | `CalendarEvent`               | メニューから日程を削除したとき。    |
| `event-click`  | `CalendarEvent`               | 日程をクリックしたとき(ドラッグではない)。 |
| `date-click`   | `Dayjs`                       | 日付の数字 / ヘッダーを選択したとき。 |

## データモデル

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

## テーマのカスタマイズ

1つのテーマは2つのアクセントカラーで構成されます。中間色のパレットは配色スキームから決まります。プリセットキー、または独自のカラーペアを使用します:

```vue
<BeautyCalendar theme="neon" scheme="dark" />
<BeautyCalendar :theme="{ accent: '#22d3ee', accent2: '#6366f1' }" scheme="light" />
```

プリセット:`aurora` · `neon` · `matrix` · `sunset` · `ice` · `gold`。

すべての視覚的な値は `.beauty-calendar` にスコープされた CSS 変数なので、自分のスタイルシートで任意の項目を上書きできます:

```css
.beauty-calendar {
  --bc-hour-height: 64px;
  --bc-radius-md: 14px;
  --bc-now: #ff3366;
}
```

## 国際化

組み込みの言語:`zh-CN`、`zh-TW`、`en`、`ja`。言語ごとに文言を上書きしたり、独自の言語を追加したりできます:

```vue
<BeautyCalendar
  locale="en"
  :messages="{ en: { createNew: 'Add', views: { week: 'Wk' } } }"
/>
```

日付のフォーマットは言語パックの `monthsLong` / `weekdaysLong` 配列で駆動されます(dayjs の locale パックは不要)。そのため、文言を上書きするとヘッダーの表示も同時にローカライズされます。まったく新しい言語を登録するには、`messages` に新しいキーで完全な `LocaleMessages` を渡し、`locale` をそれに向けるだけです。

## ヘッドレスと高度な使い方

ジオメトリとレイアウトの計算はエクスポートされており、独自のレンダラーに利用できます:

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

また、子コンポーネント内で `useCalendar()` を使うと、ライブのコンテキスト(ビュー、ジオメトリ、文言、アクション)を読み取り、自分のパーツを組み立てられます。

## プロジェクト構成

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

## スクリプト

| コマンド           | 説明                       |
| ------------------ | -------------------------- |
| `pnpm play`        | playground 開発サーバーを起動 |
| `pnpm dev`         | `pnpm play` のエイリアス   |
| `pnpm build`       | ライブラリを `dist/` にビルド |
| `pnpm build:play`  | 静的な playground をビルド  |
| `pnpm type-check`  | `vue-tsc` で型チェック     |
| `pnpm test`        | Vitest でユニットテストを実行 |

## コントリビュート

issue と PR を歓迎します。開発を始めるには:

```bash
pnpm install
pnpm play          # 基于 playground 开发
pnpm type-check    # 保持类型干净
```

規約:全面的に TypeScript を使用し、ユニットテスト可能に保つため `src/core/**` は Vue / DOM に依存させず、既存のコンポーネントのスタイルに合わせてください。PR を出す前に `pnpm type-check` を実行してください。

## ライセンス

[MIT](./LICENSE) © coffeefish
