import type { LocaleMessages } from "../types";

export const zhTW: LocaleMessages = {
  name: "繁體中文",
  hour12: false,
  views: { day: "日", week: "週", month: "月" },
  today: "今天",
  createNew: "新增行程",
  untitled: "未命名行程",
  confirm: "確認",
  cancel: "取消",
  titlePlaceholder: "新增標題",
  delete: "刪除行程",
  by: "建立者",
  more: "還有 {n} 項",
  monthsLong: [
    "一月", "二月", "三月", "四月", "五月", "六月",
    "七月", "八月", "九月", "十月", "十一月", "十二月",
  ],
  weekdaysShort: ["日", "一", "二", "三", "四", "五", "六"],
  weekdaysLong: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
  titleFormat: {
    day: "YYYY年M月D日 dddd",
    week: "YYYY年M月",
    month: "YYYY年M月",
  },
};
