import type { LocaleMessages } from "../types";

export const ja: LocaleMessages = {
  name: "日本語",
  hour12: false,
  views: { day: "日", week: "週", month: "月" },
  today: "今日",
  createNew: "新規予定",
  untitled: "無題の予定",
  confirm: "確認",
  cancel: "キャンセル",
  titlePlaceholder: "タイトルを追加",
  delete: "予定を削除",
  by: "作成者",
  more: "他 {n} 件",
  monthsLong: [
    "1月", "2月", "3月", "4月", "5月", "6月",
    "7月", "8月", "9月", "10月", "11月", "12月",
  ],
  weekdaysShort: ["日", "月", "火", "水", "木", "金", "土"],
  weekdaysLong: ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"],
  titleFormat: {
    day: "YYYY年M月D日 dddd",
    week: "YYYY年M月",
    month: "YYYY年M月",
  },
};
